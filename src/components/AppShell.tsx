import { Link } from "@tanstack/react-router";
import { MapPin, Store, ClipboardList, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Buscar", icon: MapPin },
  { to: "/comercio", label: "Mi comercio", icon: Store },
  { to: "/mis-pedidos", label: "Mis pedidos", icon: ClipboardList },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

export function AppShell({
  children,
  sinPadding = false,
}: {
  children: ReactNode;
  sinPadding?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Cercano</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={sinPadding ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-6"}>
        {children}
      </main>

      <nav className="sticky bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur sm:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
