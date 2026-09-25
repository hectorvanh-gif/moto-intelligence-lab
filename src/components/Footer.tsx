import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import { COMUNIDAD_URL } from "@/lib/comunidad";
import { FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/redes";

/**
 * El pie. Tenia un segundo formulario de newsletter que mostraba
 * "Suscrito!" y no escribia en ninguna parte: ni Supabase, ni endpoint,
 * nada. Quien se diera de alta desde aqui quedaba convencido de estar
 * suscrito y su correo se tiraba. Se elimino; la banda de suscripcion real
 * queda justo encima del pie en todas las paginas.
 */
const Footer = () => {
  return (
    <footer className="relative bg-background py-16 lg:py-20 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
                <span className="font-display text-primary text-xs font-bold">
                  ML
                </span>
              </div>
              <span className="font-display text-foreground text-sm tracking-widest">
                MOTO LAB <span className="text-primary">249</span>
              </span>
            </div>
            <p className="font-body text-muted-foreground text-sm">
              Noticias de motociclismo para la
              comunidad en México.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8 lg:justify-center">
            <div>
              <h4 className="font-display text-xs tracking-widest text-foreground mb-4">
                SITIO
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/nosotros"
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Qué es Moto Lab 249
                  </Link>
                </li>
                <li>
                  <Link
                    to="/noticias"
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Archivo completo
                  </Link>
                </li>
                <li>
                  <a
                    href={COMUNIDAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Entrar a la comunidad
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-xs tracking-widest text-foreground mb-4">
                LEGAL
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Términos de Uso
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-xs tracking-widest text-foreground mb-4">
                SÍGUENOS
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook size={20} />
                  <span className="font-body text-sm">Facebook</span>
                </a>

                {/* Solo se pinta cuando haya cuenta de verdad: antes
                    apuntaba a instagram.com, la portada de Instagram. */}
                {INSTAGRAM_URL && (
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram size={20} />
                    <span className="font-body text-sm">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="digital-code">
            © 2026 MOTO LAB 249 // TODOS LOS DERECHOS RESERVADOS // MÉXICO
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
