import { Link } from "@tanstack/react-router";
import { Gavel, Hop as Home, Search, ShoppingBag, User } from "lucide-react";

const items = [
  { icon: Home, label: "Home", to: "/" as const },
  { icon: Search, label: "Browse", to: "/" as const, hash: "marketplace" },
  { icon: Gavel, label: "Sell", to: "/sell" as const, primary: true },
  { icon: ShoppingBag, label: "Bids", to: "/dashboard" as const },
  { icon: User, label: "Me", to: "/dashboard" as const },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5 h-16">
        {items.map((it) => (
          <li key={it.label} className="flex">
            <Link
              to={it.to}
              hash={it.hash}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground no-tap-highlight"
            >
              {it.primary ? (
                <span className="w-11 h-11 -mt-5 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-primary">
                  <it.icon className="w-5 h-5" />
                </span>
              ) : (
                <it.icon className="w-5 h-5" />
              )}
              <span className={it.primary ? "mt-0" : ""}>{it.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
