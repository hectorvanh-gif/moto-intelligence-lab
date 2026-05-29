import { Link } from "react-router-dom";
import { useNews } from "@/hooks/useNews";
import NewsCard from "./NewsCard";
import { Skeleton } from "@/components/ui/skeleton";

const NewsCardSkeleton = () => (
  <div className="bg-card rounded-lg overflow-hidden border border-border/50">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

const NewsSection = () => {
  const { data: news, isLoading, error } = useNews();

  return (
    <section id="noticias" className="relative py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            className="glitch font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            data-text="NOTICIAS DE MOTOS"
          >
            NOTICIAS DE MOTOS
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Las últimas noticias del mundo del motociclismo, curadas por IA y actualizadas automáticamente.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive font-medium">
              Error al cargar las noticias. Intenta de nuevo más tarde.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(9)].map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && news && news.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {news.map((article, index) => (
                <div
                  key={article.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <NewsCard article={article} />
                </div>
              ))}
            </div>

            {/* Link to full archive */}
            <div className="text-center mt-12">
              <Link
                to="/noticias"
                className="inline-flex items-center gap-2 px-8 py-3 border border-primary/50 text-primary font-display text-sm tracking-widest hover:bg-primary hover:text-white transition-all duration-300 rounded"
              >
                VER TODAS LAS NOTICIAS →
              </Link>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && news && news.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card border border-border flex items-center justify-center">
              <span className="text-2xl">📰</span>
            </div>
            <p className="text-muted-foreground">
              Aún no hay noticias publicadas. ¡Vuelve pronto!
            </p>
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 circuit-lines opacity-10 pointer-events-none" />
    </section>
  );
};

export default NewsSection;
