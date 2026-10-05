import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle } from "./useNews";
import { CAMPOS, soloDeEsteIdioma } from "@/lib/consulta";
import { IDIOMA } from "@/lib/i18n";

const PAGE_SIZE = 9;

export const useNewsArchive = (page: number = 1, category?: string) => {
  return useQuery({
    queryKey: ["news-archive", page, category, IDIOMA],
    queryFn: async (): Promise<{ articles: NewsArticle[]; total: number }> => {
      // El filtro de idioma va antes del range: si no, el conteo y la
      // paginacion serian los del catalogo en español y el archivo en
      // ingles mostraria paginas vacias.
      let query = soloDeEsteIdioma(
        supabase
          .from("moto_news")
          .select(CAMPOS, { count: "exact" })
          .neq("category", "DESCARTADO")
      )
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
