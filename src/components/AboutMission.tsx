import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";

/**
 * La franja de cierre de la portada.
 *
 * Tenia tres tarjetas —MOTOR, TECNOLOGIA, COMUNIDAD— y debajo un bloque
 * de "por que IA". Las dos primeras tarjetas y el bloque decian
 * exactamente lo mismo con otras palabras: "revisamos muchas fuentes y
 * descartamos lo que no aporta", tres veces en la misma pantalla. La
 * explicacion larga ahora vive en /nosotros.
 *
 * Queda un solo mensaje y dos acciones: entrar a la comunidad y leer como
 * se trabaja. La tarjeta de COMUNIDAD era la unica de las tres que
 * llevaba a algun lado.
 */
const AboutMission = () => {
  return (
    <section id="mission" className="relative py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-xs tracking-widest text-primary mb-4">
            ¿POR QUÉ IA?
          </p>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-5">
            Mientras otros te saturan con ruido,{" "}
            <span className="text-primary">nosotros filtramos</span>
          </h2>

          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-9">
            Cada mañana se revisan más de 40 fuentes de prensa especializada y
            se descarta lo que no aporta, para dejarte solo lo esencial:{" "}
            <span className="text-foreground font-semibold">
              información de alto octanaje, sin relleno.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://amiiigo.com/motolab-249"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm bg-primary text-primary-foreground font-display text-sm tracking-widest hover:bg-primary/90 transition-colors"
            >
              <Users className="w-4 h-4" />
              ENTRAR A LA COMUNIDAD
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              to="/nosotros"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm border border-border/60 font-display text-sm tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              CÓMO TRABAJAMOS
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
};

export default AboutMission;
