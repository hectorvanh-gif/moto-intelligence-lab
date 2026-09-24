import { useEffect } from "react";
import { SITE_URL } from "@/lib/site";

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
}

export function useMeta({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
}: Meta) {
  useEffect(() => {
    // Se escriben siempre los cuatro, incluida la imagen por omision: si
    // una pagina dejara alguno sin poner, se quedaria el valor de la
    // pagina anterior al navegar entre rutas.
    document.title = title;

    ponerMeta("name", "description", description);
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
  }, [title, description, canonical, image, type, jsonLd]);
}
