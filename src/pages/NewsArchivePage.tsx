import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNewsArchive, PAGE_SIZE } from "@/hooks/useNewsArchive";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["TODAS", "MOTOGP", "SUPERBIKE", "ENDURO", "AVENTURA", "NAKED", "SPORT", "ELECTRICA", "NOTICIA"];

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

const NewsArchivePage = () => {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("TODAS");
  const { data, isLoading } = useNewsArchive(page, activeCategory);

  const articles = data?.articles || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Archivo de Noticias | Moto Lab 09/24</title>
        <meta
          name="description"
          content="Todas las noticias de motociclismo curadas por IA — MotoGP, Superbike, motos eléctricas y más. El medio de motos en México."
        />
        <link rel="canonical" href="https://moto-intelligence-lab.vercel.app/noticias" />
        <meta property="og:title" content="Archivo de Noticias | Moto Lab 09/24" />
        <meta property="og:description" content="Todas las noticias de motociclismo curadas por IA para México." />
        <meta property="og:url" content="https://moto-intelligence-lab.vercel.app/noticias" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              ARCHIVO DE <span className="text-primary">NOTICIAS</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <p className="text-muted-foreground">
              {total} artículos publicados — actualizados diariamente por IA
            </p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-4 py-1.5 text-xs font-display font-bold tracking-widest rounded transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border/50">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!isLoading && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const categoryColor = article.category
                  ? CATEGORY_COLORS[article.category] || "bg-gray-600"
                  : "bg-gray-600";
                const date = article.created_at
                  ? format(new Date(article.created_at), "d MMM yyyy", { locale: es })
                  : "";

                return (
                  <Link
                    key={article.id}
                    to={`/noticias/${article.id}`}
                    className="group bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title || "Noticia"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-card to-background flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Sin imagen</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      {article.category && (
                        <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-display font-bold tracking-wider text-white rounded ${categoryColor}`}>
                          {article.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 space-y-2">
                      <h2 className="font-display font-bold text-foreground text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                        {article.summary}
                      </p>
                      <time className="text-xs text-muted-foreground/70 font-mono tracking-wider">
                        {date}
                      </time>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && articles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No hay artículos en esta categoría aún.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-display tracking-wider"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                ANTERIOR
              </Button>
              <span className="font-mono text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="font-display tracking-wider"
              >
                SIGUIENTE
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NewsArchivePage;
