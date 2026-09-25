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

/**
 * Categorias del agente que ya cubre una seccion tematica.
 *
 * AVENTURA entra aqui aunque no tenga seccion propia: en Mexico se le dice
 * doble proposito a lo que en otros lados es adventure, y son la misma
 * moto. Tener las dos repartia el tema y los enlaces entre dos paginas.
 */
const CUBIERTAS_POR_SECCION = ["MOTOGP", "ELECTRICA", "ENDURO", "AVENTURA"];

/**
 * El orden de la fila, por familia y no por como venga la lista.
 *
 * Competencia primero, que es de lo que mas se publica; luego las de
 * campo, que van juntas porque quien busca una mira la otra; despues las
 * de calle, y al final las electricas, que son su propio mundo.
 */
const ORDEN = [
  "/motogp",
  "/categoria/superbike",
  "/motos-doble-proposito",
  "/enduro",
  "/categoria/sport",
  "/categoria/naked",
  "/motos-electricas",
];

const CategoryBar = () => {
  const todos = [
    ...HUBS.map((h) => ({ to: `/${h.slug}`, label: h.navLabel })),
    ...CATEGORIES.filter(
      (c) => c.value !== "NOTICIA" && !CUBIERTAS_POR_SECCION.includes(c.value)
    ).map((c) => ({ to: `/categoria/${c.slug}`, label: c.label })),
  ];

  // Lo que no este en ORDEN —una categoria nueva del agente— se va al
  // final en vez de desaparecer.
  const destinos = [...todos].sort((a, b) => {
    const ia = ORDEN.indexOf(a.to);
    const ib = ORDEN.indexOf(b.to);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

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
