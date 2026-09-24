import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HUBS } from "@/lib/hubs";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const hubs = HUBS;

  // Antes estos eran botones con scrollIntoView, que no hacian nada desde
  // /noticias porque la seccion no existe en esa pagina. Ahora es navegacion
  // real: cada categoria tiene su URL.
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-display text-xs tracking-widest transition-colors ${
      isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" onClick={close} className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-primary flex items-center justify-center neon-glow">
              <span className="font-display text-primary text-xs lg:text-sm font-bold">ML</span>
            </div>
            <span className="font-display text-foreground text-sm lg:text-base tracking-widest hidden sm:block">
              MOTO LAB <span className="text-primary">249</span>
            </span>
          </Link>

          {/* Navegacion de escritorio */}
          <div className="hidden lg:flex items-center gap-7">
            {hubs.map((hub) => (
              <NavLink key={hub.slug} to={`/${hub.slug}`} className={linkClass}>
                {hub.navLabel}
              </NavLink>
            ))}
            <NavLink to="/noticias" className={linkClass}>
              ARCHIVO
            </NavLink>
            <Button variant="nav" size="sm" asChild>
              <Link to="/#suscribete">SUSCRIBIRSE</Link>
            </Button>
          </div>

          {/* Boton de menu movil */}
          <button
            className="lg:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navegacion movil */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-4">
              {hubs.map((hub) => (
                <NavLink
                  key={hub.slug}
                  to={`/${hub.slug}`}
                  onClick={close}
                  className={linkClass}
                >
                  {hub.navLabel}
                </NavLink>
              ))}
              <NavLink to="/noticias" onClick={close} className={linkClass}>
                ARCHIVO
              </NavLink>
              <Button variant="nav" size="sm" asChild className="w-fit">
                <Link to="/#suscribete" onClick={close}>
                  SUSCRIBIRSE
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
