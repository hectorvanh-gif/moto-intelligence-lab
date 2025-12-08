import { Cpu, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "MOTOR",
    description:
      "Curación automatizada de las mejores noticias del mundo motociclista, filtradas por relevancia para México.",
  },
  {
    icon: Zap,
    title: "TECNOLOGÍA",
    description:
      "Agentes de IA procesan cientos de fuentes globales para entregarte solo lo que importa.",
  },
  {
    icon: Users,
    title: "COMUNIDAD",
    description:
      "Construimos un ecosistema de pilotos informados, conectados y apasionados.",
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
              Moto Lab 09/24 no es un blog tradicional. Es un centro de
              inteligencia que utiliza IA para curar las noticias más
              relevantes del mundo motociclista para ti.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 lg:p-8 rounded-sm border border-border/50 bg-background/50 hover:border-primary/30 transition-all duration-300 group"
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
              </div>
            ))}
          </div>

          {/* Differentiator */}
          <div className="mt-12 lg:mt-16 p-6 lg:p-8 rounded-sm border border-primary/20 bg-primary/5 text-center">
            <p className="font-display text-sm tracking-widest text-primary mb-2">
              ¿POR QUÉ IA?
            </p>
            <p className="font-body text-lg text-foreground">
              Mientras otros medios te saturan con ruido, nosotros filtramos.
              Procesamos cientos de fuentes en segundos para darte solo lo
              esencial:{" "}
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
