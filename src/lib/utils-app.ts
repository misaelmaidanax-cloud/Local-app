import { DAYS, type Comercio, type Horario, type PedidoItem } from "./types";

export function distanciaKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function formatDistancia(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatPrecio(v: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(v);
}

export function estaAbierto(horario: Horario, ahora = new Date()): boolean {
  const key = DAYS[(ahora.getDay() + 6) % 7]!.key;
  const d = horario[key];
  if (!d || d.cerrado) return false;
  const min = ahora.getHours() * 60 + ahora.getMinutes();
  const [ah = 0, am = 0] = d.abre.split(":").map(Number);
  const [ch = 0, cm = 0] = d.cierra.split(":").map(Number);
  return min >= ah * 60 + am && min <= ch * 60 + cm;
}

export function horarioHoy(horario: Horario, ahora = new Date()): string {
  const key = DAYS[(ahora.getDay() + 6) % 7]!.key;
  const d = horario[key];
  if (!d || d.cerrado) return "Cerrado hoy";
  return `${d.abre} – ${d.cierra}`;
}

export function mensajeWhatsapp(
  comercio: Comercio,
  items: PedidoItem[],
  contacto: { nombre: string; telefono: string },
  pedidoId: string,
  origen: string,
): string {
  const lineas = items.map(
    (i) => `• ${i.cantidad} x ${i.nombre} — ${formatPrecio(i.precio * i.cantidad)}`,
  );
  const total = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
  return [
    `¡Hola ${comercio.nombre}! Quiero reservar para retirar:`,
    "",
    ...lineas,
    "",
    `Total: ${formatPrecio(total)}`,
    `Nombre: ${contacto.nombre}`,
    `Teléfono: ${contacto.telefono}`,
    `Resumen del pedido: ${origen}/pedido/${pedidoId}`,
  ].join("\n");
}

export function linkWhatsapp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
}
