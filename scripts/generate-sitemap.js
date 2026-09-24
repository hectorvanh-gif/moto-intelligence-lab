/**
 * Moto Lab 249 — Sitemap Generator
 * Runs before vite build. Fetches all article IDs from Supabase and writes public/sitemap.xml
 */

import { writeFileSync } from "fs";

const SUPABASE_URL = "https://rbumxwchxgjbtxsxutbl.supabase.co";
const SUPABASE_KEY = "sb_publishable_FJ0Skr8u_WADS-KpchPLGA_o3eq9ps3";
const SITE_URL = "https://motolab249.com";

async function generateSitemap() {
  console.log("🗺️  Generating sitemap...");

  // Fetch all articles (only id + created_at needed)
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/moto_news?select=id,created_at&category=neq.DESCARTADO&order=created_at.desc&limit=1000`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.warn(`⚠️  Supabase fetch failed (${res.status}). Generating static-only sitemap.`);
  }

  const articles = res.ok ? await res.json() : [];

  const today = new Date().toISOString().split("T")[0];

  // Static pages
  // Las secciones tematicas van con prioridad alta: son las que cargan el
  // contenido propio y las que pelean las busquedas con volumen.
  const HUB_SLUGS = ["motogp", "motos-electricas", "motos-doble-proposito", "enduro"];

  const staticUrls = [
    { loc: SITE_URL,               changefreq: "daily",  priority: "1.0", lastmod: today },
    { loc: `${SITE_URL}/noticias`, changefreq: "daily",  priority: "0.9", lastmod: today },
    ...HUB_SLUGS.map((slug) => ({
      loc: `${SITE_URL}/${slug}`,
      changefreq: "weekly",
      priority: "0.9",
      lastmod: today,
    })),
  ];

  // Dynamic article pages
  const articleUrls = articles.map((a) => ({
    loc: `${SITE_URL}/noticias/${a.id}`,
    changefreq: "weekly",
    priority: "0.8",
    lastmod: a.created_at ? a.created_at.split("T")[0] : today,
  }));

  const allUrls = [...staticUrls, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ loc, changefreq, priority, lastmod }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  writeFileSync("public/sitemap.xml", xml, "utf-8");
  console.log(`✅ Sitemap generated — ${allUrls.length} URLs (${articles.length} artículos + ${staticUrls.length} estáticas)`);
}

generateSitemap().catch((err) => {
  console.error("❌ Sitemap generation failed:", err.message);
  process.exit(0); // No romper el build si falla
});
