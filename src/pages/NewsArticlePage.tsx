import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, ExternalLink, Clock, Tag } from "lucide-react";
import { useArticle } from "@/hooks/useArticle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_COLORS: Record<string, string> = {
  MOTOGP: "bg-red-600",
  SUPERBIKE: "bg-orange-600",
  ENDURO: "bg-green-700",
  AVENTURA: "bg-blue-700",
  NAKED: "bg-purple-700",
  SPORT: "bg-yellow-600",
  ELECTRICA: "bg-teal-600",
  NOTICIA: "bg-gray-600",
};

const NewsArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useArticle(id);

  const siteUrl = "https://moto-intelligence-lab.vercel.app";
  const articleUrl = `${siteUrl}/noticias/${id}`;

  const formattedDate = article?.created_at
    ? format(new Date(article.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })
    : "";

  const categoryColor = article?.category
    ? CATEGORY_COLORS[article.category] || "bg-gray-600"
    : "bg-gray-600";

  // JSON-LD NewsArticle structured data
  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.summary,
        image: article.image_url || `${siteUrl}/og-image.jpg`,
        datePublished: article.created_at,
        dateModified: article.created_at,
        author: {
          "@type": "Organization",
          name: "Moto Lab 09/24",
          url: siteUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "Moto Lab 09/24",
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

  return (
    <>
      <Helmet>
        <title>
          {article?.title
            ? `${article.title} | Moto Lab 09/24`
            : "Cargando artículo | Moto Lab 09/24"}
        </title>
        <meta
          name="description"
          content={article?.summary || "Noticias de motociclismo curadas por IA para México."}
        />
        <link rel="canonical" href={articleUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article?.title || "Moto Lab 09/24"} />
        <meta
          property="og:description"
          content={article?.summary || "Noticias de motociclismo curadas por IA para México."}
        />
        <meta
          property="og:image"
          content={article?.image_url || `${siteUrl}/og-image.jpg`}
        />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:site_name" content="Moto Lab 09/24" />
        <meta property="article:published_time" content={article?.created_at || ""} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article?.title || "Moto Lab 09/24"} />
        <meta
          name="twitter:description"
          content={article?.summary || "Noticias de motociclismo curadas por IA para México."}
        />
        <meta
          name="twitter:image"
          content={article?.image_url || `${siteUrl}/og-image.jpg`}
        />

        {/* JSON-LD */}
        {jsonLd && (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        )}
      </Helmet>

      <div className="min-h-screen bg-background">
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
                    {article.category}
                  </span>
                )}
                <time className="flex items-center gap-1.5 text-muted-foreground text-sm font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {formattedDate}
                </time>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                {article.title}
              </h1>

              {/* Summary */}
              {article.summary && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-5 italic">
                  {article.summary}
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
                  {article.content.split("\n").filter(Boolean).map((paragraph, i) => (
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
