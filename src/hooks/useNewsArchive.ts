import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle } from "./useNews";

const PAGE_SIZE = 9;

export const useNewsArchive = (page: number = 1, category?: string) => {
  return useQuery({
    queryKey: ["news-archive", page, category],
    queryFn: async (): Promise<{ articles: NewsArticle[]; total: number }> => {
      let query = supabase
        .from("moto_news")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (category && category !== "TODAS") {
        query = query.eq("category", category);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { articles: data || [], total: count || 0 };
    },
  });
};

export { PAGE_SIZE };
