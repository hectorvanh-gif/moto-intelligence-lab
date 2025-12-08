import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NeonInput } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Instagram } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "¡Suscrito!",
      description: "Bienvenido al Lab. Prepárate para la inteligencia.",
    });
    setEmail("");
  };

  return (
    <footer className="relative bg-background py-16 lg:py-20 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
                <span className="font-display text-primary text-xs font-bold">
                  ML
                </span>
              </div>
              <span className="font-display text-foreground text-sm tracking-widest">
                MOTO LAB <span className="text-primary">09/24</span>
              </span>
            </div>
            <p className="font-body text-muted-foreground text-sm">
              Centro de inteligencia motociclista potenciado por IA para la
              comunidad en México.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8 lg:justify-center">
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
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram size={20} />
                <span className="font-body text-sm">Instagram</span>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-xs tracking-widest text-foreground mb-4">
              NEWSLETTER
            </h4>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <NeonInput
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-10"
              />
              <Button type="submit" variant="neon" size="sm">
                UNIRME
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="digital-code">
            © 2024 MOTO LAB 09/24 // TODOS LOS DERECHOS RESERVADOS // MÉXICO
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
