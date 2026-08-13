import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { actions, hydrateStore, useAppState } from "@/lib/store";
import { RUBROS } from "@/lib/types";
import { formatPrecio } from "@/lib/utils-app";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administración de la plataforma — Cercano" },
      {
        name: "description",
        content:
          "Panel interno: comercios registrados, activación y moderación, pedidos generados y búsquedas más frecuentes.",
      },
      { property: "og:title", content: "Administración — Cercano" },
      {
        property: "og:description",
        content: "Supervisión de comercios, pedidos y búsquedas de la plataforma.",
      },
    ],
  }),
  component: Admin,
});

function Admin() {
  useEffect(hydrateStore, []);
  const comercios = useAppState((s) => s.comercios);
  const productos = useAppState((s) => s.productos);
  const pedidos = useAppState((s) => s.pedidos);
  const busquedas = useAppState((s) =>
    s.busquedas.slice().sort((a, b) => b.cantidad - a.cantidad).slice(0, 8),
  );

  const activos = comercios.filter((c) => c.activo).length;
  const facturado = pedidos
    .filter((p) => p.estado === "retirado")
    .reduce((a, p) => a + p.items.reduce((x, i) => x + i.precio * i.cantidad, 0), 0);

  const metricas = [
    { label: "Comercios activos", valor: String(activos) },
    { label: "Productos cargados", valor: String(productos.length) },
    { label: "Pedidos generados", valor: String(pedidos.length) },
    { label: "Retirado (valor)", valor: formatPrecio(facturado) },
  ];

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">Administración de la plataforma</h1>
      <p className="text-sm text-muted-foreground">Panel interno del equipo.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricas.map((m) => (
          <div key={m.label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="font-display text-2xl font-bold">{m.valor}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Comercios registrados</h2>
      <div className="surface-card mt-2 divide-y divide-border">
        {comercios.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{c.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {RUBROS.find((r) => r.value === c.rubro)?.label} · {c.direccion} ·{" "}
                {productos.filter((p) => p.comercioId === c.id).length} productos
              </p>
            </div>
            <Badge variant={c.activo ? "default" : "secondary"}>
              {c.activo ? "Activo" : "Dado de baja"}
            </Badge>
            <Button
              size="sm"
              variant={c.activo ? "outline" : "default"}
              onClick={() => actions.actualizarComercio(c.id, { activo: !c.activo })}
            >
              {c.activo ? "Desactivar" : "Activar"}
            </Button>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Búsquedas más frecuentes</h2>
      <div className="surface-card mt-2 p-4">
        {busquedas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay búsquedas registradas.</p>
        ) : (
          <ul className="space-y-2">
            {busquedas.map((b) => (
              <li key={b.termino} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{b.termino}</span>
                <span className="font-medium text-muted-foreground">{b.cantidad}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
