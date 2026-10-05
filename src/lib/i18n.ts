/**
 * Español e ingles.
 *
 * El idioma vive en la URL: todo lo que cuelga de /en esta en ingles y lo
 * demas en español. Eso lo decide el basename del router, una vez por carga
 * de pagina, asi que el idioma NO cambia mientras la pagina esta viva. De
 * ahi que esto sea una constante y una funcion y no un contexto de React:
 * no hay nada que re-renderizar.
 *
 * Y de ahi tambien el ahorro grande: con basename="/en" los <Link to="/x">
 * que ya existen en toda la app apuntan solos a /en/x. No hubo que tocar un
 * solo enlace. El precio es que cambiar de idioma pide una recarga completa,
 * y por eso el selector de idioma usa <a href> y no <Link>.
 *
 * El contenido de las notas es aparte: lo resuelven los hooks de datos
 * pidiendole a Supabase las columnas _en. Aqui solo vive el texto fijo.
 */

import { SITE_URL as SITIO } from "@/lib/site";

export type Idioma = "es" | "en";

/** Idiomas que existen, en el orden en que se ofrecen. */
export const IDIOMAS: Idioma[] = ["es", "en"];

/** Lo que Google espera en hreflang y en og:locale. */
export const LOCALE: Record<Idioma, string> = {
  es: "es_MX",
  en: "en_US",
};

/** Prefijo de ruta de cada idioma. El español es la raiz, sin prefijo. */
export const PREFIJO: Record<Idioma, string> = {
  es: "",
  en: "/en",
};

/** El idioma de una ruta. Fuera de React para poder llamarla antes de montar. */
export function idiomaDeRuta(pathname: string): Idioma {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "es";
}

/**
 * El idioma de ESTA carga de pagina. Constante a proposito: ver arriba.
 *
 * En el servidor (prerender, pruebas) no hay window; cae a español, que es
 * el idioma por omision del sitio.
 */
export const IDIOMA: Idioma =
  typeof window === "undefined" ? "es" : idiomaDeRuta(window.location.pathname);

/** Lo que se le pasa a <BrowserRouter basename>. */
export const BASENAME = PREFIJO[IDIOMA] || "/";

/** El otro idioma, para el selector. */
export const OTRO: Idioma = IDIOMA === "es" ? "en" : "es";

/**
 * La misma pagina en el otro idioma.
 *
 * Las notas viejas no tienen ingles, asi que una nota concreta puede no
 * existir del otro lado; para eso esta `aPortada`, que manda a la portada
 * del otro idioma en vez de a una pagina que daria 404.
 */
export function rutaEnOtroIdioma(aPortada = false): string {
  if (typeof window === "undefined") return PREFIJO[OTRO] || "/";
  if (aPortada) return PREFIJO[OTRO] || "/";

  const actual = window.location.pathname;
  const sinPrefijo = IDIOMA === "en" ? actual.replace(/^\/en/, "") : actual;
  return (PREFIJO[OTRO] + sinPrefijo) || "/";
}

/** Una ruta absoluta del sitio en un idioma dado. Para hreflang y sitemap. */
export function rutaEn(idioma: Idioma, ruta: string): string {
  const limpia = ruta.startsWith("/") ? ruta : `/${ruta}`;
  return (PREFIJO[idioma] + (limpia === "/" ? "" : limpia)) || "/";
}

/**
 * La URL canonica de una ruta en el idioma de esta carga.
 *
 * Las paginas la usan en lugar de pegar SITE_URL a mano: si /en/nosotros
 * declarara como canonica /nosotros, le estaria diciendo a Google que la
 * version en ingles no es mas que una copia de la española y no la
 * indexaria nunca.
 */
export function urlCanonica(ruta: string): string {
  return `${SITIO}${rutaEn(IDIOMA, ruta)}`;
}

// ── Textos ──────────────────────────────────────────────────────────────────
// Solo texto fijo de la interfaz. Lo que escribe el agente (titulos,
// resumenes, cuerpos) viene de la base ya en el idioma que toca.

const DICC = {
  // Barra de arriba
  "nav.comunidad": { es: "COMUNIDAD", en: "COMMUNITY" },
  "nav.suscribirse": { es: "SUSCRIBIRSE", en: "SUBSCRIBE" },
  "nav.calendario": { es: "CALENDARIO", en: "CALENDAR" },

  // Portada
  "portada.titulo": { es: "NOTICIAS DE MOTOS Y MOTOGP", en: "MOTORCYCLE AND MOTOGP NEWS" },
  "portada.leerNota": { es: "LEER LA NOTA", en: "READ THE STORY" },
  "portada.verLoUltimo": { es: "VER LO ÚLTIMO", en: "SEE THE LATEST" },
  "portada.loMasReciente": { es: "LO MÁS RECIENTE", en: "LATEST NEWS" },
  "portada.loMasVotado": { es: "LO MÁS VOTADO", en: "MOST VOTED" },
  "portada.verTodo": { es: "VER TODO", en: "SEE ALL" },

  "portada.vacio": {
    es: "Aún no hay noticias publicadas. Vuelve pronto.",
    en: "No stories published yet. Check back soon.",
  },
  "portada.error": {
    es: "Error al cargar las noticias. Intenta de nuevo más tarde.",
    en: "Could not load the news. Please try again later.",
  },
  "portada.comunidad": { es: "SÚMATE A LA COMUNIDAD", en: "JOIN THE COMMUNITY" },

  // Tarjetas y votos
  "tarjeta.sinContenido": { es: "Sin contenido disponible", en: "No content available" },
  "tarjeta.sinTitulo": { es: "Sin título", en: "Untitled" },
  "tarjeta.alt": { es: "Noticia", en: "News story" },
  "voto.votar": { es: "VOTAR", en: "VOTE" },
  "voto.votada": { es: "VOTADA", en: "VOTED" },
  "voto.porEsta": { es: "Votar por esta nota", en: "Vote for this story" },
  "voto.yaVotaste": { es: "Ya votaste esta nota", en: "You already voted on this story" },

  // Boletin
  "boletin.placeholder": { es: "tu@email.com", en: "you@email.com" },
  "boletin.boton": { es: "UNIRME AL LAB 249", en: "JOIN LAB 249" },
  "boletin.enviando": { es: "PROCESANDO...", en: "PROCESSING..." },
  "boletin.faltaCorreo": { es: "Por favor ingresa tu email", en: "Please enter your email" },
  "boletin.error": { es: "Error", en: "Error" },
  "boletin.yaTitulo": { es: "Ya estás registrado", en: "You are already signed up" },
  "boletin.yaTexto": {
    es: "Este email ya forma parte del Lab 249.",
    en: "This email is already part of Lab 249.",
  },
  "boletin.falloTitulo": { es: "Error al registrarse", en: "Sign-up failed" },
  "boletin.falloTexto": {
    es: "Intenta de nuevo en un momento.",
    en: "Please try again in a moment.",
  },
  "boletin.bienvenido": { es: "¡Bienvenido al Lab!", en: "Welcome to the Lab!" },
  "boletin.confirmacion": {
    es: "Te mandamos un correo de confirmación. Revisa tu bandeja.",
    en: "We sent you a confirmation email. Check your inbox.",
  },
  "boletin.cadaLunes": {
    es: "Cada lunes te llega el resumen de la semana.",
    en: "Every Monday you get the week's roundup.",
  },

  // Pie
  "pie.lema": { es: "Noticias de motociclismo, todos los días.", en: "Motorcycle news, every day." },
  "pie.sitio": { es: "SITIO", en: "SITE" },
  "pie.legal": { es: "LEGAL", en: "LEGAL" },
  "pie.siguenos": { es: "SÍGUENOS", en: "FOLLOW US" },
  "pie.queEs": { es: "Qué es Moto Lab 249", en: "What Moto Lab 249 is" },
  "pie.calendario": { es: "Calendario MotoGP", en: "MotoGP calendar" },
  "pie.archivo": { es: "Archivo completo", en: "Full archive" },
  "pie.escribenos": { es: "Escríbenos", en: "Write to us" },
  "pie.comunidad": { es: "Entrar a la comunidad", en: "Join the community" },
  "pie.privacidad": { es: "Aviso de privacidad", en: "Privacy notice" },
  "pie.terminos": { es: "Términos de uso", en: "Terms of use" },
  "pie.derechos": {
    es: "© 2026 MOTO LAB 249 // TODOS LOS DERECHOS RESERVADOS",
    en: "© 2026 MOTO LAB 249 // ALL RIGHTS RESERVED",
  },

  // Archivo y secciones
  "archivo.titulo": { es: "TODAS LAS NOTAS", en: "ALL STORIES" },
  "archivo.cargando": { es: "Cargando...", en: "Loading..." },
  "archivo.vacio": { es: "Todavía no hay notas aquí.", en: "No stories here yet." },
  "archivo.cargarMas": { es: "CARGAR MÁS", en: "LOAD MORE" },

  // Nota
  "nota.volver": { es: "VOLVER AL ARCHIVO", en: "BACK TO THE ARCHIVE" },
  "nota.fuente": { es: "Ver la nota original", en: "Read the original" },
  "nota.noEncontrada": { es: "No encontramos esta nota.", en: "We could not find this story." },
  "nota.masNotas": { es: "MÁS NOTAS", en: "MORE STORIES" },

  // Selector de idioma
  "idioma.es": { es: "Español", en: "Español" },
  "idioma.en": { es: "English", en: "English" },

  // Avisos propios del ingles
  "en.soloNuevas": {
    es: "",
    en: "We started publishing in English on October 5, 2026. Older stories are only available in Spanish.",
  },

  // 404
  "404.titulo": { es: "Esta página no existe", en: "This page does not exist" },
  "404.volver": { es: "Ir a la portada", en: "Go to the homepage" },
} as const;

export type Clave = keyof typeof DICC;

/** El texto fijo en el idioma de esta carga. */
export function t(clave: Clave): string {
  return DICC[clave][IDIOMA];
}
