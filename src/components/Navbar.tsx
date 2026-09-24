import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CategoryBar from "./CategoryBar";

/**
 * La barra de arriba: logotipo, archivo y suscribirse. La navegacion por
 * tema esta en CategoryBar, el renglon de abajo.
 *
 * Ya no hay menu hamburguesa. Tenia sentido cuando cargaba las cuatro
 * secciones, pero esas se fueron a la fila de categorias y quedaron dos
 * enlaces, que caben de sobra en un telefono. Ademas el panel desplegado
 * tapaba la fila de categorias, asi que abrir el menu escondia justo la
 * navegacion que importa.
 */
const Navbar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-display text-xs tracking-widest transition-colors ${
      isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-primary flex items-center justify-center neon-glow">
                <span className="font-display text-primary text-xs lg:text-sm font-bold">
                  ML
                </span>
              </div>
              <span className="font-display text-foreground text-sm lg:text-base tracking-widest hidden sm:block">
                MOTO LAB <span className="text-primary">249</span>
              </span>
            </Link>

            <div className="flex items-center gap-4 lg:gap-7">
              <NavLink to="/noticias" className={linkClass}>
                ARCHIVO
              </NavLink>
              <Button variant="nav" size="sm" asChild>
                <Link to="/#suscribete">SUSCRIBIRSE</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <CategoryBar />
    </>
  );
};

export default Navbar;
