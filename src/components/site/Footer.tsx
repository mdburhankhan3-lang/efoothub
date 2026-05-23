import { Zap } from "lucide-react";

const cols = [
  { title: "Marketplace", links: ["Accounts", "Coins", "Packs", "Boosting", "Trophies"] },
  { title: "Platform", links: ["Tournaments", "Trusted Sellers", "Escrow Deals", "Market Trends", "Verification"] },
  { title: "Support", links: ["Help Center", "Scam Protection", "Contact", "Terms", "Privacy"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-primary">
                <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl">eFoot<span className="text-gradient">Hub</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premium eFootball marketplace for Bangladesh and the world.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-semibold mb-4 text-sm">{c.title}</h3>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <p className="text-xs text-muted-foreground">&copy; 2026 eFootHub. Made in Dhaka, Bangladesh.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
