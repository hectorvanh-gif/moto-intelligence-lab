/**
 * HTML con las metas correctas para los rastreadores que no ejecutan
 * JavaScript.
 *
 * El sitio es una SPA: el titulo y las metas de cada pagina las pone
 * useMeta en el navegador. Google ejecuta JavaScript y las ve, pero los
 * rastreadores de WhatsApp, Twitter, Facebook, Slack y Telegram no, asi
 * que al compartir el enlace de una nota mostraban la tarjeta de la
 * portada: mismo titulo y misma imagen para las 642 notas.
 *
 * vercel.json manda aqui solo a esos rastreadores, por su user-agent. Las
 * personas y Google siguen recibiendo la aplicacion normal. Se responde un
 * HTML minimo: un rastreador de tarjetas solo lee el <head>.
 *
 * Los datos de las notas se piden a Supabase en cada peticion, asi que la
 * tarjeta nunca esta desactualizada. Con la llave publicable basta: las
 * notas son publicas.
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://rbumxwchxgjbtxsxutbl.supabase.co";
const LLAVE_PUBLICA =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_FJ0Skr8u_WADS-KpchPLGA_o3eq9ps3";

const SITIO = "https://motolab249.com";
const IMAGEN = `${SITIO}/og-image.jpg?v=2`;

const POR_OMISION = {
  title: "Noticias de motos en México | Moto Lab 249",
  description:
    "Lo que pasó hoy en el motociclismo: MotoGP, motos eléctricas, doble propósito y lanzamientos. Resumido y al punto, para México.",
};

/**
 * Textos de las paginas fijas. Las descripciones son mas cortas que las de
 * src/lib/hubs.ts a proposito: una tarjeta de WhatsApp corta a unas dos
 * lineas, y la descripcion larga de SEO se leeria truncada. El titulo si
 * coincide, y hubs.ts sigue siendo la fuente de verdad de la pagina.
 */
const FIJAS = {
  "/": POR_OMISION,
  "/nosotros": {
    title: "Qué es Moto Lab 249 | Noticias de moto en México",
    description:
      "Un filtro para la prensa de moto: más de 40 fuentes revisadas cada mañana, sin relleno.",
  },
  "/noticias": {
    title: "Archivo de Noticias | Moto Lab 249",
    description: "Todas las notas publicadas, por fecha y por categoría.",
  },
  "/motogp": {
    title: "MotoGP: cómo funciona el campeonato y últimas noticias | Moto Lab 249",
    description:
      "Las tres categorías, el formato del fin de semana con sprint, y lo último del campeonato.",
  },
  "/motos-electricas": {
    title: "Motos eléctricas en México: qué revisar antes de comprar | Moto Lab 249",
    description:
      "Los tipos que existen, qué revisar de la batería y del rendimiento real antes de comprar.",
  },
  "/motos-doble-proposito": {
    title: "Motos doble propósito en México: cómo elegir la tuya | Moto Lab 249",
    description:
      "Qué son, en qué fijarte antes de comprar y para qué sirven de verdad fuera del asfalto.",
  },
  "/enduro": {
    title: "Motos de enduro: qué son y cómo empezar | Moto Lab 249",
    description:
      "En qué se diferencian del motocross y de la doble propósito, y qué necesitas para arrancar.",
  },
};

const escapar = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// El mismo recorte que hace cleanText en el sitio, en corto: el material
// crudo de algunas notas trae etiquetas y espacios de sobra.
const limpiar = (s) =>
  String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function notaDe(id) {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/moto_news?select=title,summary,image_url,created_at,category&id=eq.${id}&limit=1`,
      {
        headers: {
          apikey: LLAVE_PUBLICA,
          Authorization: `Bearer ${LLAVE_PUBLICA}`,
        },
      }
    );
    if (!r.ok) return null;
    const filas = await r.json();
    return filas?.[0] || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const ruta = String(req.query.ruta || "/").split("?")[0];

  let meta = FIJAS[ruta] || FIJAS[ruta.replace(/\/$/, "")] || null;
  let imagen = IMAGEN;
  let tipo = "website";
  let publicada = "";

  const enNota = ruta.match(/^\/noticias\/(\d+)$/);
  if (enNota) {
    const nota = await notaDe(enNota[1]);
    if (nota) {
      meta = {
        title: `${limpiar(nota.title)} | Moto Lab 249`,
        description: limpiar(nota.summary) || POR_OMISION.description,
      };
      imagen = nota.image_url || IMAGEN;
      tipo = "article";
      publicada = nota.created_at || "";
    }
  }

  if (!meta) meta = POR_OMISION;

  const url = `${SITIO}${ruta}`;
  const t = escapar(meta.title);
  const d = escapar(meta.description);

  // Se pide que no se cachee mucho: si una nota cambia de titulo, la
  // tarjeta tiene que reflejarlo sin esperar un despliegue.
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");

  return res.status(200).send(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8">
<title>${t}</title>
<meta name="description" content="${d}">
<link rel="canonical" href="${escapar(url)}">
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="Moto Lab 249">
<meta property="og:locale" content="es_MX">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${escapar(imagen)}">
<meta property="og:url" content="${escapar(url)}">
${publicada ? `<meta property="article:published_time" content="${escapar(publicada)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${escapar(imagen)}">
</head><body>
<h1>${t}</h1>
<p>${d}</p>
<p><a href="${escapar(url)}">Abrir en motolab249.com</a></p>
</body></html>`);
}
