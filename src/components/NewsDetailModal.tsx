import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NewsArticle } from "@/hooks/useNews";

interface NewsDetailModalProps {
  article: NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsDetailModal = ({ article, open, onOpenChange }: NewsDetailModalProps) => {
  if (!article) return null;

  const formattedDate = article.created_at
    ? format(new Date(article.created_at), "d 'de' MMMM, yyyy • HH:mm 'UTC'", { locale: es })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-card border-border overflow-hidden">
        {/* Header Image */}
        {article.image_url && (
          <div className="relative h-64 w-full">
            <img
              src={article.image_url}
              alt={article.title || "Noticia"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            
            {/* Category on image */}
            {article.category && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-sm font-display font-bold tracking-wider rounded">
                {article.category.toUpperCase()}
              </span>
            )}
          </div>
        )}

        <div className="p-6 pt-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {article.title || "Sin título"}
            </DialogTitle>
            <time className="block text-sm text-muted-foreground font-mono mt-2">
              {formattedDate}
            </time>
          </DialogHeader>

          <ScrollArea className="max-h-[40vh] pr-4">
            <div className="prose prose-invert max-w-none">
              {article.content ? (
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              ) : article.summary ? (
                <p className="text-foreground/90 leading-relaxed">
                  {article.summary}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No hay contenido disponible para este artículo.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailModal;
