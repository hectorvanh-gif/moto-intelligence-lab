/**
 * El HTML ya armado, para quien no ejecuta JavaScript.
 *
 * El sitio es una SPA: el titulo, las metas y el texto los pone el
 * navegador. Eso dejaba dos agujeros distintos.
 *
 * El primero, el de las tarjetas: al compartir una nota por WhatsApp o
 * Facebook salia la ficha de la portada, la misma para las 642 notas,
 * porque esos rastreadores solo leen el <head> y no corren JavaScript.
 *
 * El segundo es el caro, y se descubrio el 5 de octubre de 2026: Google
 * tenia CERO paginas del sitio indexadas. Ni la marca exacta lo encontraba.
 * Bing, en cambio, tenia 95, lo que descarta que el sitio estuviera roto o
 * bloqueado. La causa estaba aqui: en la primera pasada, Googlebot recibia
 * el cascaron del SPA y las 722 URLs se veian IDENTICAS entre si — mismo
 * titulo, sin descripcion propia, sin canonical y sin una linea de texto.
 * Google ejecuta JavaScript, pero en una segunda pasada y con presupuesto
 * contado; ante 722 paginas aparentemente iguales, lo barato es tratarlas
 * como duplicados y no gastarlo. Eso hizo.
 *
 * Por eso esto ya no devuelve una ficha sino la pagina entera: titulo,
 * fecha, categoria, el CUERPO completo y enlaces de verdad que se puedan
 * seguir. Esa diferencia es la que separa el "dynamic rendering" que Google
 * documenta y acepta, del contenido delgado que penaliza: lo que se sirve
 * aqui tiene que ser lo mismo que ve una persona cuando el JavaScript
 * termina de cargar. Si se vuelve a recortar a una ficha, se rompe esa
 * condicion y es peor el remedio.
 *
 * vercel.json manda aqui a los rastreadores por user-agent. Las personas
 * reciben la aplicacion normal.
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://rbumxwchxgjbtxsxutbl.supabase.co";
const LLAVE_PUBLICA =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_FJ0Skr8u_WADS-KpchPLGA_o3eq9ps3";

const SITIO = "https://motolab249.com";
const IMAGEN = `${SITIO}/og-image.jpg?v=2`;

/**
 * Desde cuando la imagen que genera el agente sirve para compartir.
 *
 * El agente estampa un badge con el nombre de la marca en cada imagen, y
 * hasta el cambio de nombre decia "MOTO LAB 09/24". De las 753 imagenes
 * generadas, 719 llevan el nombre viejo: usarlas todas haria que el 95%
 * de lo compartido mostrara una marca que ya no existe, peor que la foto
 * sin marca del medio original.
 */
const DESDE_EL_CAMBIO_DE_MARCA = "2026-09-22";

/** Cuantas notas se listan en una pagina de listado. */
const EN_LISTADO = 24;

const POR_OMISION = {
  es: {
    title: "Noticias de motos y MotoGP | Moto Lab 249",
    description:
      "Lo que pasó hoy en el motociclismo: MotoGP, motos eléctricas, doble propósito y lanzamientos. Resumido y al punto, sin relleno.",
  },
  en: {
    title: "Motorcycle and MotoGP news | Moto Lab 249",
    description:
      "What happened today in motorcycling: MotoGP, electric bikes, dual-sport and new releases. Short and to the point.",
  },
};

/**
 * Paginas fijas. `categoria` dice de que categoria listar notas debajo del
 * texto; sin ella la pagina se sirve sin listado.
 */
const FIJAS = {
  "/": { ...POR_OMISION, listar: "todas" },
  "/nosotros": {
    es: {
      title: "Qué es Moto Lab 249 | Noticias de moto",
      description:
        "Un filtro para la prensa de moto: más de 40 fuentes revisadas cada mañana, sin relleno.",
    },
    en: {
      title: "What Moto Lab 249 is | Motorcycle news",
      description:
        "A filter for the motorcycle press: more than 40 sources reviewed every morning, no filler.",
    },
  },
  "/noticias": {
    es: {
      title: "Archivo de Noticias | Moto Lab 249",
      description: "Todas las notas publicadas, por fecha y por categoría.",
    },
    en: {
      title: "News archive | Moto Lab 249",
      description: "Every story published, by date and by category.",
    },
    listar: "todas",
  },
  "/privacidad": {
    es: {
      title: "Aviso de privacidad | Moto Lab 249",
      description: "Qué datos guardamos, quién los procesa y cómo pedir que se borren.",
    },
    en: {
      title: "Privacy notice | Moto Lab 249",
      description: "What data we keep, who processes it and how to ask for deletion.",
    },
  },
  "/terminos": {
    es: {
      title: "Términos de uso | Moto Lab 249",
      description:
        "Cómo se produce el contenido, de quién son las notas originales y qué esperar de un sitio escrito con ayuda de IA.",
    },
    en: {
      title: "Terms of use | Moto Lab 249",
      description:
        "How the content is produced, who owns the original stories, and what to expect from a site written with AI.",
    },
  },
  "/contacto": {
    es: {
      title: "Escríbenos | Moto Lab 249",
      description:
        "¿Viste un dato mal o quieres que cubramos algo? Esto llega directo al correo del sitio.",
    },
    en: {
      title: "Write to us | Moto Lab 249",
      description:
        "Spotted something wrong, or want us to cover something? This goes straight to the site's inbox.",
    },
  },
  "/calendario-motogp": {
    es: {
      title: "Calendario MotoGP 2026 en hora de México | Moto Lab 249",
      description:
        "A qué hora se ve cada carrera desde México. Varias no se corren en domingo aquí.",
    },
    en: {
      title: "MotoGP 2026 calendar in Mexico time | Moto Lab 249",
      description:
        "What time each race starts in Mexico. Several of them do not fall on a Sunday here.",
    },
    listar: "MOTOGP",
  },
  "/motogp": {
    es: {
      title: "MotoGP: cómo funciona el campeonato y últimas noticias | Moto Lab 249",
      description:
        "Las tres categorías, el formato del fin de semana con sprint, y lo último del campeonato.",
    },
    en: {
      title: "MotoGP: how the championship works and latest news | Moto Lab 249",
      description:
        "The three classes, the sprint weekend format, and the latest from the championship.",
    },
    listar: "MOTOGP",
  },
  "/motos-electricas": {
    es: {
      title: "Motos eléctricas en México: qué revisar antes de comprar | Moto Lab 249",
      description:
        "Los tipos que existen, qué revisar de la batería y del rendimiento real antes de comprar.",
    },
    en: {
      title: "Electric motorcycles: what to check before buying | Moto Lab 249",
      description:
        "The types that exist, and what to check about the battery and the real-world range.",
    },
    listar: "ELECTRICA",
  },
  "/motos-doble-proposito": {
    es: {
      title: "Motos doble propósito en México: cómo elegir la tuya | Moto Lab 249",
      description:
        "Qué son, en qué fijarte antes de comprar y para qué sirven de verdad fuera del asfalto.",
    },
    en: {
      title: "Dual-sport motorcycles: how to choose yours | Moto Lab 249",
      description:
        "What they are, what to look at before buying, and what they are really good for off the tarmac.",
    },
    listar: "AVENTURA",
  },
  "/enduro": {
    es: {
      title: "Motos de enduro: qué son y cómo empezar | Moto Lab 249",
      description:
        "En qué se diferencian del motocross y de la doble propósito, y qué necesitas para arrancar.",
    },
    en: {
      title: "Enduro motorcycles: what they are and how to start | Moto Lab 249",
      description:
        "How they differ from motocross and dual-sport bikes, and what you need to get going.",
    },
    listar: "ENDURO",
  },
};

/** Categoria por slug, para /categoria/<slug>. */
const POR_SLUG = {
  motogp: "MOTOGP",
  superbike: "SUPERBIKE",
  electricas: "ELECTRICA",
  aventura: "AVENTURA",
  enduro: "ENDURO",
  sport: "SPORT",
  naked: "NAKED",
};

const TEXTOS = {
  es: {
    volver: "Volver a la portada",
    archivo: "Ver todas las notas",
    fuente: "Ver la nota original",
    masRecientes: "Lo más reciente",
    publicada: "Publicada el",
    sitio: "Moto Lab 249 · Noticias de motociclismo, todos los días.",
  },
  en: {
    volver: "Back to the homepage",
    archivo: "See every story",
    fuente: "Read the original",
    masRecientes: "Latest news",
    publicada: "Published on",
    sitio: "Moto Lab 249 · Motorcycle news, every day.",
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

async function supabase(consulta) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/moto_news?${consulta}`, {
      headers: {
        apikey: LLAVE_PUBLICA,
        Authorization: `Bearer ${LLAVE_PUBLICA}`,
      },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/** Una nota, en los dos idiomas: el idioma se elige al pintarla. */
async function notaDe(id) {
  const filas = await supabase(
    "select=title,summary,content,title_en,summary_en,content_en," +
      `image_url,ig_image_url,created_at,category,source_url&id=eq.${id}&limit=1`
  );
  return filas?.[0] || null;
}

/**
 * Las notas de un listado.
 *
 * En ingles se filtran las que no estan traducidas: una lista con los
 * titulos en blanco es justo la pagina delgada que hay que evitar.
 */
async function listaDe(categoria, idioma) {
  const campos =
    idioma === "en"
      ? "id,title:title_en,summary:summary_en,created_at,category"
      : "id,title,summary,created_at,category";

  let q = `select=${campos}&category=neq.DESCARTADO`;
  if (categoria && categoria !== "todas") q += `&category=eq.${categoria}`;
  if (idioma === "en") q += "&title_en=not.is.null";
  q += `&order=created_at.desc&limit=${EN_LISTADO}`;

  return (await supabase(q)) || [];
}

/** El cuerpo de la nota, en parrafos, tal como lo pinta el sitio. */
function parrafos(texto) {
  return limpiar(texto)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function pintarLista(notas, idioma, T) {
  if (!notas.length) return "";
  const prefijo = idioma === "en" ? "/en" : "";
  const filas = notas
    .map((n) => {
      const titulo = escapar(limpiar(n.title));
      const resumen = escapar(limpiar(n.summary));
      const fecha = (n.created_at || "").slice(0, 10);
      return `<li>
<h3><a href="${prefijo}/noticias/${n.id}">${titulo}</a></h3>
${resumen ? `<p>${resumen}</p>` : ""}
${fecha ? `<p><time datetime="${escapar(n.created_at)}">${escapar(fecha)}</time></p>` : ""}
</li>`;
    })
    .join("\n");

  return `<h2>${escapar(T.masRecientes)}</h2>\n<ul>\n${filas}\n</ul>`;
}

export default async function handler(req, res) {
  const rutaCruda = String(req.query.ruta || "/").split("?")[0];

  // El idioma sale de la ruta, igual que en el sitio: todo lo que cuelga
  // de /en esta en ingles.
  const idioma = /^\/en(\/|$)/.test(rutaCruda) ? "en" : "es";
  const ruta = (idioma === "en" ? rutaCruda.replace(/^\/en/, "") : rutaCruda) || "/";
  const limpia = ruta.replace(/\/$/, "") || "/";
  const T = TEXTOS[idioma];
  const prefijo = idioma === "en" ? "/en" : "";

  let meta = null;
  let imagen = IMAGEN;
  let tipo = "website";
  let publicada = "";
  let cuerpo = "";
  // Solo se anuncia alternativa en el otro idioma cuando existe de verdad:
  // prometerle a Google una traduccion que no esta es peor que callarse.
  let bilingue = true;

  const enNota = limpia.match(/^\/noticias\/(\d+)$/);

  if (enNota) {
    const nota = await notaDe(enNota[1]);
    if (nota) {
      const titulo = idioma === "en" ? nota.title_en : nota.title;
      const resumen = idioma === "en" ? nota.summary_en : nota.summary;
      const texto = idioma === "en" ? nota.content_en : nota.content;

      // Las notas anteriores al 5 de octubre de 2026 no tienen ingles. En
      // /en se responde 404 en vez de pintarla vacia o servir el español:
      // decirle a Google que una URL existe cuando no tiene contenido es
      // exactamente como se llega a "rastreada, sin indexar".
      if (idioma === "en" && !titulo) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(404).send(
          `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">` +
            `<title>Not available in English | Moto Lab 249</title>` +
            `<meta name="robots" content="noindex">` +
            `</head><body><h1>Not available in English</h1>` +
            `<p>This story was published before we started writing in English.</p>` +
            `<p><a href="/noticias/${enNota[1]}">Read it in Spanish</a></p>` +
            `</body></html>`
        );
      }

      meta = {
        title: `${limpiar(titulo)} | Moto Lab 249`,
        description: limpiar(resumen) || POR_OMISION[idioma].description,
      };

      const propiaSirve =
        nota.ig_image_url && (nota.created_at || "") >= DESDE_EL_CAMBIO_DE_MARCA;
      imagen = (propiaSirve ? nota.ig_image_url : nota.image_url) || IMAGEN;
      tipo = "article";
      publicada = nota.created_at || "";
      bilingue = !!(nota.title_en && nota.title);

      const fecha = publicada.slice(0, 10);
      cuerpo = `
<article>
<h1>${escapar(limpiar(titulo))}</h1>
${fecha ? `<p>${escapar(T.publicada)} <time datetime="${escapar(publicada)}">${escapar(fecha)}</time></p>` : ""}
${nota.category ? `<p>${escapar(nota.category)}</p>` : ""}
${imagen !== IMAGEN ? `<img src="${escapar(imagen)}" alt="${escapar(limpiar(titulo))}">` : ""}
${resumen ? `<p>${escapar(limpiar(resumen))}</p>` : ""}
${parrafos(texto).map((p) => `<p>${escapar(p)}</p>`).join("\n")}
${nota.source_url ? `<p><a href="${escapar(nota.source_url)}" rel="nofollow noopener">${escapar(T.fuente)}</a></p>` : ""}
</article>`;
    }
  }

  // Paginas fijas y listados.
  if (!meta) {
    const fija = FIJAS[limpia] || null;
    const porCategoria = limpia.match(/^\/categoria\/([a-z-]+)$/);

    if (fija) {
      meta = fija[idioma];
      if (fija.listar) {
        const notas = await listaDe(fija.listar, idioma);
        cuerpo = `<h1>${escapar(meta.title.split(" | ")[0])}</h1>
<p>${escapar(meta.description)}</p>
${pintarLista(notas, idioma, T)}`;
      } else {
        cuerpo = `<h1>${escapar(meta.title.split(" | ")[0])}</h1>
<p>${escapar(meta.description)}</p>`;
      }
    } else if (porCategoria && POR_SLUG[porCategoria[1]]) {
      const cat = POR_SLUG[porCategoria[1]];
      const notas = await listaDe(cat, idioma);
      meta = {
        title: `${cat} | Moto Lab 249`,
        description:
          idioma === "en"
            ? `Latest ${cat} stories on Moto Lab 249.`
            : `Lo último de ${cat} en Moto Lab 249.`,
      };
      cuerpo = `<h1>${escapar(cat)}</h1>\n${pintarLista(notas, idioma, T)}`;
    }
  }

  if (!meta) {
    meta = POR_OMISION[idioma];
    cuerpo = `<h1>${escapar(meta.title.split(" | ")[0])}</h1><p>${escapar(meta.description)}</p>`;
  }

  const url = `${SITIO}${prefijo}${limpia === "/" ? "" : limpia}` || SITIO;
  const t = escapar(meta.title);
  const d = escapar(meta.description);
  const sinPrefijo = limpia === "/" ? "" : limpia;

  // Caché de un día en el borde, y una semana sirviendo la copia vieja
  // mientras se revalida por detrás.
  //
  // Estaba en 5 minutos y costó caro: los rastreadores recorren las 722
  // URLs del sitemap una y otra vez, y con esa ventana casi cada visita
  // ejecutaba la función y consultaba Supabase.
  //
  // Los listados se cachean menos porque cambian a diario; el titular de
  // una nota ya publicada no vuelve a cambiar.
  const esListado = !enNota;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    esListado
      ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
      : "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
  );

  return res.status(200).send(`<!DOCTYPE html>
<html lang="${idioma}"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
<link rel="canonical" href="${escapar(url)}">
${
  bilingue
    ? `<link rel="alternate" hreflang="es" href="${escapar(SITIO + sinPrefijo || SITIO)}">
<link rel="alternate" hreflang="en" href="${escapar(SITIO + "/en" + sinPrefijo)}">
<link rel="alternate" hreflang="x-default" href="${escapar(SITIO + sinPrefijo || SITIO)}">`
    : ""
}
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="Moto Lab 249">
<meta property="og:locale" content="${idioma === "en" ? "en_US" : "es_MX"}">
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
<header><a href="${prefijo || "/"}">Moto Lab 249</a></header>
<main>
${cuerpo}
</main>
<nav>
<a href="${prefijo || "/"}">${escapar(T.volver)}</a>
<a href="${prefijo}/noticias">${escapar(T.archivo)}</a>
<a href="${prefijo}/calendario-motogp">MotoGP</a>
</nav>
<footer><p>${escapar(T.sitio)}</p></footer>
</body></html>`);
}
