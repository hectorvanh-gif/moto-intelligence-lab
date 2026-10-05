import { next, rewrite } from "@vercel/edge";

/**
 * Solo existe para la portada.
 *
 * Los rewrites de vercel.json mandan a los rastreadores a api/tarjeta, y
 * funcionan en todo el sitio menos en un sitio: la raiz. Vercel resuelve en
 * este orden —redirecciones, cabeceras, ARCHIVOS ESTATICOS, rewrites—, asi
 * que una ruta sin archivo en disco (/noticias/968, /enduro) llega al
 * rewrite, pero "/" encuentra el index.html que genera Vite y se sirve ahi
 * mismo. El rewrite nunca se evalua.
 *
 * Se comprobo pidiendo /robots.txt como Googlebot: vuelve el robots.txt de
 * verdad y no la pagina armada, justo porque existe en disco.
 *
 * El middleware es lo unico que corre antes de esa busqueda de archivos. Va
 * acotado a "/" con el matcher: la portada es la pagina mas importante para
 * indexar y la unica que el rewrite no alcanza, asi que no hay motivo para
 * pagar middleware en las otras 721 URLs.
 */

// La misma lista que vercel.json. Si se toca alla, se toca aqui.
const RASTREADORES =
  /(googlebot|bingbot|facebookexternalhit|whatsapp|twitterbot|telegrambot|slackbot|linkedinbot|discordbot)/i;

export const config = { matcher: "/" };

export default function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!RASTREADORES.test(ua)) return next();
  return rewrite(new URL("/api/tarjeta?ruta=/", request.url));
}
