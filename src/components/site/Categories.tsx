import { Coins, Gamepad2, Package, ShieldCheck, Trophy, Zap } from "lucide-react";

const categories = [
  { icon: Gamepad2, label: "eFootball IDs", count: "2,340 listings", tint: "text-sky-400 bg-sky-500/10" },
  { icon: Coins, label: "Coins", count: "5,120 listings", tint: "text-amber-400 bg-amber-500/10" },
  { icon: Package, label: "Packs", count: "890 listings", tint: "text-violet-400 bg-violet-500/10" },
  { icon: Trophy, label: "Trophies", count: "450 listings", tint: "text-yellow-400 bg-yellow-500/10" },
  { icon: ShieldCheck, label: "Boosting", count: "320 listings", tint: "text-emerald-400 bg-emerald-500/10" },
  { icon: Zap, label: "Top Eleven", count: "180 listings", tint: "text-pink-400 bg-pink-500/10" },
];

export function Categories() {
  return (
    <section id="marketplace" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Browse marketplace</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick a category to start exploring</p>
          </div>
          <a href="#featured" className="text-sm text-primary hover:underline hidden sm:block">View all →</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c, i) => (
            <button
              key={c.label}
              className="group bg-card border border-border rounded-2xl p-4 md:p-5 hover:border-primary/50 hover:-translate-y-0.5 transition-all text-left shadow-soft no-tap-highlight animate-fade-up"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${c.tint}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm md:text-base">{c.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.count}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
