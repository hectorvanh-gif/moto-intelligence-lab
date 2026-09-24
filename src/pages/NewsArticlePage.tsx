import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, ExternalLink, Clock, Tag } from "lucide-react";
import { useArticle } from "@/hooks/useArticle";
import { SITE_URL } from "@/lib/site";
import { cleanText } from "@/lib/text";
import { byValue, colorFor } from "@/lib/categories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VoteButton from "@/components/VoteButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeta } from "@/hooks/useMeta";

const NewsArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useArticle(id);

  const siteUrl = SITE_URL;
  const articleUrl = `${siteUrl}/noticias/${id}`;

  const formattedDate = article?.created_at
    ? format(new Date(article.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })
    : "";

  const categoryColor = colorFor(article?.category);
  const category = byValue(article?.category);

  // JSON-LD NewsArticle structured data
  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: cleanText(article.title),
        description: cleanText(article.summary),
        image: article.image_url || `${siteUrl}/og-image.jpg`,
        datePublished: article.created_at,
        dateModified: article.created_at,
        author: {
          "@type": "Organization",
          name: "Moto Lab 249",
          url: siteUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "Moto Lab 249",
          url: siteUrl,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/favicon.svg`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": articleUrl,
        },
      }
    : null;

  const titulo = article?.title
    ? `${cleanText(article.title)} | Moto Lab 249`
    : "Cargando artículo | Moto Lab 249";
  const descripcion =
    cleanText(article?.summary) || "Noticias de motociclismo para México.";

  useMeta({
    title: titulo,
    description: descripcion,
    canonical: articleUrl,
    image: article?.image_url || `${siteUrl}/og-image.jpg`,
    type: "article",
    jsonLd,
  });

  return (
    <>
      <div className="min-h-screen bg-background pt-16 lg:pt-20">
        <Navbar />

        <main className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
          {/* Back button */}
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-display text-sm tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            VOLVER AL ARCHIVO
          </Link>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <p className="text-destructive text-lg">Artículo no encontrado.</p>
              <Link to="/noticias" className="text-primary hover:underline mt-4 block">
                Ver todas las noticias
              </Link>
            </div>
          )}

          {/* Article */}
          {article && !isLoading && (
            <article>
              {/* Category + Date */}
              <div className="flex items-center gap-4 mb-6">
                {article.category && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-display font-bold tracking-widest text-white ${categoryColor}`}
                  >
                    <Tag className="w-3 h-3" />
                    {category?.label ?? article.category}
                  </span>
                )}
                <time className="flex items-center gap-1.5 text-muted-foreground text-sm font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {formattedDate}
                </time>
                <div className="ml-auto">
                  <VoteButton
                    articleId={article.id}
                    votes={article.votes}
                    size="lg"
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                {cleanText(article.title)}
              </h1>

              {/* Summary */}
              {article.summary && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-5 italic">
                  {cleanText(article.summary)}
                </p>
              )}

              {/* Hero Image */}
              {article.image_url && (
                <div className="rounded-lg overflow-hidden mb-10 aspect-video">
                  <img
                    src={article.image_url}
                    alt={article.title || "Imagen del artículo"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              {article.content && (
                <div className="prose prose-invert prose-lg max-w-none mb-12 font-body leading-relaxed text-muted-foreground">
                  {article.content
                    .split("\n")
                    .map((paragraph) => cleanText(paragraph))
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p key={i} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-border/50 pt-8 mt-8">
                <p className="text-sm text-muted-foreground mb-4 font-display tracking-wider">
                  FUENTE ORIGINAL
                </p>
                <a
                  href={article.source_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Ver noticia original
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </article>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NewsArticlePage;
