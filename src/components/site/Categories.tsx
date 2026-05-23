import { Coins, Gamepad2, Package, Trophy, Users, Zap } from "lucide-react";

const categories = [
  { icon: Gamepad2, label: "Accounts", count: "2,340", color: "from-blue-500 to-cyan-500" },
  { icon: Coins, label: "Coins", count: "5,120", color: "from-yellow-500 to-orange-500" },
  { icon: Package, label: "Packs", count: "890", color: "from-purple-500 to-pink-500" },
  { icon: Trophy, label: "Trophies", count: "450", color: "from-amber-500 to-yellow-500" },
  { icon: Users, label: "Boosting", count: "320", color: "from-emerald-500 to-teal-500" },
  { icon: Zap, label: "Top Eleven", count: "180", color: "from-fuchsia-500 to-purple-500" },
];

export function Categories() {
  return (
    <section id="marketplace" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-sm font-medium text-primary mb-2">EXPLORE</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Marketplace Categories</h2>
          </div>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">View all →</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((c, i) => (
            <button
              key={c.label}
              className="group relative overflow-hidden rounded-xl bg-gradient-card border border-border p-5 md:p-6 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-neon text-left animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                <c.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="font-display font-bold text-sm md:text-base">{c.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.count} listings</div>
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
