import { BadgeCheck, Gavel, Heart, Shield, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filters } from "./Filters";
import { BidDialog } from "./BidDialog";

type Listing = {
  title: string;
  seller: string;
  price: string;
  oldPrice?: string;
  platform: "Mobile" | "PS5" | "PS4" | "Xbox" | "PC";
  rank: string;
  rating: number;
  verified: boolean;
  featured?: boolean;
  player: string; // gradient
  squad: string; // gradient
};

const listings: Listing[] = [
  { title: "Legendary Squad · 110 OVR · 25 Epic", seller: "ProTrader_BD", price: "৳12,500", oldPrice: "৳15,000", platform: "PS5", rank: "Legendary", rating: 4.9, verified: true, featured: true, player: "linear-gradient(135deg,#0ea5e9,#1e3a8a)", squad: "linear-gradient(135deg,#0b1220,#1e293b)" },
  { title: "1M eFootball Coins · Fast Delivery", seller: "CoinKing", price: "৳3,200", platform: "Mobile", rank: "Gold", rating: 4.9, verified: true, player: "linear-gradient(135deg,#f59e0b,#b45309)", squad: "linear-gradient(135deg,#1f1305,#3b2412)" },
  { title: "Epic Player Pack ×10 · Guaranteed", seller: "PackMaster", price: "৳2,800", oldPrice: "৳3,500", platform: "PC", rank: "Epic", rating: 4.7, verified: true, player: "linear-gradient(135deg,#a855f7,#6b21a8)", squad: "linear-gradient(135deg,#1a0b2e,#2e1065)" },
  { title: "Messi + Ronaldo Bundle · 108 OVR", seller: "EliteGoals", price: "৳18,900", platform: "PS5", rank: "Legendary", rating: 5.0, verified: true, featured: true, player: "linear-gradient(135deg,#10b981,#065f46)", squad: "linear-gradient(135deg,#022c22,#064e3b)" },
  { title: "Champions Squad · 106 OVR · GP Rich", seller: "BD_Trader", price: "৳9,400", platform: "Mobile", rank: "Epic", rating: 4.8, verified: true, player: "linear-gradient(135deg,#3b82f6,#1e40af)", squad: "linear-gradient(135deg,#0b1a3a,#1e3a8a)" },
  { title: "Pro Boost Service · Division 1", seller: "BoostPro", price: "৳5,500", platform: "Xbox", rank: "Gold", rating: 4.6, verified: false, player: "linear-gradient(135deg,#ef4444,#991b1b)", squad: "linear-gradient(135deg,#1f0a0a,#450a0a)" },
];

const quickFilters = ["All", "eFootball IDs", "Coins", "Packs", "Boosting", "Trending", "Under ৳5k"];

export function FeaturedListings() {
  const [bid, setBid] = useState<Listing | null>(null);

  return (
    <section id="featured" className="py-12 md:py-20 stadium-bg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Featured listings</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked deals from verified sellers</p>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">See all listings →</a>
        </div>

        {/* Quick filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-5 -mx-4 px-4">
          {quickFilters.map((f, i) => (
            <button
              key={f}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                i === 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar filters */}
          <div className="hidden lg:block">
            <Filters />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.map((l, i) => (
              <article
                key={l.title}
                className="group bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:border-primary/50 hover:-translate-y-0.5 transition-all animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Image area — Player + Squad */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* Squad backdrop */}
                  <div className="absolute inset-0" style={{ background: l.squad }} />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                  {/* Player avatar */}
                  <div
                    className="absolute right-3 bottom-3 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-white/20 shadow-soft"
                    style={{ background: l.player }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_50%)]" />
                    <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white/90 tracking-wider">PLAYER</div>
                  </div>
                  {/* Squad label */}
                  <div className="absolute top-3 left-3 text-[10px] font-bold text-white/70 tracking-[0.2em]">SQUAD</div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {l.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-bold tracking-wider">★ FEATURED</span>
                    )}
                  </div>

                  {/* Platform + Rank chips bottom-left */}
                  <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-semibold text-white">{l.platform}</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-bold tracking-wide">{l.rank}</span>
                  </div>

                  <button className="absolute top-3 right-3 sm:top-auto sm:bottom-3 sm:right-auto sm:left-auto w-8 h-8 rounded-full glass items-center justify-center hover:bg-destructive/30 transition-colors hidden">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-semibold text-[15px] leading-snug mb-2 line-clamp-1">{l.title}</h3>

                  {/* Seller */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <span className="font-medium text-foreground/90">{l.seller}</span>
                    {l.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                    <span>·</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{l.rating}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="font-display font-bold text-xl">{l.price}</div>
                      {l.oldPrice && <div className="text-xs text-muted-foreground line-through">{l.oldPrice}</div>}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-success font-semibold">
                      <Shield className="w-3 h-3" /> Escrow
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-10 bg-gradient-primary text-primary-foreground font-semibold shadow-primary hover:opacity-95">
                      Buy now
                    </Button>
                    <Button
                      onClick={() => setBid(l)}
                      variant="outline"
                      className="h-10 border-border bg-secondary/50 hover:bg-secondary font-semibold"
                    >
                      <Gavel className="w-4 h-4 mr-1.5" /> Place bid
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <BidDialog open={!!bid} onClose={() => setBid(null)} listing={bid} />
    </section>
  );
}
