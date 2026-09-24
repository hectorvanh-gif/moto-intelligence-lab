/**
 * Limpia texto que viene de las fuentes con HTML adentro.
 *
 * Cerca de un tercio de los resumenes guardados traen etiquetas crudas
 * (<li>, <br>) o entidades (&#39;), porque el agente no limpiaba lo que
 * bajaba de NewsAPI. Eso ya se arreglo en scripts/news_agent.py, pero las
 * filas viejas siguen ahi, asi que el sitio tambien limpia al mostrar.
 */
const NAMED: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
  "&laquo;": "«",
  "&raquo;": "»",
  "&iexcl;": "¡",
  "&iquest;": "¿",
};

export const cleanText = (raw?: string | null): string => {
  if (!raw) return "";

  let out = raw.replace(/<[^>]*>/g, " ");

  // Entidades numericas: &#39; y &#x27;
  out = out.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

  for (const [entity, char] of Object.entries(NAMED)) {
    out = out.split(entity).join(char);
  }

  return out.replace(/\s+/g, " ").trim();
};
