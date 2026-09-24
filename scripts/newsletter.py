#!/usr/bin/env python3
"""
Boletin semanal de Moto Lab 249.

Junta las notas de los ultimos dias, arma un correo y lo manda por Resend
a los suscriptores de Supabase.

Por defecto NO envia: hay que pasar --enviar. Un boletin mal armado no se
puede deshacer, asi que el simulacro es el comportamiento normal.

    python newsletter.py                      # simulacro, escribe boletin.html
    python newsletter.py --solo tu@correo.com # prueba a una sola direccion
    python newsletter.py --enviar             # a toda la lista

Variables de entorno:
    RESEND_API_KEY        llave de Resend
    SUPABASE_URL          proyecto de Supabase
    SUPABASE_SERVICE_KEY  llave de servicio (la lista de correos esta
                          protegida por RLS y la anonima no la puede leer)
    NEWSLETTER_FROM       remitente. Mientras el dominio no este verificado
                          en Resend, usar "Moto Lab 249 <onboarding@resend.dev>",
                          que solo puede escribirle al dueno de la cuenta.
"""

import argparse
import html
import os
import sys
import unicodedata
from datetime import datetime, timedelta, timezone

import httpx

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
# Con `or` y no con el valor por omision de os.environ.get: el workflow
# pasa la variable como cadena vacia cuando no esta definida en GitHub, y
# entonces get() devuelve el vacio en vez del respaldo.
REMITENTE = (
    os.environ.get("NEWSLETTER_FROM")
    or "Moto Lab 249 <onboarding@resend.dev>"
)

SITIO = "https://motolab249.com"
DESCARTADO = "DESCARTADO"

# El remitente es boletin@motolab249.com, que no tiene buzon: Resend puede
# enviar desde cualquier direccion del dominio verificado, pero nadie
# recibe ahi. Como el correo pide "responde BAJA", las respuestas tienen
# que caer en un buzon real.
RESPONDER_A = os.environ.get("NEWSLETTER_REPLY_TO") or "motolab249@gmail.com"

# Paleta del sitio, para que el correo se sienta del mismo lugar.
NEGRO, CARTA, ROJO = "#0a0a0a", "#141414", "#ef4444"
TEXTO, TENUE, LINEA = "#fafafa", "#a1a1aa", "#27272a"


def cabeceras_db() -> dict:
    return {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    }


def traer_suscriptores() -> list[str]:
    r = httpx.get(
        f"{SUPABASE_URL}/rest/v1/subscribers",
        headers=cabeceras_db(),
        params={"select": "*", "limit": "5000"},
        timeout=30,
    )
    r.raise_for_status()
    correos = []
    for fila in r.json():
        correo = (fila.get("email") or "").strip().lower()
        if correo and correo not in correos:
            correos.append(correo)
    return correos


def traer_notas(dias: int, cuantas: int) -> list[dict]:
    desde = (datetime.now(timezone.utc) - timedelta(days=dias)).isoformat()
    r = httpx.get(
        f"{SUPABASE_URL}/rest/v1/moto_news",
        headers=cabeceras_db(),
        params={
            "select": "id,title,summary,category,image_url,created_at,votes",
            "category": f"neq.{DESCARTADO}",
            "created_at": f"gte.{desde}",
            "order": "created_at.desc",
            "limit": str(cuantas),
        },
        timeout=30,
    )
    r.raise_for_status()
    return [n for n in r.json() if (n.get("title") or "").strip()]


# Palabras que aparecen en casi todos los titulares y no distinguen una
# historia de otra.
VACIAS = {
    "de", "del", "la", "el", "los", "las", "en", "y", "a", "con", "por",
    "para", "su", "sus", "un", "una", "que", "se", "al", "lo", "es", "tras",
    "sobre", "mas", "moto", "motogp", "motos",
}


def _fichas(titulo: str) -> set[str]:
    """
    Palabras significativas del titular, sin acentos ni puntuacion y
    recortadas a 6 letras.

    El recorte hace de raiz burda y es lo que decide la comparacion:
    "campeona" y "campeones" son la misma historia, igual que "mundial" y
    "mundiales", pero como palabras completas no coinciden nunca. Sin el
    recorte, dos notas del titulo de Daniela Guillen entraban las dos.
    """
    t = unicodedata.normalize("NFD", (titulo or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = "".join(c if c.isalnum() or c.isspace() else " " for c in t)
    return {p[:6] for p in t.split() if len(p) > 2 and p not in VACIAS}


def misma_historia(a: str, b: str) -> bool:
    """
    Dos titulares que cuentan lo mismo.

    El agente deduplica por URL, asi que la misma historia entra tantas
    veces como medios la publiquen. En el sitio molesta; en un boletin de
    seis notas es la mitad del correo.
    """
    fa, fb = _fichas(a), _fichas(b)
    if not fa or not fb:
        return False
    comunes = len(fa & fb)

    # Dos condiciones, y las dos hacen falta.
    #
    # El 0.35 sobre el titular mas corto es bajo a proposito: dos medios
    # cuentan la misma historia con palabras distintas. Con 0.5 entraban
    # las dos versiones del fichaje de Chantra por Honda, que solo
    # comparten "chantra" y "honda".
    #
    # Y hacen falta al menos dos palabras compartidas, no solo el
    # porcentaje: un titular con dos palabras significativas que comparta
    # una sola ya daria 0.5, y se fusionarian dos historias distintas por
    # coincidir en una marca.
    return comunes >= 2 and comunes / min(len(fa), len(fb)) >= 0.35


def elegir(notas: list[dict], total: int, por_categoria: int) -> list[dict]:
    """
    Las mas recientes, sin pasar del tope por categoria y sin repetir
    historia.

    Sin tope el boletin se llena de MotoGP: son 393 de las 762 notas de la
    base, asi que las seis mas recientes casi siempre son del mismo tema.
    """
    cuenta: dict[str, int] = {}
    elegidas: list[dict] = []
    for n in notas:
        c = (n.get("category") or "NOTICIA").strip()
        if cuenta.get(c, 0) >= por_categoria:
            continue
        titulo = n.get("title") or ""
        if any(misma_historia(titulo, e.get("title") or "") for e in elegidas):
            continue
        elegidas.append(n)
        cuenta[c] = cuenta.get(c, 0) + 1
        if len(elegidas) >= total:
            break
    return elegidas


def mas_votadas(
    candidatas: list[dict], ya_elegidas: list[dict], cuantas: int = 3
) -> list[dict]:
    """
    Las que mas votos juntaron, sin repetir las que ya van en el correo.

    Repetir una nota dentro del mismo boletin es el mismo defecto que
    arreglamos con el deduplicado: el lector la lee dos veces y el correo
    se siente relleno.
    """
    dentro = {n["id"] for n in ya_elegidas}
    con_votos = [
        n for n in candidatas if n["id"] not in dentro and (n.get("votes") or 0) > 0
    ]
    con_votos.sort(key=lambda n: n.get("votes") or 0, reverse=True)

    # Hay que descartar tambien por historia, no solo por id. Excluyendo
    # solo el id, la version repetida que el deduplicado saco de las seis
    # volvia a entrar por aqui: el lector veia el mismo fichaje de Chantra
    # dos veces en el mismo correo, en dos secciones distintas.
    elegidas: list[dict] = []
    for n in con_votos:
        titulo = n.get("title") or ""
        previas = ya_elegidas + elegidas
        if any(misma_historia(titulo, p.get("title") or "") for p in previas):
            continue
        elegidas.append(n)
        if len(elegidas) >= cuantas:
            break
    return elegidas


def asunto_de(notas: list[dict]) -> str:
    """
    El titular de la nota principal, cortado en palabra completa.

    No lleva "Moto Lab 249" adelante: eso ya lo dice el nombre del
    remitente, y en movil Gmail solo muestra unos 45 caracteres del asunto.
    Gastarlos en la marca es gastarlos en algo que el lector ya vio.
    """
    t = " ".join((notas[0].get("title") or "").split())
    if len(t) <= 48:
        return t
    return t[:48].rsplit(" ", 1)[0] + "…"


def bloque_votadas(votadas: list[dict]) -> str:
    """
    El ranking de los lectores.

    Si nadie voto, el bloque no existe: un "lo mas votado" vacio le dice al
    lector que nadie participa, igual que en el sitio.
    """
    if not votadas:
        return ""

    filas = []
    for n in votadas:
        titulo = html.escape((n.get("title") or "").strip())
        enlace = f"{SITIO}/noticias/{n['id']}"
        votos = n.get("votes") or 0
        filas.append(
            f"""
        <tr><td style="padding:9px 0;">
          <span style="display:inline-block;min-width:34px;color:{ROJO};
            font-size:13px;font-weight:700;">{votos} &#128293;</span>
          <a href="{enlace}" style="color:{TEXTO};font-size:15px;
            text-decoration:none;">{titulo}</a>
        </td></tr>"""
        )

    return f"""
    <tr><td style="padding:4px 30px 30px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="border-top:1px solid {LINEA};">
        <tr><td style="padding:24px 0 6px;">
          <span style="color:{ROJO};font-size:12px;font-weight:700;
            letter-spacing:2px;">LO MAS VOTADO POR LOS LECTORES</span>
        </td></tr>
        {"".join(filas)}
      </table>
    </td></tr>"""


def armar_html(notas: list[dict], votadas: list[dict] | None = None) -> str:
    """El correo. Estilos en linea, que es lo unico que respetan Gmail y Outlook."""
    bloques = []
    for i, n in enumerate(notas):
        titulo = html.escape((n.get("title") or "").strip())
        resumen = html.escape((n.get("summary") or "").strip())
        categoria = html.escape((n.get("category") or "NOTICIA").strip())
        enlace = f"{SITIO}/noticias/{n['id']}"
        borde = "" if i == 0 else f"border-top:1px solid {LINEA};"

        bloques.append(
            f"""
            <tr><td style="padding:26px 0;{borde}">
              <span style="display:inline-block;background:{ROJO};color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1px;
                padding:3px 9px;border-radius:3px;">{categoria}</span>
              <h2 style="margin:14px 0 10px;font-size:20px;line-height:1.3;">
                <a href="{enlace}" style="color:{TEXTO};text-decoration:none;">{titulo}</a>
              </h2>
              <p style="margin:0 0 14px;color:{TENUE};font-size:15px;line-height:1.6;">{resumen}</p>
              <a href="{enlace}" style="color:{ROJO};font-size:13px;
                font-weight:700;letter-spacing:1px;text-decoration:none;">LEER LA NOTA &rarr;</a>
            </td></tr>"""
        )

    hoy = datetime.now(timezone.utc).strftime("%d/%m/%Y")

    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:{NEGRO};
  font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background:{NEGRO};padding:28px 14px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0"
    style="max-width:600px;background:{CARTA};border:1px solid {LINEA};border-radius:8px;">

    <tr><td style="padding:30px 30px 8px;border-bottom:1px solid {LINEA};">
      <span style="color:{TEXTO};font-size:22px;font-weight:800;letter-spacing:2px;">MOTO LAB</span>
      <span style="color:{ROJO};font-size:22px;font-weight:800;letter-spacing:2px;">249</span>
      <p style="margin:8px 0 22px;color:{TENUE};font-size:12px;letter-spacing:1px;">
        LO QUE PASO EN EL MOTOCICLISMO &middot; {hoy}
      </p>
    </td></tr>

    <tr><td style="padding:4px 30px 26px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        {"".join(bloques)}
      </table>
    </td></tr>

    {bloque_votadas(votadas or [])}

    <tr><td style="padding:22px 30px 30px;border-top:1px solid {LINEA};">
      <a href="{SITIO}" style="color:{ROJO};font-size:13px;font-weight:700;
        letter-spacing:1px;text-decoration:none;">VER TODO EN MOTOLAB249.COM &rarr;</a>
      <p style="margin:18px 0 0;color:{TENUE};font-size:11px;line-height:1.6;">
        Recibes esto porque te suscribiste en motolab249.com.<br>
        Para darte de baja, responde a este correo con la palabra BAJA.
      </p>
    </td></tr>

  </table>
</td></tr></table>
</body></html>"""


def enviar(destino: str, asunto: str, cuerpo: str) -> tuple[bool, str]:
    r = httpx.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": REMITENTE,
            "to": [destino],
            "reply_to": RESPONDER_A,
            "subject": asunto,
            "html": cuerpo,
            # Gmail muestra su propio boton de baja cuando ve esta cabecera.
            "headers": {
                "List-Unsubscribe": f"<mailto:{RESPONDER_A}?subject=BAJA>"
            },
        },
        timeout=30,
    )
    if r.status_code in (200, 201):
        return True, r.json().get("id", "")
    return False, f"{r.status_code}: {r.text[:140]}"


def main() -> int:
    p = argparse.ArgumentParser(description="Boletin semanal de Moto Lab 249")
    p.add_argument("--dias", type=int, default=7, help="ventana de notas")
    p.add_argument("--notas", type=int, default=6, help="cuantas notas incluir")
    p.add_argument(
        "--por-categoria",
        type=int,
        default=2,
        help="tope de notas por categoria (0 = sin tope)",
    )
    p.add_argument("--enviar", action="store_true", help="enviar de verdad")
    p.add_argument("--solo", help="enviar solo a esta direccion")
    args = p.parse_args()

    if not SUPABASE_URL or not SERVICE_KEY:
        print("❌ Falta SUPABASE_URL o SUPABASE_SERVICE_KEY")
        return 1
    if args.enviar and not RESEND_KEY:
        print("❌ Falta RESEND_API_KEY")
        return 1

    print(f"📰 Buscando notas de los ultimos {args.dias} dias...")
    # Se piden muchas mas de las que caben: el tope por categoria descarta
    # buena parte, y con pocas candidatas el boletin saldria corto.
    candidatas = traer_notas(args.dias, 60)
    if not candidatas:
        print("   Sin notas en la ventana. No se manda un boletin vacio.")
        return 0

    tope = args.por_categoria if args.por_categoria > 0 else len(candidatas)
    notas = elegir(candidatas, args.notas, tope)

    print(f"   {len(candidatas)} candidatas → {len(notas)} elegidas:")
    for n in notas:
        print(f"     [{n.get('category')}] {(n.get('title') or '')[:64]}")

    votadas = mas_votadas(candidatas, notas)
    if votadas:
        print(f"   + {len(votadas)} en el ranking de los lectores:")
        for n in votadas:
            print(f"     {n.get('votes')} votos · {(n.get('title') or '')[:56]}")
    else:
        print("   sin votos en la ventana: el ranking no se incluye")

    cuerpo = armar_html(notas, votadas)
    asunto = asunto_de(notas)

    if args.solo:
        destinos = [args.solo.strip().lower()]
    else:
        destinos = traer_suscriptores()
    print(f"\n✉️  Destinatarios: {len(destinos)}")

    if not args.enviar:
        with open("boletin.html", "w", encoding="utf-8") as f:
            f.write(cuerpo)
        print("\n🧪 Simulacro. Nada enviado.")
        print(f"   Asunto: {asunto}")
        print("   Vista previa escrita en boletin.html")
        return 0

    if not destinos:
        print("   La lista esta vacia. Nada que enviar.")
        return 0

    enviados = fallidos = 0
    for correo in destinos:
        ok, detalle = enviar(correo, asunto, cuerpo)
        if ok:
            enviados += 1
            print(f"   ✅ {correo}")
        else:
            fallidos += 1
            print(f"   ❌ {correo} — {detalle}")

    print(f"\n✅ Listo. {enviados} enviados · {fallidos} con error")
    return 0 if fallidos == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
