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
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

/** @deprecated se conserva por compatibilidad; usar useLatestNews. */
export const useNews = () => useLatestNews(9);
