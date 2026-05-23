import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Marketplace", href: "#marketplace" },
  { label: "Coins", href: "#coins" },
  { label: "Tournaments", href: "#tournaments" },
  { label: "Sellers", href: "#sellers" },
  { label: "Community", href: "#community" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-neon flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            eFoot<span className="text-gradient">Hub</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[10px] flex items-center justify-center font-bold">3</span>
          </Button>
          <Button className="hidden md:inline-flex bg-gradient-neon hover:opacity-90 text-primary-foreground font-semibold shadow-neon">
            Sign In
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/50 glass animate-fade-up">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium rounded-md hover:bg-secondary/50">
                {n.label}
              </a>
            ))}
            <Button className="mt-2 bg-gradient-neon text-primary-foreground font-semibold">Sign In</Button>
          </nav>
        </div>
      )}
    </header>
  );
}
