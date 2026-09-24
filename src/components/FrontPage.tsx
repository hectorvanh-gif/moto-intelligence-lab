import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLatestNews } from "@/hooks/useNews";
import NewsCard from "./NewsCard";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Las notas que siguen a la principal. La primera ya la muestra el Hero,
 * asi que aqui se salta: pide las mismas 5 para reusar la cache y arranca
 * en la segunda.
 */
const FrontPage = () => {
  const { data: news, isLoading, error } = useLatestNews(5);

  const rest = news?.slice(1) ?? [];

  return (
    <section id="portada" className="relative py-14 lg:py-20 scroll-mt-20">
      <div className="container mx-auto px-4 lg:px-8">
        {error && (
          <p className="text-center text-destructive font-medium py-10">
            Error al cargar las noticias. Intenta de nuevo más tarde.
          </p>
        )}

        {!error && (
          <>
            <div>
              <div className="flex items-end justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-8 rounded-sm bg-primary" />
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wide">
                    LO MÁS RECIENTE
                  </h2>
                </div>
                <Link
                  to="/noticias"
                  className="group inline-flex items-center gap-2 font-display text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors shrink-0"
                >
                  VER TODO
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading
                  ? [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-card rounded-lg overflow-hidden border border-border/50"
                      >
                        <Skeleton className="h-48 w-full" />
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))
                  : rest.map((article) => <NewsCard key={article.id} article={article} />)}
              </div>

              {!isLoading && rest.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                  Aún no hay noticias publicadas. Vuelve pronto.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="absolute inset-0 circuit-lines opacity-[0.07] pointer-events-none" />
    </section>
  );
};

export default FrontPage;
