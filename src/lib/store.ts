import { useSyncExternalStore } from "react";
import { SEED_COMERCIOS, SEED_PRODUCTOS } from "./seed";
import type { Comercio, EstadoPedido, Pedido, PedidoItem, Producto } from "./types";

export interface AppState {
  comercios: Comercio[];
  productos: Producto[];
  pedidos: Pedido[];
  busquedas: { termino: string; cantidad: number }[];
  contacto: { nombre: string; telefono: string } | null;
  comercioActivoId: string;
}

const KEY = "cercano.v1";

const initial: AppState = {
  comercios: SEED_COMERCIOS,
  productos: SEED_PRODUCTOS,
  pedidos: [],
  busquedas: [],
  contacto: null,
  comercioActivoId: "c1",
};

let state: AppState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage lleno o bloqueado */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...(JSON.parse(raw) as AppState) };
  } catch {
    /* datos corruptos: se ignoran */
  }
  emit();
}

function set(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial),
  );
}

export function getState() {
  return state;
}

const id = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  registrarBusqueda(termino: string) {
    const t = termino.trim().toLowerCase();
    if (t.length < 3) return;
    set((s) => {
      const existe = s.busquedas.find((b) => b.termino === t);
      return {
        ...s,
        busquedas: existe
          ? s.busquedas.map((b) => (b.termino === t ? { ...b, cantidad: b.cantidad + 1 } : b))
          : [...s.busquedas, { termino: t, cantidad: 1 }],
      };
    });
  },
  agregarProducto(p: Omit<Producto, "id" | "actualizado">) {
    set((s) => ({
      ...s,
      productos: [{ ...p, id: id(), actualizado: new Date().toISOString() }, ...s.productos],
    }));
  },
  actualizarProducto(productoId: string, patch: Partial<Producto>) {
    set((s) => ({
      ...s,
      productos: s.productos.map((p) =>
        p.id === productoId ? { ...p, ...patch, actualizado: new Date().toISOString() } : p,
      ),
    }));
  },
  eliminarProducto(productoId: string) {
    set((s) => ({ ...s, productos: s.productos.filter((p) => p.id !== productoId) }));
  },
  actualizarComercio(comercioId: string, patch: Partial<Comercio>) {
    set((s) => ({
      ...s,
      comercios: s.comercios.map((c) => (c.id === comercioId ? { ...c, ...patch } : c)),
    }));
  },
  crearPedido(data: {
    comercioId: string;
    nombreContacto: string;
    telefonoContacto: string;
    items: PedidoItem[];
  }): Pedido {
    const pedido: Pedido = {
      id: id(),
      ...data,
      estado: "pendiente",
      creado: new Date().toISOString(),
    };
    set((s) => ({
      ...s,
      pedidos: [pedido, ...s.pedidos],
      contacto: { nombre: data.nombreContacto, telefono: data.telefonoContacto },
    }));
    return pedido;
  },
  cambiarEstadoPedido(pedidoId: string, estado: EstadoPedido) {
    set((s) => ({
      ...s,
      pedidos: s.pedidos.map((p) => (p.id === pedidoId ? { ...p, estado } : p)),
    }));
  },
  setComercioActivo(comercioId: string) {
    set((s) => ({ ...s, comercioActivoId: comercioId }));
  },
};
