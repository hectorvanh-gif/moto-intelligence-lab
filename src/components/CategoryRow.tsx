import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useNewsByCategory } from "@/hooks/useNews";
import type { Category } from "@/lib/categories";
import NewsCard from "./NewsCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  category: Category;
}

const CategoryRow = ({ category }: Props) => {
  const { data: articles, isLoading } = useNewsByCategory(category.value, 3);

  // Una categoria sin notas no pinta un bloque vacio: simplemente no aparece.
  if (!isLoading && (!articles || articles.length === 0)) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Encabezado del bloque */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-8 rounded-sm ${category.color}`} />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wide">
              {category.label}
            </h2>
          </div>
          <Link
            to={`/categoria/${category.slug}`}
            className="group inline-flex items-center gap-2 font-display text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            VER TODO
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border/50">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            : articles?.map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
      </div>
    </section>
  );
};

export default CategoryRow;
