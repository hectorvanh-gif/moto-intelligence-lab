#!/usr/bin/env python3
"""
Moto Lab 249 — Reprocesamiento de notas viejas

Contexto: durante meses el agente llamo a Claude y tiro la respuesta, porque
json.loads fallaba en el 100% de los casos. El resultado es que cada nota
guardada tiene el titular crudo de la fuente, sus primeros 250 caracteres como
"resumen", el texto de la fuente como cuerpo y la categoria NOTICIA.

Este script vuelve a pasar esas notas por Claude, ahora con el parseo
arreglado, y escribe titulo, resumen, cuerpo propio y categoria.

Solo toca las filas que traen la firma exacta del fallback:

    ig_title == title[:55].upper()

Por eso es idempotente: una nota ya reprocesada no vuelve a entrar, y correr
el script dos veces no degrada nada.

No regenera las imagenes de Instagram. Las que ya existen se publicaron o se
van a publicar con su texto viejo; rehacer 762 imagenes no vale la pena.

Uso:
    python scripts/backfill.py --dry-run --limit 5     # ver que haria
    python scripts/backfill.py --limit 50              # un lote
    python scripts/backfill.py                         # todo lo pendiente
"""

import argparse
import sys
import time

import httpx

# La consola de Windows usa cp1252 y truena al imprimir emojis. En CI no pasa,
# pero esto permite correrlo a mano desde una maquina local.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from news_agent import (
    SUPABASE_URL,
    TABLE_PATH,
    clean,
    db_headers,
    summarize_with_claude,
)

# Categoria para las notas que el filtro de relevancia rechaza. No se borran
# para no dejar URLs muertas, pero el sitio y el sitemap las excluyen.
DESCARTADA = "DESCARTADO"

PAGE = 500


def tiene_firma_de_fallback(row: dict) -> bool:
    """La nota nunca recibio la respuesta de Claude."""
    title = row.get("title") or ""
    ig_title = row.get("ig_title") or ""
    return bool(title) and ig_title == title[:55].upper()


def traer_pendientes(limite: int | None) -> list[dict]:
    """Baja las notas y se queda con las que todavia traen la firma."""
    pendientes: list[dict] = []
    offset = 0

    while True:
        try:
            r = httpx.get(
                f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}",
                headers=db_headers(),
                params={
                    "select": "id,title,content,summary,ig_title",
                    "order": "created_at.desc",
                    "limit": str(PAGE),
                    "offset": str(offset),
                },
                timeout=30,
            )
        except Exception as e:
            print(f"❌ Error bajando notas: {e}")
            break

        if r.status_code != 200:
            print(f"❌ DB fetch {r.status_code}: {r.text[:150]}")
            break

        lote = r.json()
        if not lote:
            break

        pendientes.extend(row for row in lote if tiene_firma_de_fallback(row))
        if limite and len(pendientes) >= limite:
            return pendientes[:limite]

        if len(lote) < PAGE:
            break
        offset += PAGE

    return pendientes


def actualizar(article_id: int, campos: dict) -> bool:
    try:
        r = httpx.patch(
            f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}?id=eq.{article_id}",
            headers=db_headers(),
            json=campos,
            timeout=30,
        )
        if r.status_code in (200, 204):
            return True
        print(f"    ❌ PATCH {r.status_code}: {r.text[:120]}")
    except Exception as e:
        print(f"    ❌ Error al actualizar: {e}")
    return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="cuantas notas procesar")
    ap.add_argument("--dry-run", action="store_true", help="no escribe nada")
    ap.add_argument("--sleep", type=float, default=0.4, help="pausa entre llamadas")
    args = ap.parse_args()

    print("🏍️  Moto Lab 249 — reprocesamiento de notas")
    print(f"    modo: {'SIMULACRO (no escribe)' if args.dry_run else 'ESCRITURA'}\n")

    print("📥 Buscando notas con la firma del fallback...")
    pendientes = traer_pendientes(args.limit)
    print(f"    {len(pendientes)} notas por reprocesar\n")

    if not pendientes:
        print("Nada pendiente. Listo.")
        return 0

    hechas = descartadas = fallidas = 0

    for i, row in enumerate(pendientes, 1):
        titulo_viejo = (row.get("title") or "")[:60]
        print(f"  [{i}/{len(pendientes)}] #{row['id']} {titulo_viejo}...")

        # El material de entrada es lo que se guardo de la fuente.
        material = clean(row.get("content") or row.get("summary") or row.get("title"))
        if not material:
            print("    ⏭️  sin material para reescribir")
            fallidas += 1
            continue

        try:
            procesado = summarize_with_claude(
                {"title": clean(row.get("title")), "content": material}
            )
        except Exception as e:
            print(f"    ❌ Claude: {e}")
            fallidas += 1
            time.sleep(2)
            continue

        if procesado is None:
            print("    🚫 el filtro la rechaza: no es de motos")
            if not args.dry_run:
                actualizar(row["id"], {"category": DESCARTADA})
            descartadas += 1
            time.sleep(args.sleep)
            continue

        cuerpo = procesado.get("cuerpo") or ""
        campos = {
            "title": (procesado.get("title") or row["title"])[:80],
            "summary": (procesado.get("summary") or "")[:500],
            "category": procesado.get("category", "NOTICIA"),
            "ig_title": (procesado.get("ig_title") or "")[:55],
            "ig_caption": (procesado.get("ig_caption") or "")[:120],
        }
        # El cuerpo solo se sobrescribe si Claude redacto uno. Si no, se deja
        # el material crudo: la pagina del articulo no lo muestra.
        if cuerpo:
            campos["content"] = cuerpo[:5000]

        print(f"    ✅ [{campos['category']}] {campos['title'][:60]}")
        if args.dry_run:
            print(f"       resumen: {campos['summary'][:90]}")
            print(f"       cuerpo : {cuerpo[:90]}")
        else:
            if not actualizar(row["id"], campos):
                fallidas += 1
                continue

        hechas += 1
        time.sleep(args.sleep)

    print(
        f"\n✅ Listo. {hechas} reprocesadas · {descartadas} descartadas · "
        f"{fallidas} con error"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
