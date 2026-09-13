// Set the confirmed CIMA e³ business number in international format, digits only.
// Kept in the frontend; no API or environment configuration is involved.
const whatsappNumber = "5491138668688";
const message = "Hola, quisiera consultar por un servicio de diagnóstico de CIMA e³.";

export const whatsappUrl = whatsappNumber
  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  : null;
