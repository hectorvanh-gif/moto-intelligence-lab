import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { NewsArticle } from "@/hooks/useNews";

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard = ({ article }: NewsCardProps) => {
  const formattedDate = article.created_at
    ? format(new Date(article.created_at), "yyyy.MM.dd // HH:mm 'UTC'", { locale: es })
    : "";

  const getSummary = () => {
    if (article.summary) return article.summary;
    if (article.content) {
      const words = article.content.split(" ").slice(0, 20);
      return words.join(" ") + (article.content.split(" ").length > 20 ? "..." : "");
    }
    return "Sin contenido disponible";
  };

  return (
    <Link
      to={`/noticias/${article.id}`}
      className="group relative bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 electric-hover block"
    >
      {/* Image Container */}
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

        {/* Category Tag */}
        {article.category && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-display font-bold tracking-wider rounded">
            {article.category.toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-display font-bold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {article.title || "Sin título"}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {getSummary()}
        </p>
        <time className="block text-xs text-muted-foreground/70 font-mono tracking-wider">
          {formattedDate}
        </time>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg shadow-[0_0_30px_rgba(255,30,30,0.15)]" />
    </Link>
  );
};

export default NewsCard;
