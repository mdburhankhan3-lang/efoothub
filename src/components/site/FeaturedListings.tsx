import { BadgeCheck, Eye, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const listings = [
  { title: "Legendary Account · 110 OVR", seller: "ProTrader_BD", price: "৳12,500", oldPrice: "৳15,000", trend: "+12%", img: "linear-gradient(135deg,#0ea5e9,#6366f1)", verified: true, featured: true, views: 1240 },
  { title: "1M eFootball Coins", seller: "CoinKing", price: "৳3,200", trend: "+5%", img: "linear-gradient(135deg,#f59e0b,#ef4444)", verified: true, views: 890 },
  { title: "Epic Player Pack ×10", seller: "PackMaster", price: "৳2,800", oldPrice: "৳3,500", trend: "-3%", img: "linear-gradient(135deg,#a855f7,#ec4899)", verified: true, views: 560 },
  { title: "Messi + Ronaldo Bundle", seller: "EliteGoals", price: "৳18,900", trend: "+22%", img: "linear-gradient(135deg,#10b981,#06b6d4)", verified: true, featured: true, views: 2100 },
  { title: "Champions Squad Account", seller: "BD_Trader", price: "৳9,400", trend: "+8%", img: "linear-gradient(135deg,#3b82f6,#8b5cf6)", verified: true, views: 720 },
  { title: "Pro Boost Service · Div 1", seller: "BoostPro", price: "৳5,500", trend: "+1%", img: "linear-gradient(135deg,#ef4444,#f59e0b)", verified: false, views: 410 },
];

const filters = ["All", "Accounts", "Coins", "Packs", "Boosting", "Trending", "Under ৳5k"];

export function FeaturedListings() {
  return (
    <section className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm font-medium text-primary mb-2">HOT RIGHT NOW</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Featured Listings</h2>
            <p className="text-muted-foreground mt-2">Hand-picked deals from verified sellers</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6 -mx-4 px-4">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                i === 0
                  ? "bg-gradient-neon text-primary-foreground shadow-neon"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {listings.map((l, i) => (
            <article
              key={l.title}
              className="group relative bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-neon animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden" style={{ background: l.img }}>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {l.featured && (
                    <span className="px-2.5 py-1 rounded-md bg-accent/90 text-accent-foreground text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                      ★ Featured
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md glass text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {l.trend}
                  </span>
                </div>
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-destructive/20 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-foreground/80">
                  <Eye className="w-3 h-3" /> {l.views}
                </div>
              </div>

              <div className="p-4 md:p-5">
                <h3 className="font-semibold text-base mb-2 line-clamp-1">{l.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <span>{l.seller}</span>
                  {l.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-display font-bold text-xl text-gradient">{l.price}</div>
                    {l.oldPrice && <div className="text-xs text-muted-foreground line-through">{l.oldPrice}</div>}
                  </div>
                  <Button size="sm" className="bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                    Buy now
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
