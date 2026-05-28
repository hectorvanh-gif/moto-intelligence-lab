#!/usr/bin/env python3
"""
Moto Intelligence Lab - News Agent
Fetches motorcycle news via NewsAPI + RSS fallback, summarizes with Claude, saves to Supabase.
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
NEWSAPI_KEY = os.environ["NEWSAPI_KEY"]

TABLE_NAME = "moto_news"
TABLE_PATH = quote(TABLE_NAME, safe="")
MAX_ARTICLES_PER_RUN = 15
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; MotoNewsBot/1.0)"}

# Búsquedas en NewsAPI — devuelve noticias de cientos de fuentes
NEWSAPI_QUERIES = [
    "motocicletas",
    "MotoGP 2025",
    "motociclismo",
    "motos electricas",
    "superbike moto",
]

# RSS directos como respaldo
RSS_FEEDS = [
    ("motociclismo.es",   "https://www.motociclismo.es/feed/"),
    ("moto1pro.com",      "https://www.moto1pro.com/feed/"),
    ("motofichas.com",    "https://www.motofichas.com/feed/"),
    ("masmoto.es",        "https://www.masmoto.es/feed/"),
    ("motorsport ES",     "https://es.motorsport.com/rss/moto/news/"),
    ("formulamoto.es",    "https://www.formulamoto.es/feed/"),
    ("motorpasionmoto",   "https://www.motorpasionmoto.com/feeds/posts/default"),
]


def db_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


def fetch_from_newsapi(days: int = 7) -> list[dict]:
    """Fetch articles from NewsAPI — works from any server, returns rich content."""
    articles = []
    seen_urls: set[str] = set()
    from_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")

    for query in NEWSAPI_QUERIES:
        try:
            r = httpx.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": query,
                    "language": "es",
                    "from": from_date,
                    "sortBy": "publishedAt",
                    "pageSize": 20,
                    "apiKey": NEWSAPI_KEY,
                },
                headers=HEADERS,
                timeout=15,
            )
            if r.status_code == 200:
                data = r.json()
                count = 0
                for item in data.get("articles", []):
                    url = item.get("url", "")
                    if not url or url in seen_urls or "[Removed]" in item.get("title", ""):
                        continue
                    seen_urls.add(url)
                    count += 1
                    content = (item.get("description") or "") + " " + (item.get("content") or "")
                    articles.append({
                        "title": item.get("title", "").strip(),
                        "link": url,
                        "content": content.strip(),
                        "image_url": item.get("urlToImage"),
                    })
                print(f"   [NewsAPI:{query}] → {count} artículos")
            else:
                print(f"   [NewsAPI:{query}] ⚠️  Status {r.status_code}: {r.text[:150]}")
        except Exception as e:
            print(f"   [NewsAPI:{query}] ⚠️  Error: {e}")

    return articles


def fetch_from_rss(hours: int = 168) -> list[dict]:
    """RSS feeds as fallback."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    articles = []
    seen_urls: set[str] = set()

    for name, feed_url in RSS_FEEDS:
        try:
            r = httpx.get(feed_url, headers=HEADERS, timeout=15, follow_redirects=True)
            feed = feedparser.parse(r.text)
            count = 0
            for entry in feed.entries:
                title = entry.get("title", "").strip()
                link = entry.get("link", "")
                if not title or link in seen_urls:
                    continue

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

                seen_urls.add(link)
                count += 1
                articles.append({
                    "title": title,
                    "link": link,
                    "content": content_clean or title,
                    "image_url": _extract_image(entry, content),
                })
            print(f"   [RSS:{name}] → {count} artículos")
        except Exception as e:
            print(f"   [RSS:{name}] ⚠️  Error: {e}")

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
        print(f"  ⚠️  DB error: {e}")
    return set()


def summarize_with_claude(article: dict) -> dict:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = f"""Eres editor de un portal de noticias de motociclismo en español.
Analiza este artículo y responde SOLO con un JSON válido (sin texto adicional) con:
- "title": título atractivo en español, máx 80 caracteres
- "summary": resumen claro en español, 2-3 oraciones, máx 250 caracteres
- "category": MOTOGP | SUPERBIKE | ENDURO | AVENTURA | NAKED | SPORT | ELECTRICA | NOTICIA

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

    # Fuente principal: NewsAPI
    print("📡 Fetching from NewsAPI...")
    articles = fetch_from_newsapi(days=1)

    # Respaldo: RSS directos
    print("\n📡 Fetching from RSS feeds...")
    rss_articles = fetch_from_rss(hours=25)

    # Combinar y deduplicar por URL
    seen = {a["link"] for a in articles}
    for a in rss_articles:
        if a["link"] not in seen:
            articles.append(a)
            seen.add(a["link"])

    print(f"\n   TOTAL: {len(articles)} artículos únicos encontrados\n")

    if not articles:
        print("No articles found. Done.")
        return

    print("🔍 Checking for duplicates in DB...")
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
