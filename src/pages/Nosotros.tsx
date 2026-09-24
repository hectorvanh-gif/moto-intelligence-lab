import { Link } from "react-router-dom";
import { ArrowRight, Filter, Bot, Vote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterBand from "@/components/NewsletterBand";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";

/**
 * Quienes somos.
 *
 * Existe por dos razones. La primera es que el sitio no decia en ninguna
 * parte quien esta detras, y Google le da peso a eso en un sitio de
 * noticias. La segunda es que si aqui se va a decir que detras hay un
 * agente de IA, mas vale decirlo de frente que dejar que se note.
 *
 * Todo lo que se afirma aqui es comprobable: las mas de 40 fuentes son los
 * dominios distintos que publican en la base, y "una de cada seis" es la
 * proporcion real de notas que el filtro descarta (114 de 762).
 */
const Nosotros = () => {
  useMeta({
    title: "Qué es Moto Lab 249 | Noticias de moto en México",
    description:
      "Un filtro para la prensa de moto: más de 40 fuentes revisadas cada mañana, sin relleno. Quién está detrás de Moto Lab 249 y cómo trabajamos.",
    canonical: `${SITE_URL}/nosotros`,
  });

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 lg:pt-32 pb-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <p className="font-display text-xs tracking-widest text-primary mb-4">
                QUIÉNES SOMOS
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-8">
                Un filtro, no un medio más
              </h1>

              <div className="space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
                <p>
                  La información de moto está repartida en docenas de sitios, y
                  la mayoría publica la misma nota con distinto título.
                  Seguirlos todos es un trabajo de tiempo completo. Este sitio
                  existe para que no tengas que hacerlo.
                </p>
                <p>
                  Cada mañana se revisan más de 40 fuentes de prensa
                  especializada. Se descarta lo irrelevante —cerca de una de
                  cada seis notas no pasa el filtro—, se reescribe lo que queda
                  en español claro y se clasifica por tema. Después se publica
                  aquí, y los lunes sale un resumen por correo para quien lo
                  pida.
                </p>
              </div>

              {/* Los tres puntos que la gente pregunta */}
              <div className="grid gap-6 sm:grid-cols-3 my-12">
                {[
                  {
                    icon: Filter,
                    titulo: "Filtramos",
                    texto:
                      "No hacemos reportería propia. Filtramos, resumimos y damos contexto, y siempre enlazamos a la fuente original.",
                  },
                  {
                    icon: Bot,
                    titulo: "Con IA, y lo decimos",
                    texto:
                      "Detrás hay una persona y herramientas de inteligencia artificial, no una redacción. El agente redacta y clasifica; qué cubrir y qué fuentes leer son decisiones humanas.",
                  },
                  {
                    icon: Vote,
                    titulo: "Tú decides qué sube",
                    texto:
                      "Cada nota se puede votar, y lo más votado encabeza el boletín del lunes.",
                  },
                ].map(({ icon: Icono, titulo, texto }) => (
                  <div
                    key={titulo}
                    className="p-6 rounded-sm border border-border/50 bg-card/50"
                  >
                    <Icono className="w-5 h-5 text-primary mb-4" />
                    <h2 className="font-display text-base text-foreground mb-2">
                      {titulo}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {texto}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
                <h2 className="font-display text-xl text-foreground pt-4">
                  De dónde viene la información
                </h2>
                <p>
                  Los medios que cubren el campeonato a diario están casi todos
                  en España, así que de ahí viene la mayor parte. El trabajo es
                  traerlo ordenado y en corto, con las secciones que le
                  importan a quien anda en moto en México: el mundial, las
                  eléctricas que están llegando al mercado, las doble propósito
                  y lo que se lanza.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-10">
                {[
                  { a: "/motogp", t: "MOTOGP" },
                  { a: "/motos-electricas", t: "ELÉCTRICAS" },
                  { a: "/motos-doble-proposito", t: "DOBLE PROPÓSITO" },
                  { a: "/enduro", t: "ENDURO" },
                ].map(({ a, t }) => (
                  <Link
                    key={a}
                    to={a}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border/60 font-display text-xs tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {t}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>

        <NewsletterBand />
        <Footer />
      </div>
    </>
  );
};

export default Nosotros;
