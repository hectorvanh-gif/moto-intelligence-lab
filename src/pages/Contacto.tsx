import { useState } from "react";
import { Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { NeonInput } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";

/**
 * El buzon. No es una caja de comentarios: lo que se escribe aqui llega
 * al correo del sitio y no se publica en ningun lado.
 *
 * Lo dice la propia pagina, porque la diferencia importa para quien
 * escribe: no es lo mismo mandar un mensaje que dejar algo a la vista de
 * todos.
 */
const Contacto = () => {
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  useMeta({
    title: "Escríbenos | Moto Lab 249",
    description:
      "¿Viste algo mal, tienes una nota que contar o quieres que cubramos algo? Escríbenos.",
    canonical: `${SITE_URL}/contacto`,
  });

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const mensaje = String(datos.get("mensaje") || "").trim();

    if (mensaje.length < 5) {
      toast({
        title: "Falta el mensaje",
        description: "Escribe aunque sea una línea.",
        variant: "destructive",
      });
      return;
    }

    setEnviando(true);
    try {
      const r = await fetch("/api/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          email: datos.get("email"),
          mensaje,
          web: datos.get("web"), // el campo trampa
        }),
      });
      const cuerpo = await r.json().catch(() => null);

      if (!r.ok) throw new Error(cuerpo?.error || "no se pudo enviar");

      setListo(true);
    } catch (err) {
      toast({
        title: "No se pudo enviar",
        description:
          err instanceof Error ? err.message : "Intenta de nuevo en un momento.",
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 lg:pt-32">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <div className="max-w-xl mx-auto">
          <p className="font-display text-xs tracking-widest text-primary mb-3">
            BUZÓN
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            Escríbenos
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
            ¿Viste un dato mal, tienes algo que contar o quieres que cubramos
            una moto? Esto llega directo al correo del sitio; no se publica en
            ningún lado.
          </p>

          {listo ? (
            <div className="rounded-sm border border-primary/40 bg-primary/5 p-6">
              <p className="font-display text-lg text-primary mb-2">
                Llegó. Gracias.
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Si dejaste tu correo, te contestamos ahí.
              </p>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-4">
              <NeonInput name="nombre" placeholder="Tu nombre (opcional)" />
              <NeonInput
                name="email"
                type="email"
                placeholder="Tu correo, si quieres respuesta"
              />
              <textarea
                name="mensaje"
                rows={6}
                maxLength={2000}
                placeholder="Lo que nos quieras decir"
                className="w-full rounded-sm border border-border/60 bg-card/50 p-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />

              {/* El campo trampa: invisible para una persona, irresistible
                  para un robot que rellena todo lo que encuentra. */}
              <input
                name="web"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={enviando}
                className="w-full sm:w-auto"
              >
                {enviando ? "ENVIANDO..." : "ENVIAR"}
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contacto;
