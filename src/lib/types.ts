export type Rubro = "kiosco" | "almacen" | "farmacia" | "ferreteria" | "verduleria";

export const RUBROS: { value: Rubro; label: string }[] = [
  { value: "kiosco", label: "Kiosco" },
  { value: "almacen", label: "Almacén" },
  { value: "farmacia", label: "Farmacia" },
  { value: "ferreteria", label: "Ferretería" },
  { value: "verduleria", label: "Verdulería" },
];

export type DayKey = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miércoles" },
  { key: "jue", label: "Jueves" },
  { key: "vie", label: "Viernes" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

export type Horario = Record<DayKey, { abre: string; cierra: string; cerrado: boolean }>;

export interface Comercio {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  rubro: Rubro;
  whatsapp: string;
  horario: Horario;
  activo: boolean;
}

export interface Producto {
  id: string;
  comercioId: string;
  nombre: string;
  fotoUrl: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  actualizado: string;
}

export type EstadoPedido = "pendiente" | "listo" | "retirado" | "cancelado";

export interface PedidoItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: string;
  comercioId: string;
  nombreContacto: string;
  telefonoContacto: string;
  items: PedidoItem[];
  estado: EstadoPedido;
  creado: string;
}
