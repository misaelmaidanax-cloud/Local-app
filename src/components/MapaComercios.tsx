import { useEffect, useRef } from "react";
import type { Comercio } from "@/lib/types";
import { formatPrecio } from "@/lib/utils-app";

interface Props {
  comercios: Comercio[];
  precios: Record<string, number | undefined>;
  destacados: Set<string>;
  seleccionado: string | null;
  centro: { lat: number; lng: number };
  ubicacionUsuario: { lat: number; lng: number } | null;
  onSelect: (comercioId: string) => void;
}

export default function MapaComercios({
  comercios,
  precios,
  destacados,
  seleccionado,
  centro,
  ubicacionUsuario,
  onSelect,
}: Props) {
  const contenedor = useRef<HTMLDivElement | null>(null);
  const mapa = useRef<import("leaflet").Map | null>(null);
  const capa = useRef<import("leaflet").LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelado || !contenedor.current || mapa.current) return;
      leaflet.current = L;
      const map = L.map(contenedor.current, {
        center: [centro.lat, centro.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · CARTO",
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      capa.current = L.layerGroup().addTo(map);
      mapa.current = map;
      dibujar();
    })();
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dibujar() {
    const L = leaflet.current;
    if (!L || !capa.current) return;
    capa.current.clearLayers();

    comercios.forEach((c) => {
      const precio = precios[c.id];
      const esMatch = destacados.has(c.id);
      const clases = [
        "cercano-pin",
        esMatch ? "cercano-pin--match" : "",
        seleccionado === c.id ? "cercano-pin--selected" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const etiqueta =
        esMatch && precio !== undefined ? formatPrecio(precio) : c.nombre.split(" ")[0];
      const icon = L.divIcon({
        className: "cercano-pin-wrapper",
        html: `<div class="${clases}">${etiqueta}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      L.marker([c.lat, c.lng], { icon, zIndexOffset: esMatch ? 500 : 0 })
        .addTo(capa.current!)
        .on("click", () => onSelectRef.current(c.id));
    });

    if (ubicacionUsuario) {
      const icon = L.divIcon({
        className: "cercano-pin-wrapper",
        html: `<div class="cercano-pin cercano-pin--me">Vos</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      L.marker([ubicacionUsuario.lat, ubicacionUsuario.lng], { icon }).addTo(capa.current);
    }
  }

  useEffect(dibujar, [comercios, precios, destacados, seleccionado, ubicacionUsuario]);

  useEffect(() => {
    mapa.current?.panTo([centro.lat, centro.lng], { animate: true });
  }, [centro.lat, centro.lng]);

  return <div ref={contenedor} className="h-full w-full" aria-label="Mapa de comercios" />;
}
