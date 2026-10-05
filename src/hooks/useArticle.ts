import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle } from "./useNews";
import { CAMPOS } from "@/lib/consulta";
import { IDIOMA } from "@/lib/i18n";

/**
 * Una nota por id.
 *
 * A diferencia de los listados, aqui NO se filtran las notas sin ingles.
 * Si se filtraran, una nota vieja abierta desde /en daria "no encontrada",
 * que es mentira: existe, solo que en español. Llega con title en null y la
 * pagina manda al lector a la version en español.
 */
export const useArticle = (id: string | undefined) => {
  return useQuery({
    queryKey: ["article", id, IDIOMA],
    enabled: !!id,
    queryFn: async (): Promise<NewsArticle | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("moto_news")
        .select(CAMPOS)
        .eq("id", Number(id))
        .single();

      if (error) throw error;
      return data;
    },
  });
};
