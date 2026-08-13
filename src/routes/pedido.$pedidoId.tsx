import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navigation, Phone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hydrateStore, useAppState } from "@/lib/store";
import { formatPrecio, horarioHoy } from "@/lib/utils-app";

export const Route = createFileRoute("/pedido/$pedidoId")({
  head: () => ({
    meta: [
      { title: "Resumen de tu pedido — Cercano" },
      {
        name: "description",
        content:
          "Detalle de tu reserva: productos, total a pagar en el local, datos de contacto y estado del pedido.",
      },
      { property: "og:title", content: "Resumen de tu pedido — Cercano" },
      {
        property: "og:description",
        content: "Productos, total y estado de tu reserva para retirar.",
      },
    ],
  }),
  component: ResumenPedido,
  errorComponent: ({ error }) => (
    <AppShell>
      <p role="alert" className="surface-card p-4 text-sm">
        {error.message}
      </p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p className="surface-card p-4 text-sm">No encontramos ese pedido.</p>
    </AppShell>
  ),
});

function ResumenPedido() {
  useEffect(hydrateStore, []);
  const { pedidoId } = Route.useParams();
  const pedido = useAppState((s) => s.pedidos.find((p) => p.id === pedidoId));
  const comercio = useAppState((s) => s.comercios.find((c) => c.id === pedido?.comercioId));

  if (!pedido || !comercio) {
    return (
      <AppShell>
        <div className="surface-card p-6 text-center">
          <h1 className="font-display text-xl font-bold">Pedido no encontrado</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            El resumen se guarda en este dispositivo. Si lo abriste en otro, pedile el detalle al
            comercio.
          </p>
          <Button asChild className="mt-3">
            <Link to="/">Volver al mapa</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const total = pedido.items.reduce((a, i) => a + i.precio * i.cantidad, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <div className="surface-card p-5">
          <Badge variant={pedido.estado === "pendiente" ? "secondary" : "default"}>
            {pedido.estado}
          </Badge>
          <h1 className="mt-2 font-display text-2xl font-bold">{comercio.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            {comercio.direccion} · Hoy {horarioHoy(comercio.horario)}
          </p>

          <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            {pedido.items.map((i) => (
              <li key={i.productoId} className="flex justify-between gap-3">
                <span>
                  {i.cantidad} x {i.nombre}
                </span>
                <span className="font-medium">{formatPrecio(i.precio * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
            <span>Total a pagar en el local</span>
            <span>{formatPrecio(total)}</span>
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            A nombre de {pedido.nombreContacto} · {pedido.telefonoContacto}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${comercio.lat},${comercio.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="mr-2 h-4 w-4" /> Cómo llegar
              </a>
            </Button>
            <Button asChild>
              <a
                href={`https://wa.me/${comercio.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <Phone className="mr-2 h-4 w-4" /> Escribir al comercio
              </a>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
