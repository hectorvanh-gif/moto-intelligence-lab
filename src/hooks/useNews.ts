import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CAMPOS,
  COLUMNA_RESUMEN,
  COLUMNA_TITULO,
  soloDeEsteIdioma,
} from "@/lib/consulta";
import { IDIOMA } from "@/lib/i18n";

export interface NewsArticle {
  id: number;
  created_at: string;
  title: string | null;
  content: string | null;
  summary: string | null;
  image_url: string | null;
  category: string | null;
  source_url: string | null;
  /** Contador de votos. Se suma desde api/votar.js, nunca desde el navegador. */
  votes: number | null;
  /**
   * Solo llega en español, y solo como bandera: dice si la nota existe
   * tambien en ingles. En ingles no viene, porque alla `title` YA es el
   * titulo en ingles.
   */
  title_en?: string | null;
}

/** Las mas recientes, sin filtrar por categoria. */
export const useLatestNews = (limit = 9) => {
  return useQuery({
    // El idioma va en la llave: sin el, react-query le serviria a /en lo
    // que ya tenia cacheado en español bajo la misma llave.
    queryKey: ["news", "latest", limit, IDIOMA],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await soloDeEsteIdioma(
        supabase
          .from("moto_news")
          .select(CAMPOS)
          .neq("category", "DESCARTADO")
      )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

/**
 * Las mas votadas de los ultimos dias.
 *
 * Solo trae notas con al menos un voto. Una seccion de "lo mas votado"
 * llena de ceros se ve peor que no tenerla: le dice al visitante que aqui
 * nadie participa.
 */
export const useMostVoted = (limit = 4, dias = 30) => {
  return useQuery({
    queryKey: ["news", "votadas", limit, dias, IDIOMA],
    queryFn: async (): Promise<NewsArticle[]> => {
      const desde = new Date(Date.now() - dias * 86400000).toISOString();
      const { data, error } = await soloDeEsteIdioma(
        supabase
          .from("moto_news")
          .select(CAMPOS)
          .neq("category", "DESCARTADO")
          .gt("votes", 0)
          .gte("created_at", desde)
      )
        .order("votes", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

/** Las mas recientes de una categoria. `value` es el valor que guarda el agente. */
export const useNewsByCategory = (value: string, limit = 3) => {
  return useQuery({
    queryKey: ["news", "category", value, limit, IDIOMA],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await soloDeEsteIdioma(
        supabase
          .from("moto_news")
          .select(CAMPOS)
          .eq("category", value)
          .neq("category", "DESCARTADO")
      )
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
    queryKey: ["news", "hub", category, match.join("|"), limit, IDIOMA],
    queryFn: async (): Promise<NewsArticle[]> => {
      // El match de texto busca en la columna del idioma que toca: en /en
      // no sirve buscar "eléctrica" dentro de un titulo en ingles.
      const conditions = [
        `category.eq.${category}`,
        ...match.map((t) => `${COLUMNA_TITULO}.ilike."*${t}*"`),
        ...match.map((t) => `${COLUMNA_RESUMEN}.ilike."*${t}*"`),
      ].join(",");

      const { data, error } = await soloDeEsteIdioma(
        supabase
          .from("moto_news")
          .select(CAMPOS)
          .or(conditions)
          .neq("category", "DESCARTADO")
      )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

/** @deprecated se conserva por compatibilidad; usar useLatestNews. */
export const useNews = () => useLatestNews(9);
