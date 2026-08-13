import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Clock,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FotoProducto } from "@/components/FotoProducto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUbicacion } from "@/hooks/use-ubicacion";
import { actions, hydrateStore, useAppState } from "@/lib/store";
import { RUBROS, type Comercio, type Producto } from "@/lib/types";
import {
  distanciaKm,
  estaAbierto,
  formatDistancia,
  formatPrecio,
  horarioHoy,
  linkWhatsapp,
  mensajeWhatsapp,
} from "@/lib/utils-app";

const Mapa = lazy(() => import("@/components/MapaComercios"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cercano — Buscá productos en comercios de tu barrio" },
      {
        name: "description",
        content:
          "Buscá un producto y mirá en el mapa qué kioscos y almacenes cerca lo tienen, a qué precio y si están abiertos. Reservá para retirar.",
      },
      { property: "og:title", content: "Cercano — Productos y precios del barrio en un mapa" },
      {
        property: "og:description",
        content: "Qué comercio cerca tiene lo que buscás, a qué precio y a qué distancia.",
      },
    ],
  }),
  component: Buscar,
});

type Orden = "distancia" | "precio";

function Buscar() {
  useEffect(hydrateStore, []);
  const { estado, ubicacion, referencia } = useUbicacion();
  const comercios = useAppState((s) => s.comercios.filter((c) => c.activo));
  const productos = useAppState((s) => s.productos);
  const contactoGuardado = useAppState((s) => s.contacto);

  const [texto, setTexto] = useState("");
  const [consulta, setConsulta] = useState("");
  const [rubro, setRubro] = useState<string>("todos");
  const [soloAbiertos, setSoloAbiertos] = useState(false);
  const [maxKm, setMaxKm] = useState(5);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [carritoComercio, setCarritoComercio] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(false);

  const sugerencias = useMemo(() => {
    const t = texto.trim().toLowerCase();
    if (t.length < 2) return [];
    const nombres = new Set<string>();
    productos.forEach((p) => {
      if (p.nombre.toLowerCase().includes(t)) nombres.add(p.nombre);
    });
    return [...nombres].slice(0, 6);
  }, [texto, productos]);

  const resultados = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    const ahora = new Date();
    return comercios
      .map((c) => {
        const propios = productos.filter((p) => p.comercioId === c.id && p.disponible);
        const coincidencias = q ? propios.filter((p) => p.nombre.toLowerCase().includes(q)) : [];
        const mejor = coincidencias
          .slice()
          .sort((a, b) => a.precio - b.precio)[0] as Producto | undefined;
        return {
          comercio: c,
          km: distanciaKm(referencia, c),
          abierto: estaAbierto(c.horario, ahora),
          coincide: q ? coincidencias.length > 0 : true,
          mejor,
          productos: propios,
        };
      })
      .filter((r) => (rubro === "todos" ? true : r.comercio.rubro === rubro))
      .filter((r) => (soloAbiertos ? r.abierto : true))
      .filter((r) => r.km <= maxKm)
      .filter((r) => (consulta.trim() ? r.coincide : true));
  }, [comercios, productos, consulta, referencia, rubro, soloAbiertos, maxKm]);

  const [orden, setOrden] = useState<Orden>("distancia");
  const ordenados = useMemo(() => {
    const arr = resultados.slice();
    arr.sort((a, b) =>
      orden === "distancia"
        ? a.km - b.km
        : (a.mejor?.precio ?? Infinity) - (b.mejor?.precio ?? Infinity),
    );
    return arr;
  }, [resultados, orden]);

  const destacados = useMemo(
    () => new Set(consulta.trim() ? resultados.filter((r) => r.coincide).map((r) => r.comercio.id) : []),
    [resultados, consulta],
  );
  const precios = useMemo(() => {
    const m: Record<string, number | undefined> = {};
    resultados.forEach((r) => (m[r.comercio.id] = r.mejor?.precio));
    return m;
  }, [resultados]);

  const detalle = ordenados.find((r) => r.comercio.id === seleccionado) ?? null;
  const centro = detalle ? { lat: detalle.comercio.lat, lng: detalle.comercio.lng } : referencia;

  function buscar(valor: string) {
    setConsulta(valor);
    setTexto(valor);
    actions.registrarBusqueda(valor);
  }

  function agregar(p: Producto) {
    if (carritoComercio && carritoComercio !== p.comercioId) {
      setCarrito({ [p.id]: 1 });
    } else {
      setCarrito((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }));
    }
    setCarritoComercio(p.comercioId);
  }
  function quitar(p: Producto) {
    setCarrito((c) => {
      const n = (c[p.id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[p.id];
      else next[p.id] = n;
      if (Object.keys(next).length === 0) setCarritoComercio(null);
      return next;
    });
  }

  const items = useMemo(
    () =>
      Object.entries(carrito)
        .map(([pid, cantidad]) => {
          const p = productos.find((x) => x.id === pid);
          return p ? { productoId: p.id, nombre: p.nombre, cantidad, precio: p.precio } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [carrito, productos],
  );
  const total = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const comercioCarrito = comercios.find((c) => c.id === carritoComercio) ?? null;

  return (
    <AppShell sinPadding>
      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar(texto)}
            placeholder="¿Qué buscás? Ej: Coca Cola 1.5L, pilas AA…"
            className="h-12 rounded-xl pl-9 pr-24 text-base shadow-soft"
            aria-label="Buscar producto"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
            {consulta && (
              <Button variant="ghost" size="icon" onClick={() => buscar("")} aria-label="Limpiar">
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" onClick={() => buscar(texto)}>
              Buscar
            </Button>
          </div>
          {sugerencias.length > 0 && texto !== consulta && (
            <ul className="surface-card absolute z-30 mt-2 w-full overflow-hidden p-1">
              {sugerencias.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => buscar(s)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={rubro}
            onChange={(e) => setRubro(e.target.value)}
            aria-label="Categoría"
            className="h-9 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="todos">Todos los rubros</option>
            {RUBROS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Button
            variant={soloAbiertos ? "default" : "outline"}
            size="sm"
            onClick={() => setSoloAbiertos((v) => !v)}
          >
            <Clock className="mr-1 h-4 w-4" /> Abierto ahora
          </Button>
          <select
            value={maxKm}
            onChange={(e) => setMaxKm(Number(e.target.value))}
            aria-label="Distancia máxima"
            className="h-9 rounded-lg border border-input bg-card px-3 text-sm"
          >
            {[1, 2, 5, 10].map((k) => (
              <option key={k} value={k}>
                Hasta {k} km
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-1 rounded-lg bg-secondary p-1">
            {(["distancia", "precio"] as Orden[]).map((o) => (
              <button
                key={o}
                onClick={() => setOrden(o)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                  orden === o ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
                }`}
              >
                Menor {o}
              </button>
            ))}
          </div>
        </div>

        {estado === "pidiendo" && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Pedimos tu ubicación para calcular
            distancias…
          </p>
        )}
        {estado !== "ok" && estado !== "pidiendo" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Sin permiso de ubicación: mostramos el barrio por defecto. Podés activarlo desde el
            navegador para ver distancias reales.
          </p>
        )}
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="surface-card h-[46vh] overflow-hidden lg:sticky lg:top-24 lg:h-[70vh]">
          <Suspense
            fallback={
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Cargando mapa…
              </div>
            }
          >
            <Mapa
              comercios={ordenados.map((r) => r.comercio)}
              precios={precios}
              destacados={destacados}
              seleccionado={seleccionado}
              centro={centro}
              ubicacionUsuario={ubicacion}
              onSelect={setSeleccionado}
            />
          </Suspense>
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-xl font-bold">
            {consulta ? `"${consulta}" en ${ordenados.length} comercios` : "Comercios cerca de vos"}
          </h1>
          {ordenados.length === 0 && (
            <p className="surface-card p-4 text-sm text-muted-foreground">
              No encontramos comercios con eso cerca. Probá ampliar la distancia o buscar otro
              nombre.
            </p>
          )}
          {ordenados.map((r) => (
            <button
              key={r.comercio.id}
              onClick={() => setSeleccionado(r.comercio.id)}
              className={`surface-card flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50 ${
                seleccionado === r.comercio.id ? "ring-2 ring-accent" : ""
              }`}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <FotoProducto nombre={r.mejor?.nombre ?? r.comercio.nombre} fotoUrl={r.mejor?.fotoUrl} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.comercio.nombre}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDistancia(r.km)} · {r.comercio.direccion}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={r.abierto ? "default" : "secondary"}>
                    {r.abierto ? "Abierto" : "Cerrado"}
                  </Badge>
                  {r.mejor && (
                    <span className="truncate text-xs text-muted-foreground">{r.mejor.nombre}</span>
                  )}
                </div>
              </div>
              {r.mejor && (
                <span className="font-display text-lg font-bold text-primary">
                  {formatPrecio(r.mejor.precio)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {detalle && (
        <FichaComercio
          comercio={detalle.comercio}
          km={detalle.km}
          abierto={detalle.abierto}
          productos={detalle.productos}
          consulta={consulta}
          carrito={carrito}
          onCerrar={() => setSeleccionado(null)}
          onAgregar={agregar}
          onQuitar={quitar}
        />
      )}

      {items.length > 0 && comercioCarrito && !checkout && (
        <div className="fixed bottom-14 left-0 right-0 z-50 px-4 pb-3 sm:bottom-0 sm:pb-4">
          <div className="surface-card panel-lift mx-auto flex max-w-2xl items-center gap-3 p-3">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold">{comercioCarrito.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {items.reduce((a, i) => a + i.cantidad, 0)} productos · {formatPrecio(total)}
              </p>
            </div>
            <Button onClick={() => setCheckout(true)}>Reservar</Button>
          </div>
        </div>
      )}

      {checkout && comercioCarrito && (
        <Checkout
          comercio={comercioCarrito}
          items={items}
          total={total}
          contacto={contactoGuardado}
          onCerrar={() => setCheckout(false)}
          onListo={() => {
            setCheckout(false);
            setCarrito({});
            setCarritoComercio(null);
          }}
        />
      )}
    </AppShell>
  );
}

function FichaComercio({
  comercio,
  km,
  abierto,
  productos,
  consulta,
  carrito,
  onCerrar,
  onAgregar,
  onQuitar,
}: {
  comercio: Comercio;
  km: number;
  abierto: boolean;
  productos: Producto[];
  consulta: string;
  carrito: Record<string, number>;
  onCerrar: () => void;
  onAgregar: (p: Producto) => void;
  onQuitar: (p: Producto) => void;
}) {
  const q = consulta.trim().toLowerCase();
  const ordenados = productos
    .slice()
    .sort((a, b) =>
      Number(b.nombre.toLowerCase().includes(q)) - Number(a.nombre.toLowerCase().includes(q)),
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 sm:items-center sm:justify-center">
      <div className="surface-card panel-lift max-h-[85vh] w-full overflow-y-auto rounded-b-none p-4 sm:max-w-lg sm:rounded-xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold">{comercio.nombre}</h2>
            <p className="text-sm text-muted-foreground">
              {comercio.direccion} · {formatDistancia(km)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant={abierto ? "default" : "secondary"}>
                {abierto ? "Abierto ahora" : "Cerrado"}
              </Badge>
              <span className="text-muted-foreground">Hoy: {horarioHoy(comercio.horario)}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Button asChild variant="outline" className="mt-3 w-full">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${comercio.lat},${comercio.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation className="mr-2 h-4 w-4" /> Cómo llegar
          </a>
        </Button>

        <div className="mt-4 space-y-2">
          {ordenados.map((p) => {
            const cant = carrito[p.id] ?? 0;
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                  <FotoProducto nombre={p.nombre} fotoUrl={p.fotoUrl} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.nombre}</p>
                  <p className="text-sm font-bold text-primary">{formatPrecio(p.precio)}</p>
                </div>
                {cant > 0 ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => onQuitar(p)} aria-label="Quitar">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-5 text-center text-sm font-semibold">{cant}</span>
                    <Button size="icon" onClick={() => onAgregar(p)} aria-label="Agregar">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => onAgregar(p)}>
                    Agregar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Checkout({
  comercio,
  items,
  total,
  contacto,
  onCerrar,
  onListo,
}: {
  comercio: Comercio;
  items: { productoId: string; nombre: string; cantidad: number; precio: number }[];
  total: number;
  contacto: { nombre: string; telefono: string } | null;
  onCerrar: () => void;
  onListo: () => void;
}) {
  const [nombre, setNombre] = useState(contacto?.nombre ?? "");
  const [telefono, setTelefono] = useState(contacto?.telefono ?? "");

  function confirmar() {
    if (!nombre.trim() || !telefono.trim()) return;
    const pedido = actions.crearPedido({
      comercioId: comercio.id,
      nombreContacto: nombre.trim(),
      telefonoContacto: telefono.trim(),
      items,
    });
    const origen = typeof window !== "undefined" ? window.location.origin : "";
    const msg = mensajeWhatsapp(
      comercio,
      items,
      { nombre: nombre.trim(), telefono: telefono.trim() },
      pedido.id,
      origen,
    );
    if (typeof window !== "undefined") {
      window.open(linkWhatsapp(comercio.whatsapp, msg), "_blank");
      window.location.assign(`/pedido/${pedido.id}`);
    }
    onListo();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40 sm:items-center sm:justify-center">
      <div className="surface-card panel-lift w-full p-4 sm:max-w-md">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Reservar para retirar</h2>
          <Button variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          En {comercio.nombre}. Pagás al retirar, no necesitás cuenta.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.productoId} className="flex justify-between gap-2">
              <span className="truncate">
                {i.cantidad} x {i.nombre}
              </span>
              <span className="font-medium">{formatPrecio(i.precio * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between border-t border-border pt-2 font-display font-bold">
          <span>Total</span>
          <span>{formatPrecio(total)}</span>
        </p>
        <div className="mt-4 space-y-2">
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            aria-label="Nombre de contacto"
          />
          <Input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Tu teléfono"
            inputMode="tel"
            aria-label="Teléfono de contacto"
          />
        </div>
        <Button className="mt-4 w-full" size="lg" onClick={confirmar}>
          <MapPin className="mr-2 h-4 w-4" /> Confirmar y enviar por WhatsApp
        </Button>
      </div>
    </div>
  );
}
