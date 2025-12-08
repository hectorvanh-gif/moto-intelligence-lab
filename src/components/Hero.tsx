import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NeonInput } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";
const Hero = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
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
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "¡Bienvenido al Lab!",
        description: "Pronto recibirás inteligencia de alto octanaje."
      });
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };
  return <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroBg})`
    }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 circuit-lines opacity-30" />
      </div>

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
            <NeonInput type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1" />
            <Button type="submit" variant="hero" size="xl" disabled={isLoading} className="whitespace-nowrap">
              {isLoading ? "PROCESANDO..." : "UNIRME AL LAB 09/24"}
            </Button>
          </form>

          {/* Trust indicator */}
          <p className="font-body text-sm text-muted-foreground mt-6 animate-slide-up animation-delay-400">+500 pilotos ya reciben noticias cada semana</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>;
};
export default Hero;