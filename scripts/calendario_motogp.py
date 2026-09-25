#!/usr/bin/env python3
"""
Calendario de MotoGP con horarios en hora de Mexico.

Lee la API oficial de MotoGP y escribe public/calendario-motogp.json, que
es lo que pinta la pagina /calendario-motogp.

Por que existe: el calendario oficial publica las horas en la zona del
circuito, y la mitad de las carreras de la segunda parte de la temporada
se corren de madrugada o el sabado por la noche en Mexico. Quien espera el
GP de Japon el domingo se lo pierde: es el sabado a las 23:00.

Se guarda en un archivo del repo y no en la base porque no hace falta
nada mas: el workflow lo actualiza, Vercel despliega solo al ver el
commit, y no hay que crear tablas ni llaves nuevas.

    python calendario_motogp.py            # escribe el JSON
    python calendario_motogp.py --dry-run  # solo lo imprime
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx

API = "https://api.pulselive.motogp.com/motogp/v1/events"
MEXICO = ZoneInfo("America/Mexico_City")
SALIDA = Path(__file__).resolve().parent.parent / "public" / "calendario-motogp.json"

# Las sesiones que le importan a quien ve la carrera desde el sillon. El
# resto —ruedas de prensa, desfiles, entrevistas— se descarta.
SESIONES = {
    "FP1": "Práctica libre 1",
    "PR": "Práctica",
    "FP2": "Práctica libre 2",
    "Q1": "Clasificación 1",
    "Q2": "Clasificación 2",
    "SPR": "Sprint",
    "WUP": "Warm Up",
    "RAC": "Carrera",
}

# El nombre que se muestra, por el codigo corto del GP. La API los da en
# ingles y con el patrocinador pegado ("MOTUL GRAND PRIX OF JAPAN"), y el
# pais no sirve para distinguir: Jerez, Catalunya, Aragon y Valencia son
# los cuatro "Spain".
NOMBRES = {
    "THA": "Tailandia",
    "BRA": "Brasil",
    "USA": "Estados Unidos",
    "SPA": "España (Jerez)",
    "FRA": "Francia",
    "CAT": "Cataluña",
    "ITA": "Italia",
    "HUN": "Hungría",
    "CZE": "Chequia",
    "NED": "Países Bajos",
    "GER": "Alemania",
    "GBR": "Gran Bretaña",
    "ARA": "Aragón",
    "RSM": "San Marino",
    "AUT": "Austria",
    "JPN": "Japón",
    "INA": "Indonesia",
    "AUS": "Australia",
    "MAL": "Malasia",
    "QAT": "Catar",
    "POR": "Portugal",
    "VAL": "Valencia",
}

DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]


def a_mexico(iso: str) -> datetime:
    """La API entrega la hora del circuito con su desfase; aqui se traduce."""
    return datetime.fromisoformat(iso).astimezone(MEXICO)


def formato(dt: datetime) -> dict:
    return {
        "iso": dt.isoformat(),
        "dia_semana": DIAS[dt.weekday()],
        "dia": dt.day,
        "mes": MESES[dt.month - 1],
        "hora": dt.strftime("%H:%M"),
    }


def traer(anio: int) -> list[dict]:
    r = httpx.get(API, params={"seasonYear": str(anio)}, timeout=60)
    r.raise_for_status()
    return r.json()


def construir(anio: int) -> dict:
    eventos = traer(anio)

    # Los Grandes Premios, sin tests ni presentaciones de equipo.
    gps = [
        e
        for e in eventos
        if e.get("type") == "SPORT"
        and "GRAND PRIX" in (e.get("name") or "").upper()
        and e.get("date_start")
    ]
    gps.sort(key=lambda e: e["date_start"])

    ahora = datetime.now(MEXICO)
    carreras = []

    for e in gps:
        sesiones = []
        for b in e.get("broadcasts") or []:
            categoria = (b.get("category") or {}).get("acronym")
            corto = b.get("shortname")
            # Solo MotoGP: Moto2 y Moto3 corren el mismo fin de semana y
            # triplicarian la tabla.
            if categoria != "MGP" or corto not in SESIONES or not b.get("date_start"):
                continue
            dt = a_mexico(b["date_start"])
            sesiones.append({"clave": corto, "nombre": SESIONES[corto], **formato(dt)})

        sesiones.sort(key=lambda s: s["iso"])
        carrera = next((s for s in sesiones if s["clave"] == "RAC"), None)
        sprint = next((s for s in sesiones if s["clave"] == "SPR"), None)

        fin = datetime.fromisoformat(e["date_end"]).replace(tzinfo=MEXICO)

        carreras.append(
            {
                "ronda": e.get("sequence"),
                "nombre": (e.get("name") or "").title(),
                # Si aparece un GP nuevo que no este en NOMBRES, se usa el
                # nombre oficial en vez de dejar el hueco vacio.
                "pais": NOMBRES.get(e.get("shortname"))
                or (e.get("name") or "").title(),
                "bandera": (e.get("country") or "").lower(),
                "circuito": (e.get("circuit") or {}).get("name"),
                "inicio": e["date_start"][:10],
                "fin": e["date_end"][:10],
                "zona_circuito": e.get("time_zone"),
                "corrida": fin.date() < ahora.date(),
                "carrera": carrera,
                "sprint": sprint,
                "sesiones": sesiones,
            }
        )

    proxima = next((c for c in carreras if not c["corrida"]), None)

    return {
        "temporada": anio,
        "actualizado": ahora.isoformat(),
        "zona": "America/Mexico_City",
        "fuente": "https://www.motogp.com/es/calendar",
        "total": len(carreras),
        "proxima_ronda": proxima["ronda"] if proxima else None,
        "carreras": carreras,
    }


def main() -> int:
    p = argparse.ArgumentParser(description="Calendario de MotoGP en hora de México")
    p.add_argument("--anio", type=int, default=datetime.now(MEXICO).year)
    p.add_argument("--dry-run", action="store_true", help="no escribe el archivo")
    args = p.parse_args()

    print(f"🏁 Leyendo el calendario oficial de {args.anio}...")
    datos = construir(args.anio)

    if not datos["carreras"]:
        print("❌ La API no devolvio ningun Gran Premio. No se toca el archivo.")
        return 1

    corridas = sum(1 for c in datos["carreras"] if c["corrida"])
    con_horario = sum(1 for c in datos["carreras"] if c["carrera"])
    print(f"   {datos['total']} Grandes Premios · {corridas} corridos")
    print(f"   {con_horario} con horario de carrera publicado")

    prox = next((c for c in datos["carreras"] if c["ronda"] == datos["proxima_ronda"]), None)
    if prox:
        print(f"   proxima: ronda {prox['ronda']}, {prox['nombre']}")
        if prox["carrera"]:
            c = prox["carrera"]
            print(f"     carrera: {c['dia_semana']} {c['dia']} de {c['mes']}, {c['hora']} (hora de México)")

    if args.dry_run:
        print("\n🧪 Simulacro. No se escribio nada.")
        return 0

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Escrito en {SALIDA.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
