import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsArticle {
  id: number;
  created_at: string;
  title: string | null;
  content: string | null;
  summary: string | null;
  image_url: string | null;
  category: string | null;
  source_url: string | null;
}

/** Las mas recientes, sin filtrar por categoria. */
export const useLatestNews = (limit = 9) => {
  return useQuery({
    queryKey: ["news", "latest", limit],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await supabase
        .from("moto_news")
        .select("*")
        .neq("category", "DESCARTADO")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

/** Las mas recientes de una categoria. `value` es el valor que guarda el agente. */
export const useNewsByCategory = (value: string, limit = 3) => {
  return useQuery({
    queryKey: ["news", "category", value, limit],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await supabase
        .from("moto_news")
        .select("*")
        .eq("category", value)
        .neq("category", "DESCARTADO")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

/**
 * Notas de una seccion tematica.
 *
 * Busca por categoria O por texto en el titulo y el resumen. El "o" existe
 * porque hasta que corra el reprocesamiento todas las notas estan marcadas
 * como NOTICIA: sin el match de texto, las secciones saldrian vacias aunque
 * haya cientos de notas del tema.
 */
export const useHubNews = (
  category: string,
  match: string[],
  limit = 6
) => {
  return useQuery({
    queryKey: ["news", "hub", category, match.join("|"), limit],
    queryFn: async (): Promise<NewsArticle[]> => {
      const conditions = [
        `category.eq.${category}`,
        ...match.map((t) => `title.ilike."*${t}*"`),
        ...match.map((t) => `summary.ilike."*${t}*"`),
      ].join(",");

      const { data, error } = await supabase
        .from("moto_news")
        .select("*")
        .or(conditions)
        .neq("category", "DESCARTADO")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

/** @deprecated se conserva por compatibilidad; usar useLatestNews. */
export const useNews = () => useLatestNews(9);
