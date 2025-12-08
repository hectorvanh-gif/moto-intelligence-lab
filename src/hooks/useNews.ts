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
}

export const useNews = () => {
  return useQuery({
    queryKey: ["news"],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await supabase
        .from("Motolab 09/24")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};
