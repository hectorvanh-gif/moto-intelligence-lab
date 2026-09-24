import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLatestNews } from "@/hooks/useNews";
import { byValue, colorFor } from "@/lib/categories";
import { cleanText } from "@/lib/text";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * La portada abre con la nota del dia, no con un eslogan. Antes habia un
 * video de 11 MB de fondo con una frase encima: pesaba mas que todo el
 * resto del sitio junto y lo primero que veia el lector no era una noticia.
 *
 * El h1 se queda en la linea chica de arriba ("NOTICIAS DE MOTOS EN
 * MEXICO"). Es lo que le dice al buscador de que trata el sitio y no cambia
 * cada manana. El titular de la nota, que si cambia, va como h2 aunque en
 * pantalla se vea mucho mas grande: jerarquia visual y jerarquia semantica
 * no tienen por que coincidir.
 *
 * Pide las mismas 5 notas que FrontPage para compartir la cache de react
 * query y no disparar una segunda consulta.
 */
const Hero = () => {
  const { data: news, isLoading } = useLatestNews(5);
  const article = news?.[0];

  const category = article ? byValue(article.category) : undefined;
  const fecha = article?.created_at
    ? format(new Date(article.created_at), "d 'de' MMMM, HH:mm", { locale: es })
    : "";

  return (
    <section
      id="hero"
      className="relative min-h-[62vh] lg:min-h-[70vh] flex items-end overflow-hidden pt-16 lg:pt-20"
    >
      {/* Fondo: la foto de la nota */}
      {article?.image_url ? (
        <img
          src={article.image_url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-card to-background" />
      )}

      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 circuit-lines opacity-20 pointer-events-none" />

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl">
          <h1 className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6 animate-slide-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <span className="font-display text-xs tracking-widest text-primary">
              NOTICIAS DE MOTOS EN MÉXICO
            </span>
          </h1>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-16 w-full max-w-xl" />
            </div>
          )}

          {!isLoading && article && (
            <>
              <div className="flex items-center gap-3 mb-4 animate-slide-up animation-delay-100">
                {category && (
                  <span
                    className={`px-2.5 py-1 text-xs font-display font-bold tracking-wider text-white rounded ${colorFor(
                      article.category
                    )}`}
                  >
                    {category.label}
                  </span>
                )}
                <time className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  {fecha}
                </time>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-5 animate-slide-up animation-delay-100">
                <Link
                  to={`/noticias/${article.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {cleanText(article.title)}
                </Link>
              </h2>

              {article.summary && (
                <p className="font-body text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8 animate-slide-up animation-delay-200 leading-relaxed line-clamp-3">
                  {cleanText(article.summary)}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-300">
                <Button variant="hero" size="lg" asChild>
                  <Link to={`/noticias/${article.id}`}>
                    LEER LA NOTA
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#portada">VER LO ÚLTIMO</a>
                </Button>
              </div>
            </>
          )}

          {!isLoading && !article && (
            <p className="font-body text-lg text-muted-foreground">
              Aún no hay noticias publicadas. Vuelve pronto.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
