import { ArrowRight, Search, ShieldCheck, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-5 animate-fade-in">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Admin-secured escrow on every deal</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold leading-[1.1] mb-4 animate-fade-up">
            Buy & sell <span className="text-gradient">eFootball IDs</span> the safe way.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-7 max-w-xl animate-fade-up" style={{ animationDelay: "0.05s" }}>
            Browse verified seller listings, place private bids, and trade coins with full scam protection.
            Built for Bangladesh, trusted worldwide.
          </p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 h-12 shadow-soft">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search players, IDs, coins, packs..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <Button className="h-12 px-6 bg-gradient-primary text-primary-foreground font-semibold shadow-primary hover:opacity-95">
              Browse <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            {["Trending", "Epic cards", "GP rich", "Under ৳5k", "PS5", "Mobile"].map((c) => (
              <button
                key={c}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-foreground/90 border border-border transition-colors"
              >
                {c}
              </button>
            ))}
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-10 max-w-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {[
              { v: "50K+", l: "Active users" },
              { v: "৳2Cr+", l: "Traded safely" },
              { v: "100%", l: "Escrow protected" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display font-bold text-2xl md:text-3xl">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
