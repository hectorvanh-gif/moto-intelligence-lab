"""
Avisa por correo cuando el sitio deja de publicar.

Existe porque el agente se cayo siete dias seguidos (28 de septiembre al 4
de octubre de 2026) y nadie se entero. El dominio respondia, el calendario
se actualizaba, la portada se veia bien: lo unico que se habia detenido era
el contenido, y eso no se nota desde afuera. La falla era un NameError, o
sea que los siete runs quedaron en rojo en GitHub y el aviso automatico de
GitHub se perdio entre el correo.

Mira el resultado, no el proceso. En vez de preguntar "corrio el agente?"
pregunta "hay notas nuevas en la base?". Asi cubre de una sola vez el
reventon del script, la llave vencida de NewsAPI, el feed que cambio de
URL, Supabase caido y el run que nunca arranco. Un vigilante dentro del
workflow vigilado no puede avisar que el workflow no corrio.

Solo libreria estandar, tambien a proposito: el modo --falla lo invoca el
workflow del agente cuando algo revento, y lo que revento pudo ser el
propio `pip install`. Un avisador que necesitara httpx no arrancaria justo
el dia que hace falta.

Uso:
    python scripts/vigia.py              # revisa y avisa si no hay notas
    python scripts/vigia.py --falla "Moto News Agent"   # aviso de reventon
    python scripts/vigia.py --seco       # imprime, no manda correo

Variables:
    SUPABASE_URL, SUPABASE_SERVICE_KEY   para contar las notas
    RESEND_API_KEY                       para mandar el correo
    AVISO_PARA                           destino (por omision el gmail)
    GITHUB_RUN_URL                       liga al run, si viene de Actions
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")

# Con `or` y no con el valor por omision de get(): el workflow pasa la
# variable como cadena vacia cuando no esta definida, y entonces get()
# devuelve el vacio en vez del respaldo. Ya nos paso con NEWSLETTER_FROM.
DESTINO = os.environ.get("AVISO_PARA") or "motolab249@gmail.com"
REMITENTE = "Vigia Moto Lab <vigia@motolab249.com>"

TABLA = "moto_news"

# El agente corre a las 9:00 de Mexico y el vigia a las 10:30. Con 26 horas
# de ventana, un dia sin publicar no dispara el aviso todavia: las notas de
# ayer a las 9:00 caen dentro. Hacen falta dos dias callados. Un dia flojo
# de noticias pasa; siete dias de silencio es lo que estamos evitando.
VENTANA_HORAS = 26

# Para distinguir "dia flojo" de "roto" sin abrir nada: el correo trae
# tambien el conteo de la semana.
CONTEXTO_DIAS = 7


def _pedir(url: str, params: dict) -> list:
    """GET a PostgREST. Devuelve la lista de renglones."""
    completa = f"{url}?{urllib.parse.urlencode(params)}"
    pet = urllib.request.Request(
        completa,
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
        },
    )
    with urllib.request.urlopen(pet, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def contar_desde(horas: int) -> int:
    desde = (datetime.now(timezone.utc) - timedelta(hours=horas)).isoformat()
    renglones = _pedir(
        f"{SUPABASE_URL}/rest/v1/{TABLA}",
        {"select": "id", "created_at": f"gte.{desde}", "limit": "1000"},
    )
    return len(renglones)


def enviar(asunto: str, cuerpo: str, seco: bool) -> bool:
    if seco:
        print(f"[seco] Para: {DESTINO}\n[seco] Asunto: {asunto}\n\n{cuerpo}")
        return True
    if not RESEND_KEY:
        print("Falta RESEND_API_KEY: no se puede avisar", file=sys.stderr)
        return False

    datos = json.dumps(
        {
            "from": REMITENTE,
            "to": [DESTINO],
            "subject": asunto,
            "text": cuerpo,
        }
    ).encode("utf-8")
    pet = urllib.request.Request(
        "https://api.resend.com/emails",
        data=datos,
        headers={
            "Authorization": f"Bearer {RESEND_KEY}",
            "Content-Type": "application/json",
            # Hace falta. La API de Resend esta detras de Cloudflare, que
            # responde 403 con "error code: 1010" a la firma por omision de
            # urllib ("Python-urllib/3.11") antes de que la peticion llegue
            # a Resend. El boletin no se topa con esto porque usa httpx.
            # Con cualquier User-Agent propio pasa.
            "User-Agent": "MotoLab249-Vigia/1.0",
        },
    )
    try:
        with urllib.request.urlopen(pet, timeout=20) as r:
            print(f"Aviso enviado a {DESTINO} ({r.status})")
            return True
    except urllib.error.HTTPError as e:
        print(f"Resend respondio {e.code}: {e.read().decode()}", file=sys.stderr)
        return False


def aviso_de_falla(workflow: str, seco: bool) -> int:
    """Lo llama el workflow que se cayo, con if: failure()."""
    run = os.environ.get("GITHUB_RUN_URL", "")
    cuerpo = (
        f"El workflow \"{workflow}\" terminó en error.\n\n"
        f"{'Run: ' + run if run else 'Revisa la pestaña Actions del repo.'}\n\n"
        "Mientras siga en rojo, el sitio no publica notas nuevas."
    )
    ok = enviar(f"Moto Lab: falló {workflow}", cuerpo, seco)
    return 0 if ok else 1


SITIO = "https://motolab249.com"
UA_PERSONA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
UA_GOOGLE = (
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
)

# Por debajo de esto, la pagina de una nota no trae el cuerpo: alguien
# recorto el prerender a una ficha. Una nota normal pasa de 4 KB.
MINIMO_NOTA = 2000


def _bajar(ruta: str, ua: str) -> str:
    pet = urllib.request.Request(f"{SITIO}{ruta}", headers={"User-Agent": ua})
    with urllib.request.urlopen(pet, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def _iconos(html: str) -> set[str]:
    """Los href de los <link rel="icon"> y apple-touch-icon, sin dominio."""
    encontrados = set()
    for m in re.finditer(r'<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>', html):
        href = re.search(r'href="([^"]+)"', m.group(0))
        if href:
            encontrados.add(href.group(1).replace(SITIO, ""))
    return encontrados


def _etiqueta(html: str, patron: str) -> str:
    m = re.search(patron, html)
    return m.group(1).strip() if m else ""


def revisar_paridad() -> list[str]:
    """
    Compara lo que recibe Google contra lo que recibe una persona.

    Existe por un error propio. El sitio es una SPA, asi que a los
    rastreadores se les sirve el HTML ya armado desde api/tarjeta.js, un
    <head> escrito a mano. El 5 de octubre de 2026 se escribio sin los
    <link rel="icon"> y durante dos dias Google rastreo el sitio sin saber
    cual era el icono, siguiendo con el corazon de la plantilla con la que
    nacio el sitio. El archivo correcto estaba publicado todo el tiempo.

    Son dos codigos distintos pintando la misma pagina, asi que se pueden
    separar otra vez. Esto lo detecta al dia siguiente en vez de a las dos
    semanas, y de paso vigila que lo servido a Google siga siendo lo mismo
    que ve la gente, que es la condicion que hace legitimo el prerender.
    """
    problemas: list[str] = []

    try:
        persona = _bajar("/", UA_PERSONA)
        google = _bajar("/", UA_GOOGLE)
    except Exception as e:
        return [f"No se pudo comparar la portada: {type(e).__name__}: {e}"]

    # 1. Los iconos que declara la pagina real tienen que estar tambien en
    #    la que recibe Google. Este es el error que ya paso.
    faltan = _iconos(persona) - _iconos(google)
    if faltan:
        problemas.append(
            "A Google le falta declaracion de icono: "
            + ", ".join(sorted(faltan))
            + ". Mientras falte, los resultados de busqueda siguen con el "
            "icono viejo aunque el archivo este bien."
        )

    # 2. Cada pagina con su propio titulo. Que todas compartieran el de la
    #    portada fue lo que hundio la indexacion la primera vez.
    try:
        nota = _ultima_nota()
        rutas = ["/", "/enduro"] + ([f"/noticias/{nota}"] if nota else [])
        titulos = {}
        for ruta in rutas:
            html = _bajar(ruta, UA_GOOGLE)
            titulos[ruta] = _etiqueta(html, r"<title>([^<]*)</title>")

            if not _etiqueta(html, r'rel="canonical" href="([^"]+)"'):
                problemas.append(f"{ruta} llega a Google sin canonical.")

            # 3. Y con cuerpo. Si una nota adelgaza, alguien recorto el
            #    prerender a una ficha, y entonces se le esta sirviendo a
            #    Google algo distinto de lo que ve la gente.
            if ruta.startswith("/noticias/") and len(html) < MINIMO_NOTA:
                problemas.append(
                    f"{ruta} solo trae {len(html)} bytes para Google: "
                    "parece una ficha sin el cuerpo de la nota."
                )

        repetidos = [r for r, t in titulos.items() if list(titulos.values()).count(t) > 1]
        if repetidos:
            problemas.append(
                "Estas paginas comparten titulo para Google: "
                + ", ".join(sorted(repetidos))
                + ". Asi las trata como duplicados."
            )
    except Exception as e:
        problemas.append(f"No se pudo comparar las paginas: {type(e).__name__}: {e}")

    return problemas


def _ultima_nota() -> int | None:
    try:
        filas = _pedir(
            f"{SUPABASE_URL}/rest/v1/{TABLA}",
            {"select": "id", "order": "created_at.desc", "limit": "1"},
        )
        return filas[0]["id"] if filas else None
    except Exception:
        return None


def revisar(seco: bool) -> int:
    try:
        recientes = contar_desde(VENTANA_HORAS)
        semana = contar_desde(CONTEXTO_DIAS * 24)
    except Exception as e:
        # No poder contar tambien es noticia: significa que Supabase no
        # contesta, y si no contesta al vigia tampoco le contesta al sitio.
        cuerpo = (
            "El vigía no pudo contar las notas en Supabase.\n\n"
            f"{type(e).__name__}: {e}\n\n"
            "Puede ser Supabase caído o la llave de servicio vencida. "
            "Si Supabase no contesta, la portada tampoco carga."
        )
        enviar("Moto Lab: no se pudo revisar la base", cuerpo, seco)
        return 1

    print(f"Notas en las ultimas {VENTANA_HORAS}h: {recientes}")
    print(f"Notas en los ultimos {CONTEXTO_DIAS} dias: {semana}")

    # Lo que recibe Google contra lo que recibe una persona.
    paridad = revisar_paridad()
    for p in paridad:
        print(f"  PARIDAD: {p}")
    if not paridad:
        print("Paridad con Google: bien")

    if paridad:
        cuerpo = (
            "Lo que recibe Google ya no es lo mismo que ve una persona:\n\n"
            + "\n\n".join(f"- {p}" for p in paridad)
            + "\n\nEl sitio es una SPA y a los rastreadores se les sirve el "
            "HTML armado desde api/tarjeta.js, que es un <head> escrito a "
            "mano. Si alguien agregó algo a index.html, hay que agregarlo "
            "ahí también."
        )
        enviar("Moto Lab: Google ve algo distinto que la gente", cuerpo, seco)

    if recientes > 0:
        return 1 if paridad else 0

    cuerpo = (
        f"No hay notas nuevas en las últimas {VENTANA_HORAS} horas.\n\n"
        f"En los últimos {CONTEXTO_DIAS} días se publicaron {semana}.\n\n"
        + (
            "El conteo de la semana también está en cero: el agente lleva "
            "días sin publicar, no es un día flojo de noticias.\n\n"
            if semana == 0
            else "La semana sigue con notas, así que puede ser un día flojo "
            "o algo que se rompió apenas.\n\n"
        )
        + "Revisa el último run de \"Moto News Agent\" en la pestaña "
        "Actions del repo.\n\n"
        "Dos cosas que ya pasaron y se ven igual desde afuera: el script "
        "revienta y el run queda en rojo, o el run queda en verde y no "
        "encuentra artículos porque una llave venció."
    )
    enviar("Moto Lab: el sitio no está publicando", cuerpo, seco)
    return 1


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--falla", metavar="WORKFLOW", help="avisar de un reventon")
    p.add_argument("--seco", action="store_true", help="no mandar correo")
    args = p.parse_args()

    if args.falla:
        return aviso_de_falla(args.falla, args.seco)

    if not SUPABASE_URL or not SERVICE_KEY:
        print("Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY", file=sys.stderr)
        return 2
    return revisar(args.seco)


if __name__ == "__main__":
    sys.exit(main())
