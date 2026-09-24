import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NeonInput } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Captura de correos. Vivia dentro del Hero ocupando una pantalla completa;
 * ahora es una banda a media pagina, para que el contenido vaya primero.
 * El id es el destino del boton SUSCRIBIRSE del navbar.
 */
const NewsletterBand = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Ya estás registrado",
          description: "Este email ya forma parte del Lab 249.",
        });
      } else {
        toast({
          title: "Error al registrarse",
          description: "Intenta de nuevo en un momento.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "¡Bienvenido al Lab!",
        description: "Pronto recibirás inteligencia de alto octanaje.",
      });
      setEmail("");
    }
    setIsLoading(false);
  };

  return (
    <section
      id="suscribete"
      className="relative py-16 lg:py-20 border-y border-border/50 bg-card/40 scroll-mt-20"
    >
      <div className="absolute inset-0 circuit-lines opacity-10 pointer-events-none" />

      <div className="relative container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">
            LAS NOTAS QUE IMPORTAN, <span className="text-primary">UNA VEZ POR SEMANA</span>
          </h2>
          <p className="font-body text-muted-foreground mb-8">
            Sin relleno y sin spam. Lo que pasó en el motociclismo, filtrado y resumido.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <NeonInput
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="neon"
              size="lg"
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? "PROCESANDO..." : "UNIRME AL LAB 249"}
            </Button>
          </form>

          <p className="font-body text-sm text-muted-foreground mt-5">
            +500 pilotos ya reciben noticias cada semana
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBand;
