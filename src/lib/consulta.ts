/**
 * Lo que se le pide a Supabase segun el idioma.
 *
 * El truco esta en los alias de PostgREST: en ingles se pide
 * "title:title_en", y el renglon llega con la llave `title` igual que en
 * español. Asi los componentes nunca preguntan en que idioma estan ni
 * existen dos variantes de cada tarjeta; reciben la misma forma siempre.
 *
 * Las notas anteriores al 5 de octubre de 2026 no tienen ingles y no se van
 * a traducir hacia atras, por eso FILTRO_EN deja fuera las que no lo tienen.
 * El sitio en ingles arranca casi vacio y se llena solo.
 */

import { IDIOMA } from "@/lib/i18n";

/** Columnas iguales en los dos idiomas. */
const COMUNES = "id,created_at,image_url,category,source_url,votes";

/**
 * La lista de columnas para el idioma de esta carga.
 *
 * En español se pedia "*". Ahora se nombran las columnas a proposito: con
 * "*" llegarian tambien title_en, summary_en y content_en en cada renglon,
 * o sea el doble de bytes por nota para no usarlos.
 */
export const CAMPOS = (
  IDIOMA === "en"
    ? `${COMUNES},title:title_en,summary:summary_en,content:content_en`
    : // En español se pide title_en de mas, solo como bandera: es la unica
      // forma de saber si la nota existe tambien en ingles, que es lo que
      // decide si la pagina anuncia una alternativa en hreflang.
      `${COMUNES},title,summary,content,title_en`
) as "*";
// El `as "*"` es por los tipos, no por lo que se manda. supabase-js analiza
// la cadena del select como tipo literal para deducir la forma del renglon,
// y una cadena armada en tiempo de ejecucion no la puede leer: falla con
// ParserError "Unexpected input: ,title_en". Decirle "*" le da justo la
// forma correcta, porque con los alias los renglones llegan con los mismos
// nombres de columna de la tabla en los dos idiomas. Lo que viaja a
// PostgREST sigue siendo la lista de arriba.

/** Columna que decide si una nota existe en este idioma. */
export const COLUMNA_TITULO = IDIOMA === "en" ? "title_en" : "title";
export const COLUMNA_RESUMEN = IDIOMA === "en" ? "summary_en" : "summary";

/**
 * Aplica el filtro de idioma a una consulta.
 *
 * En español no filtra nada. En ingles deja fuera las notas sin traducir,
 * que de otro modo saldrian con el titulo en blanco.
 */
export function soloDeEsteIdioma<T>(q: T): T {
  if (IDIOMA !== "en") return q;
  // @ts-expect-error el constructor de consultas de supabase-js encadena
  return q.not("title_en", "is", null);
}
