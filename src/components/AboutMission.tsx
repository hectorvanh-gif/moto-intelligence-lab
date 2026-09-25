import { ArrowRight, Users } from "lucide-react";
import { COMUNIDAD_URL } from "@/lib/comunidad";

/**
 * El cierre de la portada: un boton y nada mas.
 *
 * Aqui hubo tres tarjetas y un bloque de "por que IA" que repetian el
 * mismo mensaje, y despues un titular con dos botones. Todo eso se fue: lo
 * que se quiere de quien llego hasta abajo es una sola cosa, y una pantalla
 * que pide una sola cosa la pide mejor.
 *
 * "Como trabajamos" ya no esta aqui; sigue en el pie, en la columna SITIO.
 */
const AboutMission = () => {
  return (
    <section id="mission" className="relative py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <a
          href={COMUNIDAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto flex max-w-3xl items-center justify-center gap-4 rounded-sm bg-primary px-8 py-8 lg:py-10 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Users className="w-7 h-7 lg:w-8 lg:h-8 shrink-0" />
          <span className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-widest text-center">
            SÚMATE A LA COMUNIDAD
          </span>
          <ArrowRight className="w-7 h-7 lg:w-8 lg:h-8 shrink-0 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
};

export default AboutMission;
