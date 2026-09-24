import { NavLink } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";
import { HUBS } from "@/lib/hubs";

/**
 * La unica fila de navegacion por tema del sitio.
 *
 * Primero las cuatro secciones tematicas, que son las paginas con guia
 * propia y las que pelean las busquedas con volumen. Despues las
 * categorias del agente que no tienen seccion, apuntando al archivo
 * filtrado.
 *
 * Esta fila reemplazo los enlaces de seccion del navbar. Cuando estaban
 * las dos cosas, el encabezado repetia MOTOGP, ELECTRICAS y ENDURO en dos
 * renglones: mucho ruido para la misma navegacion.
 *
 * NOTICIA se queda fuera: no es un tema, es la etiqueta de lo que el
 * agente no supo clasificar.
 *
 * En pantallas chicas la fila se desplaza en horizontal en vez de
 * apilarse; ocho chips en dos renglones se comen la pantalla del telefono
 * antes de que aparezca una sola noticia.
 */

/** Categorias del agente que ya cubre una seccion tematica. */
const CUBIERTAS_POR_SECCION = ["MOTOGP", "ELECTRICA", "ENDURO"];

const CategoryBar = () => {
  const destinos = [
    ...HUBS.map((h) => ({ to: `/${h.slug}`, label: h.navLabel })),
    ...CATEGORIES.filter(
      (c) => c.value !== "NOTICIA" && !CUBIERTAS_POR_SECCION.includes(c.value)
    ).map((c) => ({ to: `/categoria/${c.slug}`, label: c.label })),
  ];

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
          {destinos.map((d) => (
            <NavLink key={d.to} to={d.to} className={clase}>
              {d.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
