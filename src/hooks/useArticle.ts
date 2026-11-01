import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle } from "./useNews";
import { CAMPOS, soloDeEsteIdioma } from "@/lib/consulta";
import { IDIOMA } from "@/lib/i18n";

const VECINAS = 3;

/**
 * Las notas publicadas justo antes y justo despues, en la misma categoria.
 * La misma seleccion que vecinasDe en api/tarjeta.js: son las vecinas y no
 * las mas recientes para que las notas viejas tambien reciban enlaces.
 */
export const useNeighborArticles = (article: NewsArticle | null | undefined) => {
  const id = article?.id;
  const category = article?.category;
  const createdAt = article?.created_at;

  return useQuery({
    queryKey: ["article-neighbors", id, IDIOMA],
    enabled: !!id && !!category && !!createdAt && category !== "DESCARTADO",
    queryFn: async (): Promise<NewsArticle[]> => {
      const base = () =>
        soloDeEsteIdioma(
          supabase
            .from("moto_news")
            .select(CAMPOS)
            .eq("category", category as string)
            .neq("id", id as number)
        );

      const [nuevas, viejas] = await Promise.all([
        base()
          .gt("created_at", createdAt as string)
          .order("created_at", { ascending: true })
          .limit(VECINAS),
        base()
          .lt("created_at", createdAt as string)
          .order("created_at", { ascending: false })
          .limit(VECINAS),
      ]);

      if (nuevas.error) throw nuevas.error;
      if (viejas.error) throw viejas.error;
      return [...(nuevas.data || []).reverse(), ...(viejas.data || [])];
    },
  });
};

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
