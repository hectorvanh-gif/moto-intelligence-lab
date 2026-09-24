import { Flame } from "lucide-react";
import { useMostVoted } from "@/hooks/useNews";
import NewsCard from "./NewsCard";

/**
 * El ranking de las notas mas votadas del ultimo mes.
 *
 * Si nadie ha votado, la seccion no se pinta. Con el trafico de hoy, una
 * fila de ceros le diria al visitante que aqui no viene nadie, y eso hace
 * mas dano que no tener la seccion.
 */
const MostVoted = () => {
  const { data: notas, isLoading } = useMostVoted(4, 30);

  if (isLoading || !notas || notas.length === 0) return null;

  return (
    <section
      id="mas-votado"
      className="relative py-14 lg:py-20 border-t border-border/50 scroll-mt-20"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
            <Flame className="w-4 h-4 text-primary" />
          </span>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wide">
              LO MÁS VOTADO
            </h2>
            <p className="font-body text-xs text-muted-foreground">
              Lo que eligieron los lectores este mes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {notas.map((nota) => (
            <NewsCard key={nota.id} article={nota} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostVoted;
