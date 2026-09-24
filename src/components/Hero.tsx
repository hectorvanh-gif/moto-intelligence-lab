import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Antes el hero ocupaba una pantalla completa y traia el formulario de
 * suscripcion, asi que lo primero que veia la gente no era una noticia.
 * Ahora es una franja mas corta y el formulario vive en NewsletterBand.
 */
const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-[62vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden pt-16 lg:pt-20"
    >
      {/* Video de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/Ducati.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      <div className="absolute inset-0 circuit-lines opacity-20 pointer-events-none" />

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-7 animate-slide-up">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <span className="font-display text-xs tracking-widest text-primary">
              ACTUALIZADO TODOS LOS DÍAS
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-5 animate-slide-up animation-delay-100">
            EL MOTOCICLISMO DE MÉXICO,{" "}
            <span className="text-gradient-red">SIN RELLENO</span>
          </h1>

          <p className="font-body text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-9 animate-slide-up animation-delay-200 leading-relaxed">
            Noticias globales de motos, filtradas y resumidas por agentes de IA.{" "}
            <span className="text-foreground font-semibold">Directo a la vena.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
            <Button variant="hero" size="lg" asChild>
              <a href="#portada">VER LO ÚLTIMO</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/noticias">EXPLORAR EL ARCHIVO</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
