import { ArrowRight, Cpu, Users, Zap } from "lucide-react";

// Las cifras de aqui son medibles en la base y por eso van redondeadas
// hacia abajo: hay 50 dominios distintos publicando. No poner "cientos"
// de fuentes.
//
// La tarjeta de comunidad decia "estamos construyendo" mientras no habia
// nada; ahora lleva a la comunidad en amiiigo.com, asi que ya puede
// afirmarlo. Si ese enlace muere, el texto vuelve a futuro.
const features = [
  {
    icon: Cpu,
    title: "MOTOR",
    description:
      "Curación automatizada de más de 40 fuentes de prensa especializada. Lo que no aporta, no se publica.",
  },
  {
    icon: Zap,
    title: "TECNOLOGÍA",
    description:
      "Claude lee las fuentes cada mañana, reescribe lo que importa y descarta el resto.",
  },
  {
    icon: Users,
    title: "COMUNIDAD",
    description:
      "El lugar donde los pilotos mexicanos siguen lo que pasa en el mundo de la moto.",
    href: "https://amiiigo.com/motolab-249",
    cta: "ENTRAR A LA COMUNIDAD",
  },
];

const AboutMission = () => {
  return (
    <section id="mission" className="relative py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              MOTOR + TECNOLOGÍA + COMUNIDAD
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Moto Lab 249 no es un blog tradicional. Es un centro de
              inteligencia que utiliza IA para curar las noticias más
              relevantes del mundo motociclista para ti.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              // La tarjeta con enlace se pinta como <a>; las otras siguen
              // siendo texto. Asi solo lo que lleva a algun lado invita a
              // hacerle clic.
              const Contenedor = feature.href ? "a" : "div";
              const props = feature.href
                ? {
                    href: feature.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : {};

              return (
                <Contenedor
                  key={index}
                  {...props}
                  className={`block text-center p-6 lg:p-8 rounded-sm border bg-background/50 transition-all duration-300 group ${
                    feature.href
                      ? "border-primary/40 hover:border-primary cursor-pointer"
                      : "border-border/50 hover:border-primary/30"
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.cta && (
                    <span className="inline-flex items-center gap-2 mt-5 font-display text-xs tracking-widest text-primary">
                      {feature.cta}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Contenedor>
              );
            })}
          </div>

          {/* Differentiator */}
          <div className="mt-12 lg:mt-16 p-6 lg:p-8 rounded-sm border border-primary/20 bg-primary/5 text-center">
            <p className="font-display text-sm tracking-widest text-primary mb-2">
              ¿POR QUÉ IA?
            </p>
            <p className="font-body text-lg text-foreground">
              Mientras otros medios te saturan con ruido, nosotros filtramos.
              Cada mañana se revisan más de 40 fuentes y se descarta lo que no
              aporta, para dejarte solo lo esencial:{" "}
              <span className="text-primary font-semibold">
                información de alto octanaje, sin relleno.
              </span>
            </p>
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
