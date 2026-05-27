#!/usr/bin/env python3
"""
Moto Intelligence Lab - News Agent
Fetches motorcycle news from RSS feeds, summarizes with Claude, saves to Supabase.
"""

import os
import json
import re
import feedparser
import httpx
import anthropic
from datetime import datetime, timezone, timedelta
from urllib.parse import quote

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
TABLE_NAME = "moto_news"
TABLE_PATH = quote(TABLE_NAME, safe="")
MAX_ARTICLES_PER_RUN = 15

# User-Agent para que los sitios no bloqueen las peticiones
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; MotoNewsBot/1.0; +https://github.com)"}

RSS_FEEDS = [
    # Bing News RSS — agrega muchas fuentes, no bloquea servidores
    ("Bing:motocicletas",     "https://www.bing.com/news/search?q=motocicletas+2025&format=rss&setlang=es"),
    ("Bing:MotoGP",           "https://www.bing.com/news/search?q=MotoGP+2025&format=rss&setlang=es"),
    ("Bing:motos electricas", "https://www.bing.com/news/search?q=motos+electricas+2025&format=rss&setlang=es"),
    ("Bing:superbike",        "https://www.bing.com/news/search?q=superbike+moto+2025&format=rss&setlang=es"),
    ("Bing:nuevas motos",     "https://www.bing.com/news/search?q=nuevas+motocicletas+lanzamiento&format=rss&setlang=es"),
    ("Bing:motociclismo",     "https://www.bing.com/news/search?q=motociclismo+noticias&format=rss&setlang=es"),
    # Feeds directos españoles
    ("motociclismo.es",       "https://www.motociclismo.es/feed/"),
    ("moto1pro.com",          "https://www.moto1pro.com/feed/"),
    ("motofichas.com",        "https://www.motofichas.com/feed/"),
    ("masmoto.es",            "https://www.masmoto.es/feed/"),
    ("motorpasionmoto.com",   "https://www.motorpasionmoto.com/feeds/posts/default"),
    ("formulamoto.es",        "https://www.formulamoto.es/feed/"),
    ("motorsport.com ES",     "https://es.motorsport.com/rss/moto/news/"),
    ("elperiodicodelmoto.com","https://www.elperiodicodelmoto.com/feed/"),
    ("solo-moto.com",         "https://www.solo-moto.com/feed/"),
]


def db_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


def fetch_recent_articles(hours: int = 168) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    articles = []
    seen_titles: set[str] = set()

    for name, feed_url in RSS_FEEDS:
        try:
            # Fetch con timeout y User-Agent para evitar bloqueos
            r = httpx.get(feed_url, headers=HEADERS, timeout=15, follow_redirects=True)
            feed = feedparser.parse(r.text)

            count = 0
            for entry in feed.entries:
                title = entry.get("title", "").strip()
                if not title or title in seen_titles:
                    continue

                pub_date = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub_date = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    pub_date = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)

                # Saltar solo si tiene fecha Y es más viejo que el límite
                if pub_date and pub_date < cutoff:
                    continue

                content = ""
                if hasattr(entry, "content"):
                    content = entry.content[0].value
                elif hasattr(entry, "summary"):
                    content = entry.summary

                content_clean = re.sub(r"<[^>]+>", " ", content).strip()

                seen_titles.add(title)
                count += 1
                articles.append({
                    "title": title,
                    "link": entry.get("link", ""),
                    "content": content_clean or title,
                    "image_url": _extract_image(entry, content),
                })

            print(f"   [{name}] → {count} artículos")

        except Exception as e:
            print(f"   [{name}] ⚠️  Error: {e}")

    return articles


def _extract_image(entry, raw_content: str) -> str | None:
    if hasattr(entry, "media_content") and entry.media_content:
        for m in entry.media_content:
            if m.get("type", "").startswith("image"):
                return m.get("url")
    if hasattr(entry, "enclosures") and entry.enclosures:
        for enc in entry.enclosures:
            if enc.get("type", "").startswith("image"):
                return enc.get("href")
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', raw_content)
    if match:
        return match.group(1)
    return None


def get_existing_urls() -> set[str]:
    """Fetch saved source URLs to avoid duplicates (URL is more reliable than title)."""
    try:
        r = httpx.get(
            f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}",
            headers=db_headers(),
            params={"select": "source_url", "order": "created_at.desc", "limit": "500"},
        )
        if r.status_code == 200:
            return {row["source_url"] for row in r.json() if row.get("source_url")}
        print(f"  ⚠️  DB fetch status: {r.status_code} — {r.text[:200]}")
    except Exception as e:
        print(f"  ⚠️  Could not fetch existing urls: {e}")
    return set()


def summarize_with_claude(article: dict) -> dict:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = f"""Eres editor de un portal de noticias de motociclismo en español.
Analiza este artículo y responde SOLO con un JSON válido (sin texto adicional) con estos campos:
- "title": título atractivo en español, máx 80 caracteres
- "summary": resumen claro y directo en español, 2-3 oraciones, máx 250 caracteres
- "category": una de estas: MOTOGP | SUPERBIKE | ENDURO | AVENTURA | NAKED | SPORT | ELECTRICA | NOTICIA

Artículo:
Título: {article['title']}
Contenido: {article['content'][:1500]}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=350,
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        return json.loads(message.content[0].text)
    except json.JSONDecodeError:
        return {
            "title": article["title"][:80],
            "summary": article["content"][:250] if article["content"] else article["title"],
            "category": "NOTICIA",
        }


def insert_article(article: dict, processed: dict) -> bool:
    record = {
        "title": processed.get("title", article["title"])[:80],
        "content": article["content"][:5000],
        "summary": processed.get("summary", "")[:500],
        "image_url": article.get("image_url"),
        "category": processed.get("category", "NOTICIA"),
        "source_url": article.get("link", "")[:500],
    }
    try:
        r = httpx.post(
            f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}",
            headers=db_headers(),
            json=record,
        )
        if r.status_code in (200, 201):
            return True
        print(f"    ❌ DB insert status: {r.status_code} — {r.text[:200]}")
        return False
    except Exception as e:
        print(f"    ❌ DB error: {e}")
        return False


def main():
    print("🏍️  Moto Intelligence Lab — News Agent")
    print(f"📅  {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")

    print("📡 Fetching RSS feeds...")
    articles = fetch_recent_articles(hours=168)
    print(f"\n   TOTAL: {len(articles)} artículos encontrados\n")

    if not articles:
        print("No articles found. Done.")
        return

    print("🔍 Checking for duplicates...")
    existing_urls = get_existing_urls()
    new_articles = [a for a in articles if a["link"] and a["link"] not in existing_urls]
    print(f"   {len(new_articles)} nuevos artículos a procesar\n")

    if not new_articles:
        print("All articles already saved. Done.")
        return

    print("🤖 Summarizing with Claude and saving...")
    saved = 0
    for i, article in enumerate(new_articles[:MAX_ARTICLES_PER_RUN]):
        print(f"  [{i+1}/{min(len(new_articles), MAX_ARTICLES_PER_RUN)}] {article['title'][:65]}...")
        try:
            processed = summarize_with_claude(article)
            if insert_article(article, processed):
                saved += 1
                print(f"    ✅ [{processed.get('category', 'NOTICIA')}] {processed.get('title', '')[:60]}")
        except Exception as e:
            print(f"    ❌ Error: {e}")

    print(f"\n✅ Done! {saved} artículos guardados en Supabase.")


if __name__ == "__main__":
    main()
