/**
 * Fuente de verdad de las categorias.
 *
 * `value` es exactamente lo que el agente guarda en la columna `category` de
 * Supabase (ver el prompt de scripts/news_agent.py). Si ahi se agrega una
 * categoria nueva, se agrega aqui tambien o no aparece en el sitio.
 *
 * `slug` es lo que va en la URL. `label` es lo que se le muestra a la gente.
 */
export interface Category {
  value: string;
  slug: string;
  label: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { value: "MOTOGP", slug: "motogp", label: "MOTOGP", color: "bg-red-600" },
  { value: "SUPERBIKE", slug: "superbike", label: "SUPERBIKE", color: "bg-orange-600" },
  { value: "ELECTRICA", slug: "electricas", label: "ELÉCTRICAS", color: "bg-teal-600" },
  { value: "AVENTURA", slug: "aventura", label: "AVENTURA", color: "bg-blue-700" },
  { value: "ENDURO", slug: "enduro", label: "ENDURO", color: "bg-green-700" },
  { value: "SPORT", slug: "sport", label: "SPORT", color: "bg-yellow-600" },
  { value: "NAKED", slug: "naked", label: "NAKED", color: "bg-purple-700" },
  { value: "NOTICIA", slug: "noticia", label: "NOTICIA", color: "bg-gray-600" },
];

/** Las que aparecen en el navbar. El resto vive en el archivo. */
export const NAV_CATEGORY_SLUGS = ["motogp", "superbike", "electricas", "aventura"];

/** Las que tienen su propio bloque en la portada, en este orden. */
export const HOME_CATEGORY_SLUGS = ["motogp", "electricas", "aventura"];

export const bySlug = (slug?: string): Category | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const byValue = (value?: string | null): Category | undefined =>
  CATEGORIES.find((c) => c.value === value);

export const colorFor = (value?: string | null): string =>
  byValue(value)?.color ?? "bg-gray-600";

export const navCategories = (): Category[] =>
  NAV_CATEGORY_SLUGS.map(bySlug).filter((c): c is Category => Boolean(c));

export const homeCategories = (): Category[] =>
  HOME_CATEGORY_SLUGS.map(bySlug).filter((c): c is Category => Boolean(c));
