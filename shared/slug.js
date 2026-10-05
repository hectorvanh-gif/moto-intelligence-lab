/**
 * Las URLs de las notas. Un solo archivo para los tres que las arman.
 *
 * Lo usan el sitio (src), el prerender (api/tarjeta.js) y el generador del
 * sitemap (scripts/generate-sitemap.js). Va en JavaScript plano justo por
 * eso: Node no importa TypeScript, asi que un .ts obligaria a tener dos
 * copias, y dos copias de esto se separan. Si el sitemap anunciara una URL
 * distinta de la que enlaza el sitio, Google rastrearia una y encontraria
 * una redireccion a la otra en cada nota.
 *
 * La forma es <id>-<titulo>: /noticias/968-marquez-domino-el-caos
 *
 * El id va DELANTE y es lo unico que se usa para buscar la nota. Asi el
 * titulo puede cambiar —y cambia: el reprocesamiento reescribe titulares—
 * sin que la URL vieja muera. Tambien por eso no va la categoria en la
 * ruta: el agente la reasigna, y una categoria en la ruta convertiria cada
 * reclasificacion en un enlace roto.
 */

/** Cuanto titulo cabe en la URL. Google no lee mas alla de esto. */
const LARGO = 60;

/** El titulo convertido en algo que cabe en una URL. */
export function slugificar(titulo) {
  const base = String(titulo || "")
    // Quita acentos: "Márquez" -> "Marquez". Sin esto la URL sale con %C3%A1.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base.length <= LARGO) return base;

  // Se corta en un guion y no a la mitad de una palabra.
  const cortado = base.slice(0, LARGO);
  const ultimo = cortado.lastIndexOf("-");
  return (ultimo > 20 ? cortado.slice(0, ultimo) : cortado).replace(/-+$/, "");
}

/** La ruta de una nota: /noticias/968-titulo-de-la-nota */
export function rutaDeNota(id, titulo) {
  const s = slugificar(titulo);
  return s ? `/noticias/${id}-${s}` : `/noticias/${id}`;
}

/**
 * El id que lleva dentro un parametro de ruta.
 *
 * Acepta "968" y "968-lo-que-sea": las URLs viejas, sin slug, siguen
 * resolviendo. Devuelve null si no empieza con digitos, para no pedirle a
 * la base una nota con id NaN.
 */
export function idDeRuta(parametro) {
  const m = String(parametro || "").match(/^(\d+)/);
  return m ? m[1] : null;
}

/** Si la ruta que se pidio es ya la buena, o hay que redirigir a la buena. */
export function rutaCorrecta(parametro, id, titulo) {
  const buena = rutaDeNota(id, titulo);
  return buena === `/noticias/${parametro}` ? null : buena;
}
