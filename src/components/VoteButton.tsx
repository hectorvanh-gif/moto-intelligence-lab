import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

/**
 * Voto para una nota.
 *
 * La regla de un voto por persona la impone el servidor con el hash de la
 * IP (api/votar.js). Aqui solo se recuerda en localStorage para que el
 * boton aparezca marcado al volver: es una comodidad visual, no la
 * seguridad. Quien borre su almacenamiento vera el boton limpio y el
 * servidor le dira que ya voto.
 *
 * Va dentro de tarjetas que son un enlace completo, asi que el clic tiene
 * que frenar la navegacion.
 */

const clave = (id: number) => `voto-${id}`;

const yaVoto = (id: number) => {
  try {
    return localStorage.getItem(clave(id)) === "1";
  } catch {
    return false;
  }
};

interface Props {
  articleId: number;
  votes?: number | null;
  /** grande para la pagina de la nota, chico para las tarjetas */
  size?: "sm" | "lg";
}

const VoteButton = ({ articleId, votes, size = "sm" }: Props) => {
  const [total, setTotal] = useState(votes ?? 0);
  const [votado, setVotado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // En el primer render se asume que no ha votado, para que el servidor y
  // el cliente pinten lo mismo; el estado real se lee despues.
  useEffect(() => setVotado(yaVoto(articleId)), [articleId]);

  useEffect(() => setTotal(votes ?? 0), [votes]);

  const votar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (votado || enviando) return;

    setEnviando(true);
    // Optimista: el numero sube de inmediato. Si el servidor falla se
    // revierte, porque un boton que no responde se siente roto.
    setTotal((n) => n + 1);
    setVotado(true);

    try {
      const r = await fetch("/api/votar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: articleId }),
      });
      const datos = await r.json().catch(() => null);

      if (!r.ok) throw new Error(datos?.error || "fallo");

      if (typeof datos?.total === "number") setTotal(datos.total);
      try {
        localStorage.setItem(clave(articleId), "1");
      } catch {
        /* navegacion privada o almacenamiento bloqueado */
      }
    } catch {
      setTotal((n) => Math.max(0, n - 1));
      setVotado(false);
    } finally {
      setEnviando(false);
    }
  };

  const grande = size === "lg";

  return (
    <button
      type="button"
      onClick={votar}
      disabled={votado || enviando}
      aria-label={votado ? "Ya votaste esta nota" : "Votar por esta nota"}
      title={votado ? "Ya votaste esta nota" : "Votar por esta nota"}
      className={`inline-flex items-center gap-2 rounded-full border transition-colors ${
        grande ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"
      } ${
        votado
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
      } ${enviando ? "opacity-60" : ""}`}
    >
      <Flame className={grande ? "w-4 h-4" : "w-3.5 h-3.5"} />
      <span className="font-mono tabular-nums">{total}</span>
      {grande && (
        <span className="font-display tracking-widest">
          {votado ? "VOTADA" : "VOTAR"}
        </span>
      )}
    </button>
  );
};

export default VoteButton;
