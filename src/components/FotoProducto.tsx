import { cn } from "@/lib/utils";

interface Props {
  nombre: string;
  fotoUrl?: string | undefined;
  className?: string;
}

export function FotoProducto({ nombre, fotoUrl, className }: Props) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nombre}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground",
        className,
      )}
      aria-label={nombre}
    >
      <span className="font-display text-xl font-bold opacity-60">
        {nombre.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}
