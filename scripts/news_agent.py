#!/usr/bin/env python3
"""
Moto Intelligence Lab - News Agent
Fetches motorcycle news via NewsAPI + RSS fallback, summarizes with Claude,
generates Instagram images with Pillow, saves to Supabase.
"""

import os
import json
import re
import textwrap
import urllib.request
import hashlib
from io import BytesIO
from datetime import datetime, timezone, timedelta
from urllib.parse import quote

import feedparser
import httpx
import anthropic
from PIL import Image, ImageDraw, ImageFont

# ── Env vars ────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
NEWSAPI_KEY = os.environ["NEWSAPI_KEY"]

TABLE_NAME = "moto_news"
TABLE_PATH = quote(TABLE_NAME, safe="")
IG_BUCKET  = "ig-images"
MAX_ARTICLES_PER_RUN = 15
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; MotoNewsBot/1.0)"}

# ── NewsAPI queries ──────────────────────────────────────────────────────────
# Usamos queries específicas + exclusión de términos bélicos/violentos
NEWSAPI_QUERIES = [
    "motociclismo -sicarios -violencia -muertos -crimen -guerra -militares -delincuentes",
    "MotoGP 2026",
    "Superbike campeonato",
    "motos electricas nuevos modelos",
    "motocicleta nueva presentacion",
    "enduro rally dakar moto",
    "ducati honda yamaha kawasaki suzuki moto",
]

# ── RSS feeds (fallback) ─────────────────────────────────────────────────────
RSS_FEEDS = [
    ("motociclismo.es",  "https://www.motociclismo.es/feed/"),
    ("moto1pro.com",     "https://www.moto1pro.com/feed/"),
    ("motofichas.com",   "https://www.motofichas.com/feed/"),
    ("masmoto.es",       "https://www.masmoto.es/feed/"),
    ("motorsport ES",    "https://es.motorsport.com/rss/moto/news/"),
    ("formulamoto.es",   "https://www.formulamoto.es/feed/"),
    ("motorpasionmoto",  "https://www.motorpasionmoto.com/feeds/posts/default"),
]


# ── Supabase helpers ─────────────────────────────────────────────────────────
def db_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


# ── Font loader ──────────────────────────────────────────────────────────────
def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load a system font with multiple fallbacks, then download if needed."""
    candidates = (
        [
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        ]
        if bold
        else [
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        ]
    )
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (IOError, OSError):
            continue
    # Download Roboto as last resort
    try:
        variant = "Bold" if bold else "Regular"
        url = f"https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-{variant}.ttf"
        dest = f"/tmp/roboto_{variant.lower()}.ttf"
        if not os.path.exists(dest):
            urllib.request.urlretrieve(url, dest)
        return ImageFont.truetype(dest, size)
    except Exception:
        return ImageFont.load_default()


# ── Instagram image generator ─────────────────────────────────────────────────
def generate_ig_image(article: dict, processed: dict, file_key: str) -> str | None:
    """
    Build a 1080x1080 Instagram image:
      • Article photo as background (center-cropped)
      • Dark gradient overlay
      • MOTO LAB 09/24 brand badge
      • ig_title (large bold) + red separator + ig_caption
    Uploads to Supabase Storage and returns the public URL.
    """
    SIZE = (1080, 1080)
    ig_title   = (processed.get("ig_title") or processed.get("title", ""))[:55].upper()
    ig_caption = (processed.get("ig_caption") or processed.get("summary", ""))[:120]

    # 1 — Background
    img = None
    if article.get("image_url"):
        try:
            r = httpx.get(article["image_url"], timeout=20, follow_redirects=True)
            if r.status_code == 200:
                img = Image.open(BytesIO(r.content)).convert("RGB")
                w, h = img.size
                d = min(w, h)
                img = img.crop(((w - d) // 2, (h - d) // 2,
                                (w + d) // 2, (h + d) // 2))
                img = img.resize(SIZE, Image.LANCZOS)
        except Exception as e:
            print(f"      ⚠️  BG image error: {e}")

    if img is None:
        img = Image.new("RGB", SIZE, (10, 10, 10))

    # 2 — Dark gradient overlay (bottom 80%)
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw_o  = ImageDraw.Draw(overlay)
    for y in range(SIZE[1]):
        t     = max(0.0, (y - SIZE[1] * 0.20) / (SIZE[1] * 0.80))
        alpha = int(min(t ** 0.65 * 235, 235))
        draw_o.line([(0, y), (SIZE[0], y)], fill=(0, 0, 0, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # 3 — Brand badge (top-left)
    font_brand = _load_font(22, bold=True)
    draw.rectangle([40, 38, 320, 76], fill=(239, 68, 68))
    draw.text((54, 45), "MOTO LAB 09/24", font=font_brand, fill=(255, 255, 255))

    # 4 — Red vertical accent bar
    draw.rectangle([54, SIZE[1] - 420, 63, SIZE[1] - 110], fill=(239, 68, 68))

    # 5 — ig_title
    font_title   = _load_font(54, bold=True)
    wrapped_title = textwrap.fill(ig_title, width=20)
    draw.text((82, SIZE[1] - 410), wrapped_title, font=font_title, fill=(255, 255, 255))

    # 6 — Red separator
    n_lines = wrapped_title.count("\n") + 1
    sep_y   = SIZE[1] - 410 + n_lines * 62 + 14
    draw.rectangle([82, sep_y, 360, sep_y + 3], fill=(239, 68, 68))

    # 7 — ig_caption
    font_caption   = _load_font(29, bold=False)
    wrapped_caption = textwrap.fill(ig_caption, width=40)
    draw.text((82, sep_y + 18), wrapped_caption, font=font_caption, fill=(205, 205, 205))

    # 8 — Upload to Supabase Storage
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=90)
    buf.seek(0)

    filename = f"ig_{file_key}.jpg"
    try:
        r = httpx.put(
            f"{SUPABASE_URL}/storage/v1/object/{IG_BUCKET}/{filename}",
            content=buf.read(),
            headers={
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "image/jpeg",
                "x-upsert": "true",
            },
            timeout=30,
        )
        if r.status_code in (200, 201):
            return f"{SUPABASE_URL}/storage/v1/object/public/{IG_BUCKET}/{filename}"
        print(f"      ⚠️  Storage {r.status_code}: {r.text[:120]}")
    except Exception as e:
        print(f"      ⚠️  Storage error: {e}")
    return None


def update_ig_image(article_id: int, ig_image_url: str) -> None:
    """Patch the ig_image_url column after the image is generated."""
    try:
        httpx.patch(
            f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}?id=eq.{article_id}",
            headers=db_headers(),
            json={"ig_image_url": ig_image_url},
            timeout=15,
        )
    except Exception as e:
        print(f"      ⚠️  ig_image_url update error: {e}")


# ── News fetchers ────────────────────────────────────────────────────────────
def fetch_from_newsapi(days: int = 1) -> list[dict]:
    articles  = []
    seen_urls: set[str] = set()
    from_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")

    for query in NEWSAPI_QUERIES:
        try:
            r = httpx.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": query, "language": "es", "from": from_date,
                    "sortBy": "publishedAt", "pageSize": 20, "apiKey": NEWSAPI_KEY,
                },
                headers=HEADERS, timeout=15,
            )
            if r.status_code == 200:
                count = 0
                for item in r.json().get("articles", []):
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
                print(f"   [NewsAPI:{query}] ⚠️  {r.status_code}: {r.text[:100]}")
        except Exception as e:
            print(f"   [NewsAPI:{query}] ⚠️  {e}")
    return articles


def fetch_from_rss(hours: int = 25) -> list[dict]:
    cutoff    = datetime.now(timezone.utc) - timedelta(hours=hours)
    articles  = []
    seen_urls: set[str] = set()

    for name, feed_url in RSS_FEEDS:
        try:
            r    = httpx.get(feed_url, headers=HEADERS, timeout=15, follow_redirects=True)
            feed = feedparser.parse(r.text)
            count = 0
            for entry in feed.entries:
                title = entry.get("title", "").strip()
                link  = entry.get("link", "")
                if not title or link in seen_urls:
                    continue
                pub = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    pub = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
                if pub and pub < cutoff:
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
                    "title": title, "link": link,
                    "content": content_clean or title,
                    "image_url": _extract_image(entry, content),
                })
            print(f"   [RSS:{name}] → {count} artículos")
        except Exception as e:
            print(f"   [RSS:{name}] ⚠️  {e}")
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
    return match.group(1) if match else None


# ── Claude ───────────────────────────────────────────────────────────────────
def summarize_with_claude(article: dict) -> dict | None:
    """Returns None if the article is not about motorcycles."""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = f"""Eres editor de un portal de noticias de motociclismo en español.

PASO 1 — ¿Es el artículo REALMENTE sobre motocicletas como DEPORTE, INDUSTRIA o TECNOLOGÍA?

RECHAZA (responde {{"es_moto": false}}) si el artículo trata de:
- Violencia, crimen, sicarios o delincuentes usando motos
- Guerra, conflictos bélicos o militares
- Accidentes de tráfico sin relevancia para el motociclismo
- Política, economía general o temas que solo mencionan motos de pasada
- Ciclismo, bicicletas u otros vehículos que no son motocicletas

ACEPTA (continúa) si es sobre:
- MotoGP, Superbike, Enduro, Rally, competencias
- Nuevos modelos, lanzamientos, tecnología de motos
- Pilotos, equipos, temporadas de campeonatos
- Mercado de motos, eléctricos, accesorios
- Comunidad motociclista, rutas, aventuras

Si NO es sobre motos deportivas/industriales responde SOLO: {{"es_moto": false}}

Si SÍ es sobre motos responde SOLO con este JSON (sin texto adicional):
{{
  "es_moto": true,
  "title": "título atractivo en español, máx 80 caracteres",
  "summary": "resumen claro 2-3 oraciones, máx 250 caracteres",
  "category": "MOTOGP|SUPERBIKE|ENDURO|AVENTURA|NAKED|SPORT|ELECTRICA|NOTICIA",
  "ig_title": "TÍTULO IMPACTANTE EN MAYÚSCULAS, máx 55 caracteres",
  "ig_caption": "1-2 frases breves y emocionantes, máx 120 caracteres, para imagen Instagram"
}}

Título: {article['title']}
Contenido: {article['content'][:1500]}"""

    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        result = json.loads(msg.content[0].text)
        if not result.get("es_moto", True):
            return None
        return result
    except json.JSONDecodeError:
        return {
            "es_moto": True,
            "title": article["title"][:80],
            "summary": (article["content"][:250] if article["content"] else article["title"]),
            "category": "NOTICIA",
            "ig_title": article["title"][:55].upper(),
            "ig_caption": (article["content"][:120] if article["content"] else article["title"]),
        }


# ── DB insert ─────────────────────────────────────────────────────────────────
def insert_article(article: dict, processed: dict, ig_image_url: str | None = None) -> int | None:
    """Insert article (with ig_image_url already set) and return its new ID."""
    record = {
        "title":        processed.get("title", article["title"])[:80],
        "content":      article["content"][:5000],
        "summary":      processed.get("summary", "")[:500],
        "image_url":    article.get("image_url"),
        "category":     processed.get("category", "NOTICIA"),
        "source_url":   article.get("link", "")[:500],
        "ig_title":     processed.get("ig_title", "")[:55],
        "ig_caption":   processed.get("ig_caption", "")[:120],
        "ig_image_url": ig_image_url,
    }
    headers = {**db_headers(), "Prefer": "return=representation"}
    try:
        r = httpx.post(
            f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}",
            headers=headers, json=record, timeout=15,
        )
        if r.status_code in (200, 201):
            data = r.json()
            if data:
                return data[0]["id"]
        print(f"    ❌ DB insert {r.status_code}: {r.text[:150]}")
    except Exception as e:
        print(f"    ❌ DB error: {e}")
    return None


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("🏍️  Moto Intelligence Lab — News Agent")
    print(f"📅  {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")

    print("📡 Fetching from NewsAPI...")
    articles = fetch_from_newsapi(days=1)

    print("\n📡 Fetching from RSS feeds...")
    rss = fetch_from_rss(hours=25)
    seen = {a["link"] for a in articles}
    for a in rss:
        if a["link"] not in seen:
            articles.append(a)
            seen.add(a["link"])

    print(f"\n   TOTAL: {len(articles)} artículos únicos\n")
    if not articles:
        print("No articles found. Done.")
        return

    print("🔍 Checking duplicates in DB...")
    existing_urls = get_existing_urls()
    new_articles  = [a for a in articles if a["link"] and a["link"] not in existing_urls]
    print(f"   {len(new_articles)} nuevos artículos a procesar\n")
    if not new_articles:
        print("All articles already saved. Done.")
        return

    print("🤖 Claude: summarizing, filtering and generating Instagram images...")
    saved = 0
    for i, article in enumerate(new_articles[:MAX_ARTICLES_PER_RUN]):
        print(f"  [{i+1}/{min(len(new_articles), MAX_ARTICLES_PER_RUN)}] {article['title'][:65]}...")
        try:
            processed = summarize_with_claude(article)
            if processed is None:
                print("    ⏭️  Descartado — no es de motos")
                continue

            # Generate Instagram image BEFORE insert so webhook includes ig_image_url
            print("    📸 Generando imagen Instagram...")
            file_key = hashlib.md5(article["link"].encode()).hexdigest()[:12]
            ig_url = generate_ig_image(article, processed, file_key)

            # INSERT with ig_image_url already populated — webhook fires with complete data
            article_id = insert_article(article, processed, ig_image_url=ig_url)
            if not article_id:
                continue

            ig_status = "🖼️" if ig_url else "sin imagen"
            print(f"    ✅ [{processed.get('category','NOTICIA')}] {processed.get('title','')[:55]} {ig_status}")
            saved += 1

        except Exception as e:
            print(f"    ❌ Error: {e}")

    print(f"\n✅ Done! {saved} artículos guardados en Supabase.")


def get_existing_urls() -> set[str]:
    try:
        r = httpx.get(
            f"{SUPABASE_URL}/rest/v1/{TABLE_PATH}",
            headers=db_headers(),
            params={"select": "source_url", "order": "created_at.desc", "limit": "500"},
        )
        if r.status_code == 200:
            return {row["source_url"] for row in r.json() if row.get("source_url")}
        print(f"  ⚠️  DB fetch {r.status_code}: {r.text[:150]}")
    except Exception as e:
        print(f"  ⚠️  DB error: {e}")
    return set()


if __name__ == "__main__":
    main()
