import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle } from "./useNews";

export const useArticle = (id: string | undefined) => {
  return useQuery({
    queryKey: ["article", id],
    enabled: !!id,
    queryFn: async (): Promise<NewsArticle | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("moto_news")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) throw error;
      return data;
    },
  });
};
