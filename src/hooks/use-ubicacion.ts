import { useEffect, useState } from "react";

export type EstadoUbicacion = "pidiendo" | "ok" | "denegada" | "no-soportada";

const CENTRO_DEFAULT = { lat: -34.6187, lng: -58.4386 };

export function useUbicacion() {
  const [estado, setEstado] = useState<EstadoUbicacion>("pidiendo");
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setEstado("no-soportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setEstado("ok");
      },
      () => setEstado("denegada"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return { estado, ubicacion, referencia: ubicacion ?? CENTRO_DEFAULT };
}
