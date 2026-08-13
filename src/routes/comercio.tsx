import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FotoProducto } from "@/components/FotoProducto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { actions, hydrateStore, useAppState } from "@/lib/store";
import { DAYS, type EstadoPedido, type Producto } from "@/lib/types";
import { formatPrecio } from "@/lib/utils-app";

export const Route = createFileRoute("/comercio")({
  head: () => ({
    meta: [
      { title: "Panel del comerciante — Cercano" },
      {
        name: "description",
        content:
          "Cargá tu catálogo con foto, nombre y precio en segundos, gestioná pedidos para retirar y tu horario de atención.",
      },
      { property: "og:title", content: "Panel del comerciante — Cercano" },
      {
        property: "og:description",
        content: "Catálogo, pedidos y horarios de tu comercio desde el celular.",
      },
    ],
  }),
  component: PanelComercio,
});

const ESTADOS: { valor: EstadoPedido; label: string }[] = [
  { valor: "pendiente", label: "Pendiente" },
  { valor: "listo", label: "Listo para retirar" },
  { valor: "retirado", label: "Retirado" },
  { valor: "cancelado", label: "Cancelado" },
];

function PanelComercio() {
  useEffect(hydrateStore, []);
  const comercioId = useAppState((s) => s.comercioActivoId);
  const comercios = useAppState((s) => s.comercios);
  const comercio = comercios.find((c) => c.id === comercioId) ?? comercios[0];
  const productos = useAppState((s) => s.productos.filter((p) => p.comercioId === comercio?.id));
  const pedidos = useAppState((s) => s.pedidos.filter((p) => p.comercioId === comercio?.id));

  if (!comercio) return null;

  const entrantes = pedidos.filter((p) => p.estado === "pendiente" || p.estado === "listo");
  const cerrados = pedidos.filter((p) => p.estado === "retirado" || p.estado === "cancelado");

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{comercio.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            {comercio.direccion} · WhatsApp {comercio.whatsapp}
          </p>
        </div>
        <select
          value={comercio.id}
          onChange={(e) => actions.setComercioActivo(e.target.value)}
          aria-label="Cambiar de comercio"
          className="h-9 rounded-lg border border-input bg-card px-3 text-sm"
        >
          {comercios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="catalogo">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="catalogo">Catálogo ({productos.length})</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos ({entrantes.length})</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
          <TabsTrigger value="horario">Horario</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo" className="mt-4">
          <Catalogo comercioId={comercio.id} productos={productos} />
        </TabsContent>

        <TabsContent value="pedidos" className="mt-4 space-y-3">
          {entrantes.length === 0 && (
            <p className="surface-card p-4 text-sm text-muted-foreground">
              Todavía no tenés pedidos entrantes.
            </p>
          )}
          {entrantes.map((p) => (
            <div key={p.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.nombreContacto}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.telefonoContacto} · {new Date(p.creado).toLocaleString("es-AR")}
                  </p>
                </div>
                <Badge variant={p.estado === "listo" ? "default" : "secondary"}>{p.estado}</Badge>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {p.items.map((i) => (
                  <li key={i.productoId} className="flex justify-between gap-2">
                    <span>
                      {i.cantidad} x {i.nombre}
                    </span>
                    <span>{formatPrecio(i.precio * i.cantidad)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-display font-bold">
                Total {formatPrecio(p.items.reduce((a, i) => a + i.precio * i.cantidad, 0))}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ESTADOS.filter((e) => e.valor !== p.estado).map((e) => (
                  <Button
                    key={e.valor}
                    size="sm"
                    variant={e.valor === "cancelado" ? "outline" : "secondary"}
                    onClick={() => actions.cambiarEstadoPedido(p.id, e.valor)}
                  >
                    {e.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="transacciones" className="mt-4">
          <div className="surface-card divide-y divide-border">
            {cerrados.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Sin pedidos cerrados todavía.</p>
            )}
            {cerrados.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium">{p.nombreContacto}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.creado).toLocaleDateString("es-AR")} · {p.items.length} productos
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold">
                    {formatPrecio(p.items.reduce((a, i) => a + i.precio * i.cantidad, 0))}
                  </p>
                  <Badge variant="secondary">{p.estado}</Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="horario" className="mt-4">
          <div className="surface-card divide-y divide-border">
            {DAYS.map((d) => {
              const h = comercio.horario[d.key];
              return (
                <div key={d.key} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="w-24 text-sm font-medium">{d.label}</span>
                  <Input
                    type="time"
                    value={h.abre}
                    disabled={h.cerrado}
                    onChange={(e) =>
                      actions.actualizarComercio(comercio.id, {
                        horario: { ...comercio.horario, [d.key]: { ...h, abre: e.target.value } },
                      })
                    }
                    className="w-28"
                    aria-label={`Apertura ${d.label}`}
                  />
                  <Input
                    type="time"
                    value={h.cierra}
                    disabled={h.cerrado}
                    onChange={(e) =>
                      actions.actualizarComercio(comercio.id, {
                        horario: { ...comercio.horario, [d.key]: { ...h, cierra: e.target.value } },
                      })
                    }
                    className="w-28"
                    aria-label={`Cierre ${d.label}`}
                  />
                  <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    Cerrado
                    <Switch
                      checked={h.cerrado}
                      onCheckedChange={(v) =>
                        actions.actualizarComercio(comercio.id, {
                          horario: { ...comercio.horario, [d.key]: { ...h, cerrado: v } },
                        })
                      }
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Catalogo({ comercioId, productos }: { comercioId: string; productos: Producto[] }) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const disponibles = useMemo(() => productos.filter((p) => p.disponible).length, [productos]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {disponibles} disponibles de {productos.length}
        </p>
        <Button
          onClick={() => {
            setEditando(null);
            setAbierto(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Agregar producto
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => (
          <div key={p.id} className="surface-card overflow-hidden">
            <div className="aspect-square w-full overflow-hidden">
              <FotoProducto nombre={p.nombre} fotoUrl={p.fotoUrl} />
            </div>
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 text-sm font-medium">{p.nombre}</p>
              <p className="font-display text-lg font-bold text-primary">
                {formatPrecio(p.precio)}
              </p>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={p.disponible}
                    onCheckedChange={(v) => actions.actualizarProducto(p.id, { disponible: v })}
                    aria-label="Disponible"
                  />
                  {p.disponible ? "En stock" : "Sin stock"}
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    onClick={() => {
                      setEditando(p);
                      setAbierto(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar"
                    onClick={() => actions.eliminarProducto(p.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {abierto && (
        <FormularioProducto
          comercioId={comercioId}
          producto={editando}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  );
}

function FormularioProducto({
  comercioId,
  producto,
  onCerrar,
}: {
  comercioId: string;
  producto: Producto | null;
  onCerrar: () => void;
}) {
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : "");
  const [categoria, setCategoria] = useState(producto?.categoria ?? "");
  const [foto, setFoto] = useState(producto?.fotoUrl ?? "");
  const [guardado, setGuardado] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const nombreRef = useRef<HTMLInputElement | null>(null);

  function guardar(seguir: boolean) {
    const valor = Number(precio.replace(",", "."));
    if (!nombre.trim() || !Number.isFinite(valor) || valor <= 0) return;
    if (producto) {
      actions.actualizarProducto(producto.id, {
        nombre: nombre.trim(),
        precio: valor,
        categoria: categoria.trim() || "General",
        fotoUrl: foto,
      });
      onCerrar();
      return;
    }
    actions.agregarProducto({
      comercioId,
      nombre: nombre.trim(),
      precio: valor,
      categoria: categoria.trim() || "General",
      fotoUrl: foto,
      disponible: true,
    });
    if (seguir) {
      setNombre("");
      setPrecio("");
      setFoto("");
      setGuardado(true);
      window.setTimeout(() => setGuardado(false), 1200);
      nombreRef.current?.focus();
    } else {
      onCerrar();
    }
  }

  function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 sm:items-center sm:justify-center">
      <div className="surface-card panel-lift w-full p-4 sm:max-w-md">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            {producto ? "Editar producto" : "Nuevo producto"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/40"
        >
          {foto ? (
            <img src={foto} alt="Foto del producto" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
              <Camera className="h-6 w-6" /> Sacar foto o elegir de la galería
            </span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onArchivo}
        />

        <div className="mt-3 space-y-2">
          <Input
            ref={nombreRef}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del producto"
            aria-label="Nombre"
          />
          <Input
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Precio"
            inputMode="decimal"
            aria-label="Precio"
          />
          <Input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Categoría (opcional)"
            aria-label="Categoría"
          />
        </div>

        <div className="mt-4 flex gap-2">
          {!producto && (
            <Button variant="secondary" className="flex-1" onClick={() => guardar(true)}>
              {guardado ? <Check className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
              Guardar y otro
            </Button>
          )}
          <Button className="flex-1" onClick={() => guardar(false)}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
