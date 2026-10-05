import { useEffect } from "react";
import { SITE_URL } from "@/lib/site";
import { IDIOMA, LOCALE, PREFIJO, rutaEn } from "@/lib/i18n";

/**
 * Titulo y metas de la pagina.
 *
 * Sustituye a react-helmet-async, que estaba instalado y no insertaba
 * nada: en una carga directa de cualquier ruta el head se quedaba con el
 * titulo de index.html, asi que las 665 paginas le decian a Google que
 * todas eran la portada. Solo funcionaba navegando con clics dentro del
 * sitio, que es justo lo que Google no hace.
 *
 * Aqui no hay proveedor, ni contexto, ni orden de montaje: se escribe en
 * el head y se acabo.
 *
 * Limite conocido: esto corre en el navegador. Google ejecuta JavaScript y
 * lo ve, pero los rastreadores de WhatsApp y Twitter no, asi que la
 * tarjeta al compartir un enlace sigue siendo la de index.html. Eso solo
 * se arregla renderizando en el servidor o prerenderizando el HTML.
 */

const IMAGEN_POR_OMISION = `${SITE_URL}/og-image.jpg?v=2`;

function ponerMeta(atributo: "name" | "property", clave: string, valor: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${atributo}="${clave}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(atributo, clave);
    document.head.appendChild(el);
  }
  el.setAttribute("content", valor);
}

function ponerCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

const ID_JSONLD = "datos-estructurados";
const CLASE_ALT = "alternativa-idioma";

/**
 * Los <link rel="alternate" hreflang>.
 *
 * Es lo que le dice a Google que /x y /en/x son la misma pagina en dos
 * idiomas y no contenido duplicado. Sin esto, dos versiones del mismo
 * articulo compiten entre si y Google elige una, normalmente la que no es.
 *
 * `hayOtroIdioma` existe porque las notas anteriores al 5 de octubre de
 * 2026 solo estan en español: anunciar una alternativa en ingles que
 * devuelve una pagina sin contenido es peor que no anunciar ninguna.
 */
function ponerAlternativas(ruta: string, hayOtroIdioma: boolean) {
  document.head
    .querySelectorAll(`link.${CLASE_ALT}`)
    .forEach((el) => el.remove());

  if (!hayOtroIdioma) return;

  const idiomas: Array<[string, string]> = [
    ["es", rutaEn("es", ruta)],
    ["en", rutaEn("en", ruta)],
    // x-default es la que se le sirve a quien no encaja en ninguna; el
    // español, que es el idioma principal del sitio.
    ["x-default", rutaEn("es", ruta)],
  ];

  for (const [lang, href] of idiomas) {
    const el = document.createElement("link");
    el.className = CLASE_ALT;
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", lang);
    el.setAttribute("href", `${SITE_URL}${href}`);
    document.head.appendChild(el);
  }
}

interface Meta {
  title: string;
  description: string;
  /** Ruta absoluta del sitio. Sin esto no se toca el canonical. */
  canonical?: string;
  image?: string;
  /** "article" en las notas; el resto del sitio es "website". */
  type?: string;
  /** Datos estructurados. Se quitan al salir de la pagina. */
  jsonLd?: unknown;
  /**
   * Si esta pagina existe en los dos idiomas. Por omision si, porque todo
   * el sitio fijo lo esta; las notas pasan false cuando no tienen ingles.
   */
  bilingue?: boolean;
}

export function useMeta({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
  bilingue = true,
}: Meta) {
  useEffect(() => {
    // Se escriben siempre los cuatro, incluida la imagen por omision: si
    // una pagina dejara alguno sin poner, se quedaria el valor de la
    // pagina anterior al navegar entre rutas.
    document.title = title;

    // index.html se sirve igual para los dos idiomas, asi que el lang del
    // <html> hay que corregirlo aqui. Importa mas de lo que parece: es lo
    // que usan los lectores de pantalla para elegir voz y Chrome para
    // ofrecer la traduccion.
    document.documentElement.lang = IDIOMA;

    ponerMeta("name", "description", description);
    ponerMeta("property", "og:locale", LOCALE[IDIOMA]);
    ponerMeta("property", "og:type", type);
    ponerMeta("property", "og:title", title);
    ponerMeta("property", "og:description", description);
    ponerMeta("property", "og:image", image || IMAGEN_POR_OMISION);
    ponerMeta("name", "twitter:title", title);
    ponerMeta("name", "twitter:description", description);
    ponerMeta("name", "twitter:image", image || IMAGEN_POR_OMISION);

    if (canonical) {
      ponerCanonical(canonical);
      ponerMeta("property", "og:url", canonical);

      // La ruta sin el prefijo del idioma, que es la que comparten las dos
      // versiones y de la que se arman las dos alternativas.
      const ruta = canonical
        .replace(SITE_URL, "")
        .replace(new RegExp(`^${PREFIJO.en}`), "") || "/";
      ponerAlternativas(ruta, bilingue);
    }

    if (!jsonLd) return;

    // Los datos estructurados si se quitan al salir: el bloque de
    // preguntas frecuentes de una seccion no debe quedarse pegado en las
    // demas paginas.
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = ID_JSONLD;
    script.textContent = JSON.stringify(jsonLd);
    document.head.querySelector(`#${ID_JSONLD}`)?.remove();
    document.head.appendChild(script);

    return () => script.remove();
  }, [title, description, canonical, image, type, jsonLd, bilingue]);
}
