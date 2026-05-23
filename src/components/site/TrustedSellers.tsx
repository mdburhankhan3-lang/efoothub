import { BadgeCheck, Star } from "lucide-react";

const sellers = [
  { name: "ProTrader_BD", rating: 4.9, sales: 1240, badge: "DIAMOND", tint: "from-cyan-400 to-blue-500" },
  { name: "CoinKing", rating: 4.9, sales: 980, badge: "DIAMOND", tint: "from-amber-400 to-orange-500" },
  { name: "EliteGoals", rating: 4.8, sales: 720, badge: "GOLD", tint: "from-amber-300 to-yellow-500" },
  { name: "BD_Trader", rating: 4.8, sales: 640, badge: "GOLD", tint: "from-violet-400 to-pink-500" },
  { name: "PackMaster", rating: 4.7, sales: 540, badge: "SILVER", tint: "from-slate-300 to-slate-500" },
  { name: "BoostPro", rating: 4.7, sales: 410, badge: "SILVER", tint: "from-emerald-400 to-teal-500" },
];

export function TrustedSellers() {
  return (
    <section id="sellers" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Trusted sellers</h2>
            <p className="text-sm text-muted-foreground mt-1">Verified pros with thousands of successful deals</p>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">Browse all sellers →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {sellers.map((s, i) => (
            <div
              key={s.name}
              className="bg-card border border-border rounded-2xl p-4 text-center shadow-soft hover:border-primary/50 hover:-translate-y-0.5 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="relative w-14 h-14 mx-auto mb-3">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${s.tint} p-0.5`}>
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center font-display font-bold">
                    {s.name[0]}
                  </div>
                </div>
                <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-primary fill-card" />
              </div>
              <div className="font-semibold text-sm truncate">{s.name}</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-xs">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-medium">{s.rating}</span>
                <span className="text-muted-foreground">· {s.sales}</span>
              </div>
              <div className="mt-2 inline-block text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                {s.badge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
