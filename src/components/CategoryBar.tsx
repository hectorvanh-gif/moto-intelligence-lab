import { NavLink } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";
import { HUBS } from "@/lib/hubs";

/**
 * La fila de categorias del encabezado.
 *
 * Cada chip apunta a la mejor pagina que exista para su categoria. Donde
 * hay seccion tematica se usa esa —tiene guia propia y ademas las notas—,
 * y donde no, al archivo filtrado. Sin esta regla el encabezado tendria
 * dos "MOTOGP" llevando a paginas distintas, una debajo de la otra, y el
 * peso de los enlaces se repartiria entre dos paginas parecidas.
 *
 * NOTICIA se queda fuera: no es un tema, es la etiqueta de lo que el
 * agente no supo clasificar. Un chip que diga "NOTICIA" no le dice nada a
 * nadie.
 *
 * En pantallas chicas la fila se desplaza en horizontal en vez de
 * apilarse: siete chips en dos renglones se comen la pantalla del telefono
 * antes de que aparezca una sola noticia.
 */

/** La categoria del agente que le corresponde a cada seccion tematica. */
const SECCION_DE = {
  MOTOGP: "motogp",
  ELECTRICA: "motos-electricas",
  ENDURO: "enduro",
} as const;

const destinoDe = (value: string) => {
  const slug = SECCION_DE[value as keyof typeof SECCION_DE];
  if (slug && HUBS.some((h) => h.slug === slug)) return `/${slug}`;
  const cat = CATEGORIES.find((c) => c.value === value);
  return `/categoria/${cat?.slug ?? ""}`;
};

const CategoryBar = () => {
  const chips = CATEGORIES.filter((c) => c.value !== "NOTICIA");

  const clase = ({ isActive }: { isActive: boolean }) =>
    `shrink-0 px-3 py-1.5 rounded-sm border font-display text-xs tracking-widest transition-colors ${
      isActive
        ? "border-primary text-primary bg-primary/10"
        : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
    }`;

  return (
    <div className="fixed top-16 lg:top-20 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-2 py-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {chips.map((c) => (
            <NavLink key={c.value} to={destinoDe(c.value)} className={clase}>
              {c.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
