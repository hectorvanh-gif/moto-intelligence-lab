import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NeonInput } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const vantaRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadVanta = async () => {
      const THREE = await import("three");
      // @ts-ignore
      const NET = await import("vanta/dist/vanta.net.min");
      if (mounted && vantaRef.current && !vantaEffect.current) {
        vantaEffect.current = NET.default({
          el: vantaRef.current,
          THREE,
          color: 0xef4444,
          backgroundColor: 0x0a0a0a,
          points: 10.0,
          maxDistance: 22.0,
          spacing: 17.0,
          showDots: true,
        });
      }
    };

    loadVanta();

    return () => {
      mounted = false;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email",
        variant: "destructive"
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
          description: "Este email ya forma parte del Lab 09/24.",
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
        description: "Pronto recibirás inteligencia de alto octanaje."
      });
      setEmail("");
    }
    setIsLoading(false);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      {/* Vanta 3D NET animated background */}
      <div ref={vantaRef} className="absolute inset-0" />

      {/* Overlay gradients for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 circuit-lines opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 animate-slide-up">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <span className="font-display text-xs tracking-widest text-primary">
              SISTEMA ACTIVO
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight mb-6 animate-slide-up animation-delay-100">
            LA INTELIGENCIA ARTIFICIAL{" "}
            <span className="text-gradient-red">AL SERVICIO</span>{" "}
            DE TU PASIÓN.
          </h1>

          {/* Subheadline */}
          <p className="font-body text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-200 leading-relaxed">
            Noticias globales de motociclismo, curadas por agentes de IA para la comunidad en México.{" "}
            <span className="text-foreground font-semibold">Sin relleno, directo a la vena.</span>
          </p>

          {/* CTA Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto animate-slide-up animation-delay-300">
            <NeonInput
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="hero" size="xl" disabled={isLoading} className="whitespace-nowrap">
              {isLoading ? "PROCESANDO..." : "UNIRME AL LAB 09/24"}
            </Button>
          </form>

          {/* Trust indicator */}
          <p className="font-body text-sm text-muted-foreground mt-6 animate-slide-up animation-delay-400">
            +500 pilotos ya reciben noticias cada semana
          </p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
