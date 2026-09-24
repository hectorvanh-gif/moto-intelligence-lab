import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Clock } from "lucide-react";
import type { NewsArticle } from "@/hooks/useNews";
import { byValue, colorFor } from "@/lib/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { cleanText } from "@/lib/text";

interface Props {
  article?: NewsArticle;
  isLoading?: boolean;
}

const FeaturedStory = ({ article, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!article) return null;

  const category = byValue(article.category);
  const date = article.created_at
    ? format(new Date(article.created_at), "d 'de' MMMM, HH:mm", { locale: es })
    : "";

  return (
    <Link
      to={`/noticias/${article.id}`}
      className="group grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
    >
      {/* Imagen */}
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border/50 group-hover:border-primary/50 transition-colors">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title || "Nota principal"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-display font-bold tracking-widest rounded">
          LO ÚLTIMO
        </span>
      </div>

      {/* Texto */}
      <div>
        <div className="flex items-center gap-3 mb-5">
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
            {date}
          </time>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-5 group-hover:text-primary transition-colors">
          {cleanText(article.title)}
        </h2>

        {article.summary && (
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6 line-clamp-4">
            {cleanText(article.summary)}
          </p>
        )}

        <span className="inline-flex items-center gap-2 font-display text-sm tracking-widest text-primary">
          LEER LA NOTA
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

export default FeaturedStory;
