import FeedCard from "./FeedCard";

const feedData = [
  {
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
    category: "LANZAMIENTO",
    title: "DUCATI PANIGALE V4 2025: EL DEMONIO ROJO EVOLUCIONA",
    summary: "La nueva generación del superbike italiano llega con más potencia y aerodinámica agresiva.",
    date: "2024.12.08 // 14:32 UTC",
  },
  {
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
    category: "TECH",
    title: "INTELIGENCIA ARTIFICIAL EN LA PISTA: BMW M RR REVOLUTION",
    summary: "Sistemas predictivos de telemetría transforman la forma de competir en WorldSBK.",
    date: "2024.12.07 // 09:15 UTC",
  },
  {
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80",
    category: "MOTOGP",
    title: "MÁRQUEZ CONFIRMA: DUCATI ES EL FUTURO",
    summary: "El piloto español analiza su temporada y revela planes para dominar el campeonato.",
    date: "2024.12.06 // 18:45 UTC",
  },
  {
    image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80",
    category: "MÉXICO",
    title: "AUTÓDROMO HERMANOS RODRÍGUEZ PREPARA PISTA PARA MOTOS",
    summary: "Inversión millonaria busca traer el WorldSBK a suelo mexicano en 2026.",
    date: "2024.12.05 // 11:20 UTC",
  },
  {
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80",
    category: "AVENTURA",
    title: "RUTA TRANSPIRENAICA: 1,200 KM DE ADRENALINA PURA",
    summary: "Guía completa para conquistar los Pirineos sobre dos ruedas este verano.",
    date: "2024.12.04 // 07:00 UTC",
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    category: "ELÉCTRICO",
    title: "ZERO SR/F 2025: LA REVOLUCIÓN SILENCIOSA CONTINÚA",
    summary: "Nueva batería de estado sólido promete 400km de autonomía real.",
    date: "2024.12.03 // 16:30 UTC",
  },
];

const IntelligenceFeed = () => {
  return (
    <section id="feed" className="relative py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            className="glitch font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            data-text="FEED DE INTELIGENCIA RECIENTE"
          >
            FEED DE INTELIGENCIA RECIENTE
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {feedData.map((item, index) => (
            <div
              key={index}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FeedCard {...item} />
            </div>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 circuit-lines opacity-10 pointer-events-none" />
    </section>
  );
};

export default IntelligenceFeed;
