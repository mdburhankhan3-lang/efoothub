import { BadgeCheck, Star } from "lucide-react";

const sellers = [
  { name: "ProTrader_BD", rating: 4.9, sales: 1240, badge: "DIAMOND", color: "from-cyan-400 to-blue-500" },
  { name: "CoinKing", rating: 4.9, sales: 980, badge: "DIAMOND", color: "from-yellow-400 to-orange-500" },
  { name: "EliteGoals", rating: 4.8, sales: 720, badge: "GOLD", color: "from-amber-400 to-yellow-500" },
  { name: "BD_Trader", rating: 4.8, sales: 640, badge: "GOLD", color: "from-purple-400 to-pink-500" },
  { name: "PackMaster", rating: 4.7, sales: 540, badge: "SILVER", color: "from-gray-300 to-gray-500" },
  { name: "BoostPro", rating: 4.7, sales: 410, badge: "SILVER", color: "from-emerald-400 to-teal-500" },
];

export function TrustedSellers() {
  return (
    <section id="sellers" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-sm font-medium text-primary mb-2">TOP RATED</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Trusted Sellers</h2>
            <p className="text-muted-foreground mt-2">Verified pros with thousands of successful deals</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {sellers.map((s, i) => (
            <div
              key={s.name}
              className="group relative bg-gradient-card border border-border rounded-xl p-4 md:p-5 text-center hover:border-primary/50 hover:-translate-y-1 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${s.color} p-0.5`}>
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center font-display font-bold text-xl">
                    {s.name[0]}
                  </div>
                </div>
                <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-primary fill-card" />
              </div>
              <div className="font-semibold text-sm truncate">{s.name}</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{s.rating}</span>
                <span className="text-muted-foreground">· {s.sales}</span>
              </div>
              <div className="mt-3 inline-block text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                {s.badge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
