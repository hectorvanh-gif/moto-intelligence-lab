import { ArrowRight, Users } from "lucide-react";
import { COMUNIDAD_CTA, COMUNIDAD_URL } from "@/lib/comunidad";

/**
 * Invitacion a la comunidad, para poner al final de las notas y de las
 * secciones tematicas.
 *
 * Va antes de la banda de suscripcion a proposito: quien acaba de leer una
 * nota completa esta en el mejor momento para entrar a hablar de ella, y
 * el correo es el plan B para quien no quiere entrar a ningun lado.
 */
const CommunityBand = () => {
  return (
    <section className="border-t border-border/50 bg-card/40">
      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </span>

          <div className="flex-1">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-1.5">
              ¿Andas en moto? Éntrale a la comunidad
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Rodadas, dudas de mecánica y lo que se dice de cada moto, con
              gente que anda en lo mismo. Es gratis.
            </p>
          </div>

          <a
            href={COMUNIDAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm bg-primary text-primary-foreground font-display text-xs tracking-widest hover:bg-primary/90 transition-colors shrink-0 w-full sm:w-auto"
          >
            {COMUNIDAD_CTA}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CommunityBand;
