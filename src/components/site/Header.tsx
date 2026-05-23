import { Link } from "@tanstack/react-router";
import { Bell, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Marketplace", href: "#marketplace" },
  { label: "Coins", href: "#marketplace" },
  { label: "Tournaments", href: "#tournaments" },
  { label: "Sellers", href: "#sellers" },
  { label: "Community", href: "#community" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground shadow-primary">
            e
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            eFoot<span className="text-gradient">Hub</span>
          </span>
        </Link>

        {/* Inline search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 h-10">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input placeholder="Search listings, sellers, coins…" className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/60">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
          </Button>
          <Button className="hidden md:inline-flex bg-gradient-primary text-primary-foreground font-semibold shadow-primary h-9 px-4">
            Sign in
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border glass">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 h-10 mb-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Search…" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
            <nav className="flex flex-col">
              {nav.map((n) => (
                <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="px-3 py-3 text-sm font-medium rounded-md hover:bg-secondary/60">
                  {n.label}
                </a>
              ))}
              <Button className="mt-2 h-10 bg-gradient-primary text-primary-foreground font-semibold">Sign in</Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
