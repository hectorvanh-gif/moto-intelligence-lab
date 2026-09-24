import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNewsArchive, PAGE_SIZE } from "@/hooks/useNewsArchive";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CATEGORIES, bySlug } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";

/**
 * Sirve dos rutas:
 *   /noticias            -> todo el archivo
 *   /categoria/:slug     -> una categoria
 *
 * Antes el filtro era estado local, asi que no se podia enlazar ni compartir
 * "las de MotoGP" y Google veia una sola pagina.
 */
const NewsArchivePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const category = bySlug(slug);
  const [page, setPage] = useState(1);

  // Al cambiar de categoria hay que volver a la primera pagina, o se queda
  // pidiendo la pagina 7 de una categoria que tiene dos.
  useEffect(() => {
    setPage(1);
  }, [slug]);

  const { data, isLoading } = useNewsArchive(page, category?.value ?? "TODAS");

  const articles = data?.articles || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const heading = category ? category.label : "ARCHIVO DE NOTICIAS";
  const canonical = category ? `${SITE_URL}/categoria/${category.slug}` : `${SITE_URL}/noticias`;
  const title = category
    ? `${category.label} | Moto Lab 249`
    : "Archivo de Noticias | Moto Lab 249";
  const description = category
    ? `Noticias de ${category.label.toLowerCase()}: resultados, lanzamientos y lo ultimo del motociclismo en México.`
    : "Archivo completo de noticias de motos: MotoGP, eléctricas, doble propósito, enduro y lanzamientos. El medio de motociclismo de México.";

  // Un slug que no existe no debe fingir una categoria vacia.
  if (slug && !category) {
    return (
      <div className="min-h-screen bg-background pt-28 lg:pt-32">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Esa categoría no existe
          </h1>
          <Link to="/noticias" className="text-primary hover:underline font-display text-sm tracking-wider">
            VER TODO EL ARCHIVO
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  useMeta({ title, description, canonical });

  return (
    <>
      <div className="min-h-screen bg-background pt-28 lg:pt-32">
        <Navbar />

        <main className="container mx-auto px-4 lg:px-8 py-16">
          {/* Encabezado */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {category ? (
                heading
              ) : (
                <>
                  ARCHIVO DE <span className="text-primary">NOTICIAS</span>
                </>
              )}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <p className="text-muted-foreground">
              {total} {total === 1 ? "artículo" : "artículos"}
              {category ? ` en ${category.label.toLowerCase()}` : " publicados"} — actualizado
              todos los días
            </p>
          </div>

          {/* Filtros: ahora son enlaces con URL propia */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link
              to="/noticias"
              className={`px-4 py-1.5 text-xs font-display font-bold tracking-widest rounded transition-all duration-200 ${
                !category
                  ? "bg-primary text-white"
                  : "border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              TODAS
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/categoria/${cat.slug}`}
                className={`px-4 py-1.5 text-xs font-display font-bold tracking-widest rounded transition-all duration-200 ${
                  category?.slug === cat.slug
                    ? "bg-primary text-white"
                    : "border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Cargando */}
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

          {/* Rejilla */}
          {!isLoading && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Vacio */}
          {!isLoading && articles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No hay artículos en esta categoría aún.
              </p>
            </div>
          )}

          {/* Paginacion */}
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
