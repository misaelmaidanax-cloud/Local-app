import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hydrateStore, useAppState } from "@/lib/store";
import { formatPrecio } from "@/lib/utils-app";

export const Route = createFileRoute("/mis-pedidos")({
  head: () => ({
    meta: [
      { title: "Mis pedidos para retirar — Cercano" },
      {
        name: "description",
        content:
          "Seguí el estado de tus reservas: pendiente, listo para retirar o retirado, con el detalle de cada comercio.",
      },
      { property: "og:title", content: "Mis pedidos — Cercano" },
      {
        property: "og:description",
        content: "Historial y estado de tus pedidos para retirar en comercios del barrio.",
      },
    ],
  }),
  component: MisPedidos,
});

function MisPedidos() {
  useEffect(hydrateStore, []);
  const pedidos = useAppState((s) => s.pedidos);
  const comercios = useAppState((s) => s.comercios);
  const contacto = useAppState((s) => s.contacto);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">Mis pedidos</h1>
      <p className="text-sm text-muted-foreground">
        {contacto
          ? `Guardamos tus datos de contacto (${contacto.nombre}) para el próximo pedido.`
          : "Todavía no hiciste pedidos. No necesitás cuenta para reservar."}
      </p>

      <div className="mt-4 space-y-3">
        {pedidos.length === 0 && (
          <div className="surface-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Buscá un producto y reservá para retirar.</p>
            <Button asChild className="mt-3">
              <Link to="/">Buscar productos</Link>
            </Button>
          </div>
        )}
        {pedidos.map((p) => {
          const comercio = comercios.find((c) => c.id === p.comercioId);
          const total = p.items.reduce((a, i) => a + i.precio * i.cantidad, 0);
          return (
            <Link
              key={p.id}
              to="/pedido/$pedidoId"
              params={{ pedidoId: p.id }}
              className="surface-card block p-4 transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{comercio?.nombre ?? "Comercio"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.creado).toLocaleString("es-AR")} · {p.items.length} productos
                  </p>
                </div>
                <Badge variant={p.estado === "pendiente" ? "secondary" : "default"}>
                  {p.estado}
                </Badge>
              </div>
              <p className="mt-2 font-display font-bold">{formatPrecio(total)}</p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
