import { Gavel, Home, Search, ShoppingBag, User } from "lucide-react";

const items = [
  { icon: Home, label: "Home", href: "#" },
  { icon: Search, label: "Browse", href: "#marketplace" },
  { icon: Gavel, label: "Sell", href: "#", primary: true },
  { icon: ShoppingBag, label: "Orders", href: "#" },
  { icon: User, label: "Me", href: "#" },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5 h-16">
        {items.map((it) => (
          <li key={it.label} className="flex">
            <a
              href={it.href}
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
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
