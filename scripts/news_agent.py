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

RSS_FEEDS = [
    # Google News RSS — agrega cientos de fuentes en español automáticamente
    "https://news.google.com/rss/search?q=motocicletas&hl=es-419&gl=MX&ceid=MX:es-419",
    "https://news.google.com/rss/search?q=motos+noticias&hl=es-419&gl=MX&ceid=MX:es-419",
    "https://news.google.com/rss/search?q=MotoGP&hl=es-419&gl=MX&ceid=MX:es-419",
    "https://news.google.com/rss/search?q=motociclismo&hl=es&gl=ES&ceid=ES:es",
    "https://news.google.com/rss/search?q=moto+GP+2025&hl=es&gl=ES&ceid=ES:es",
    "https://news.google.com/rss/search?q=superbike+motos&hl=es&gl=ES&ceid=ES:es",
    "https://news.google.com/rss/search?q=motos+electricas&hl=es-419&gl=MX&ceid=MX:es-419",
    # Feeds directos como respaldo
    "https://www.motociclismo.es/feed/",
    "https://www.moto1pro.com/feed/",
    "https://www.motofichas.com/feed/",
    "https://www.masmoto.es/feed/",
    "https://es.motorsport.com/rss/moto/news/",
]

MAX_ARTICLES_PER_RUN = 12


def db_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


def fetch_recent_articles(hours: int = 25) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    articles = []

    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                pub_date = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub_date = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    pub_date = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)

                if pub_date and pub_date < cutoff:
                    continue

                content = ""
                if hasattr(entry, "content"):
                    content = entry.content[0].value
                elif hasattr(entry, "summary"):
                    content = entry.summary

                content_clean = re.sub(r"<[^>]+>", " ", content).strip()

                articles.append({
                    "title": entry.get("title", "").strip(),
                    "link": entry.get("link", ""),
                    "content": content_clean,
                    "image_url": _extract_image(entry, content),
                })
        except Exception as e:
            print(f"  ⚠️  Error fetching {feed_url}: {e}")

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


def get_existing_titles() -> set[str]:
    try:
        r = httpx.get(
            f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}",
            headers=db_headers(),
            params={"select": "title", "order": "created_at.desc", "limit": "300"},
        )
        if r.status_code == 200:
            return {row["title"] for row in r.json() if row.get("title")}
        print(f"  ⚠️  DB fetch status: {r.status_code} — {r.text[:200]}")
    except Exception as e:
        print(f"  ⚠️  Could not fetch existing titles: {e}")
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
    articles = fetch_recent_articles(hours=168)  # 7 días para el primer run
    print(f"   {len(articles)} articles found\n")

    if not articles:
        print("No articles found. Done.")
        return

    print("🔍 Checking for duplicates...")
    existing = get_existing_titles()
    new_articles = [a for a in articles if a["title"] and a["title"] not in existing]
    print(f"   {len(new_articles)} new articles to process\n")

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

    print(f"\n✅ Done! {saved} articles saved to Supabase.")


if __name__ == "__main__":
    main()
