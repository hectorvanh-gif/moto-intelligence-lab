import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterBand from "@/components/NewsletterBand";
import NewsCard from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useHubNews } from "@/hooks/useNews";
import { hubBySlug } from "@/lib/hubs";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";

interface Props {
  slug: string;
}

/** Renderiza **negritas** sin meter una libreria de markdown por dos asteriscos. */
const RichText = ({ text }: { text: string }) => (
  <>
    {text.split("**").map((chunk, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="text-foreground font-semibold">
          {chunk}
        </strong>
      ) : (
        <span key={i}>{chunk}</span>
      )
    )}
  </>
);

const HubPage = ({ slug }: Props) => {
  const hub = hubBySlug(slug);
  const { data: news, isLoading } = useHubNews(hub?.category ?? "", hub?.match ?? [], 6);

  if (!hub) return null;

  const canonical = `${SITE_URL}/${hub.slug}`;

  // FAQPage: es lo que hace que Google pueda mostrar las preguntas
  // desplegables debajo del resultado.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hub.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // og:title ahora lleva el sufijo de la marca igual que el <title>; antes
  // iban distintos sin razon.
  useMeta({
    title: `${hub.title} | Moto Lab 249`,
    description: hub.metaDescription,
    canonical,
    jsonLd: faqSchema,
  });

  return (
    <>
      <div className="min-h-screen bg-background pt-16 lg:pt-20">
        <Navbar />

        {/* Encabezado */}
        <header className="relative border-b border-border/50 py-14 lg:py-20">
          <div className="absolute inset-0 circuit-lines opacity-10 pointer-events-none" />
          <div className="relative container mx-auto px-4 lg:px-8 max-w-4xl">
            <span className="font-display text-xs tracking-widest text-primary">
              {hub.kicker}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mt-4 mb-6">
              {hub.h1}
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {hub.lead}
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 lg:px-8">
          {/* Contenido propio */}
          <article className="max-w-4xl mx-auto py-14 lg:py-20 space-y-12">
            {hub.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-5 flex items-center gap-3">
                  <span className="w-2 h-7 rounded-sm bg-primary shrink-0" />
                  {section.heading}
                </h2>
                <div className="space-y-4">
                  {section.body.map((paragraph, i) => (
                    <p
                      key={i}
                      className="font-body text-base lg:text-lg text-muted-foreground leading-relaxed"
                    >
                      <RichText text={paragraph} />
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {/* Preguntas frecuentes */}
            {hub.faq.length > 0 && (
              <section>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-2 h-7 rounded-sm bg-primary shrink-0" />
                  PREGUNTAS FRECUENTES
                </h2>
                <dl className="space-y-6">
                  {hub.faq.map((f) => (
                    <div key={f.q} className="border-l-2 border-border pl-5">
                      <dt className="font-display text-base font-bold text-foreground mb-2">
                        {f.q}
                      </dt>
                      <dd className="font-body text-muted-foreground leading-relaxed">
                        {f.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </article>
        </main>

        {/* Notas del tema */}
        <section className="border-t border-border/50 py-14 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-8 gap-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wide flex items-center gap-3">
                <span className="w-2.5 h-8 rounded-sm bg-primary" />
                LO ÚLTIMO DE {hub.h1}
              </h2>
              <Link
                to="/noticias"
                className="group inline-flex items-center gap-2 font-display text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors shrink-0"
              >
                TODO EL ARCHIVO
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg overflow-hidden border border-border/50">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && news && news.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {!isLoading && (!news || news.length === 0) && (
              <p className="text-muted-foreground">
                Todavía no hay notas de este tema. El agente publica todos los días.
              </p>
            )}
          </div>
        </section>

        <NewsletterBand />
        <Footer />
      </div>
    </>
  );
};

export default HubPage;
