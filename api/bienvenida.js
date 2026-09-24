/**
 * Correo de bienvenida al suscribirse.
 *
 * El alta la sigue haciendo el navegador contra Supabase: si este endpoint
 * falla, el correo no sale pero el suscriptor queda guardado. Nunca se
 * pierde un registro por un problema de envio.
 *
 * Antes de enviar comprueba que la direccion exista en la tabla. Sin eso,
 * cualquiera podria usar esta ruta para mandar correos a terceros desde tu
 * dominio, y ahi se te quema la reputacion del remitente.
 *
 * Variables de entorno en Vercel:
 *   RESEND_API_KEY        llave de Resend
 *   SUPABASE_SERVICE_KEY  para comprobar el alta (RLS no deja leer con la anonima)
 *   NEWSLETTER_FROM       opcional, remitente
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://rbumxwchxgjbtxsxutbl.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";
const REMITENTE =
  process.env.NEWSLETTER_FROM || "Moto Lab 249 <boletin@motolab249.com>";
const RESPONDER_A = process.env.NEWSLETTER_REPLY_TO || "motolab249@gmail.com";

const SITIO = "https://motolab249.com";
const NEGRO = "#0a0a0a";
const CARTA = "#141414";
const ROJO = "#ef4444";
const TEXTO = "#fafafa";
const TENUE = "#a1a1aa";
const LINEA = "#27272a";

const correoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function cuerpo() {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${NEGRO};
  font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background:${NEGRO};padding:28px 14px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0"
    style="max-width:600px;background:${CARTA};border:1px solid ${LINEA};border-radius:8px;">

    <tr><td style="padding:32px 30px 0;">
      <span style="color:${TEXTO};font-size:22px;font-weight:800;letter-spacing:2px;">MOTO LAB</span><span
        style="color:${ROJO};font-size:22px;font-weight:800;letter-spacing:2px;">249</span>
    </td></tr>

    <tr><td style="padding:22px 30px 0;">
      <h1 style="margin:0 0 16px;color:${TEXTO};font-size:24px;line-height:1.3;">
        Ya estas dentro.
      </h1>
      <p style="margin:0 0 16px;color:${TENUE};font-size:16px;line-height:1.65;">
        Cada lunes te llega lo que de verdad paso en el motociclismo: MotoGP,
        motos electricas, doble proposito y lanzamientos. Seis notas, sin
        relleno y sin la misma historia repetida tres veces.
      </p>
      <p style="margin:0 0 26px;color:${TENUE};font-size:16px;line-height:1.65;">
        Mientras llega el primero, el sitio se actualiza todos los dias.
      </p>
      <a href="${SITIO}" style="display:inline-block;background:${ROJO};color:#fff;
        font-size:14px;font-weight:700;letter-spacing:1px;text-decoration:none;
        padding:13px 26px;border-radius:4px;">VER LO DE HOY</a>
    </td></tr>

    <tr><td style="padding:30px 30px 30px;">
      <p style="margin:26px 0 0;padding-top:20px;border-top:1px solid ${LINEA};
        color:${TENUE};font-size:11px;line-height:1.6;">
        Recibes esto porque te suscribiste en motolab249.com.<br>
        Para darte de baja, responde a este correo con la palabra BAJA.
      </p>
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "solo POST" });
  }
  if (!RESEND_KEY || !SERVICE_KEY) {
    // Faltan las variables en Vercel. No es error del visitante: su alta
    // ya quedo guardada, solo no recibe el correo.
    console.error("bienvenida: falta RESEND_API_KEY o SUPABASE_SERVICE_KEY");
    return res.status(503).json({ error: "envio no configurado" });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!correoValido(email)) {
    return res.status(400).json({ error: "correo invalido" });
  }

  try {
    // Solo se le escribe a quien realmente acaba de darse de alta.
    const consulta = await fetch(
      `${SUPABASE_URL}/rest/v1/subscribers?select=email&email=eq.${encodeURIComponent(email)}&limit=1`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    if (!consulta.ok) {
      console.error("bienvenida: Supabase respondio", consulta.status);
      return res.status(502).json({ error: "no se pudo comprobar el alta" });
    }
    const filas = await consulta.json();
    if (!Array.isArray(filas) || filas.length === 0) {
      return res.status(404).json({ error: "esa direccion no esta suscrita" });
    }

    const envio = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [email],
        reply_to: RESPONDER_A,
        subject: "Ya estas dentro del Lab 249",
        html: cuerpo(),
        headers: {
          "List-Unsubscribe": `<mailto:${RESPONDER_A}?subject=BAJA>`,
        },
      }),
    });

    if (!envio.ok) {
      const detalle = await envio.text();
      console.error("bienvenida: Resend", envio.status, detalle.slice(0, 200));
      return res.status(502).json({ error: "no se pudo enviar" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("bienvenida:", e?.message);
    return res.status(500).json({ error: "error inesperado" });
  }
}
