import { BadgeCheck, Gavel, Shield, Star, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { BidDialog } from "./BidDialog";
import { listListings } from "@/lib/marketplace.functions";

type DisplayListing = {
  id: string;
  title: string;
  seller: string;
  price: string;
  oldPrice?: string;
  platform: string;
  rank: string;
  rating: number;
  verified: boolean;
  featured?: boolean;
  player: string;
  squad: string;
  category: string;
};

const fallback: DisplayListing[] = [
  { id: "m1", title: "Legendary Squad · 110 OVR · 25 Epic", seller: "ProTrader_BD", price: "৳12,500", oldPrice: "৳15,000", platform: "PS5", rank: "Legendary", rating: 4.9, verified: true, featured: true, player: "linear-gradient(135deg,#0ea5e9,#1e3a8a)", squad: "linear-gradient(135deg,#0b1220,#1e293b)", category: "id" },
  { id: "m2", title: "1M eFootball Coins · Fast Delivery", seller: "CoinKing", price: "৳3,200", platform: "Mobile", rank: "Gold", rating: 4.9, verified: true, player: "linear-gradient(135deg,#f59e0b,#b45309)", squad: "linear-gradient(135deg,#1f1305,#3b2412)", category: "coins" },
  { id: "m3", title: "Epic Player Pack ×10 · Guaranteed", seller: "PackMaster", price: "৳2,800", oldPrice: "৳3,500", platform: "PC", rank: "Epic", rating: 4.7, verified: true, player: "linear-gradient(135deg,#a855f7,#6b21a8)", squad: "linear-gradient(135deg,#1a0b2e,#2e1065)", category: "pack" },
  { id: "m4", title: "Messi + Ronaldo Bundle · 108 OVR", seller: "EliteGoals", price: "৳18,900", platform: "PS5", rank: "Legendary", rating: 5.0, verified: true, featured: true, player: "linear-gradient(135deg,#10b981,#065f46)", squad: "linear-gradient(135deg,#022c22,#064e3b)", category: "id" },
  { id: "m5", title: "Champions Squad · 106 OVR · GP Rich", seller: "BD_Trader", price: "৳9,400", platform: "Mobile", rank: "Epic", rating: 4.8, verified: true, player: "linear-gradient(135deg,#3b82f6,#1e40af)", squad: "linear-gradient(135deg,#0b1a3a,#1e3a8a)", category: "id" },
  { id: "m6", title: "Pro Boost Service · Division 1", seller: "BoostPro", price: "৳5,500", platform: "Xbox", rank: "Gold", rating: 4.6, verified: false, player: "linear-gradient(135deg,#ef4444,#991b1b)", squad: "linear-gradient(135deg,#1f0a0a,#450a0a)", category: "boost" },
];

const gradients = [
  ["linear-gradient(135deg,#0ea5e9,#1e3a8a)", "linear-gradient(135deg,#0b1220,#1e293b)"],
  ["linear-gradient(135deg,#f59e0b,#b45309)", "linear-gradient(135deg,#1f1305,#3b2412)"],
  ["linear-gradient(135deg,#a855f7,#6b21a8)", "linear-gradient(135deg,#1a0b2e,#2e1065)"],
  ["linear-gradient(135deg,#10b981,#065f46)", "linear-gradient(135deg,#022c22,#064e3b)"],
  ["linear-gradient(135deg,#3b82f6,#1e40af)", "linear-gradient(135deg,#0b1a3a,#1e3a8a)"],
  ["linear-gradient(135deg,#ef4444,#991b1b)", "linear-gradient(135deg,#1f0a0a,#450a0a)"],
];

const quickFilters = [
  { label: "All", category: undefined },
  { label: "eFootball IDs", category: "id" as const },
  { label: "Coins", category: "coins" as const },
  { label: "Packs", category: "pack" as const },
  { label: "Boosting", category: "boost" as const },
];

const platforms = ["All", "Mobile", "PS5", "PS4", "Xbox", "PC"];
const priceRanges = [
  { label: "Any price", min: undefined as number | undefined, max: undefined as number | undefined },
  { label: "Under ৳2k", min: undefined, max: 2000 },
  { label: "৳2k–5k", min: 2000, max: 5000 },
  { label: "৳5k–10k", min: 5000, max: 10000 },
  { label: "৳10k+", min: 10000, max: undefined },
];

function fmt(n: number, c: string) {
  return (c === "BDT" ? "৳" : c + " ") + Number(n).toLocaleString();
}

export function FeaturedListings() {
  const [bid, setBid] = useState<DisplayListing | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [activePlatform, setActivePlatform] = useState<string>("All");
  const [activePriceRange, setActivePriceRange] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const priceRange = priceRanges[activePriceRange];
  const fetchFn = useServerFn(listListings);
  const { data } = useQuery({
    queryKey: ["listings", activeCategory, activePlatform, activePriceRange],
    queryFn: () =>
      fetchFn({
        data: {
          category: activeCategory as any,
          platform: activePlatform !== "All" ? (activePlatform as any) : undefined,
          minPrice: priceRange?.min,
          maxPrice: priceRange?.max,
        },
      }),
  });

  const listings: DisplayListing[] =
    data && data.length > 0
      ? data.map((l: any, i: number) => {
          const seller = Array.isArray(l.seller) ? l.seller[0] : l.seller;
          const [player, squad] = gradients[i % gradients.length];
          return {
            id: l.id,
            title: l.title,
            seller: seller?.display_name ?? seller?.username ?? "Seller",
            price: fmt(l.price, l.currency),
            oldPrice: l.old_price ? fmt(l.old_price, l.currency) : undefined,
            platform: l.platform,
            rank: l.rank ?? l.category?.toUpperCase() ?? "—",
            rating: Number(seller?.rating ?? 0),
            verified: !!seller?.verified,
            featured: !!l.featured,
            player,
            squad,
            category: l.category,
          };
        })
      : fallback.filter((l) => {
          if (activeCategory && l.category !== activeCategory) return false;
          if (activePlatform !== "All" && l.platform !== activePlatform) return false;
          return true;
        });

  return (
    <section id="featured" className="py-12 md:py-20 stadium-bg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Featured listings</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked deals from verified sellers</p>
          </div>
          <Link to="/dashboard" className="text-sm text-primary hover:underline">My dashboard →</Link>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4 -mx-4 px-4">
          {quickFilters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveCategory(f.category)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === f.category
                  ? "bg-primary text-primary-foreground border-primary shadow-primary"
                  : "bg-card text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setFiltersOpen(!filtersOpen)}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
          {filtersOpen && (
            <div className="mt-3 bg-card border border-border rounded-xl p-4 space-y-4 animate-fade-in">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Platform</div>
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePlatform(p)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                        activePlatform === p
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Budget</div>
                <div className="flex flex-wrap gap-1.5">
                  {priceRanges.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setActivePriceRange(i)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                        activePriceRange === i
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <DesktopFilters
              activePlatform={activePlatform}
              setActivePlatform={setActivePlatform}
              activePriceRange={activePriceRange}
              setActivePriceRange={setActivePriceRange}
            />
          </div>

          {/* Listing grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.map((l, i) => (
              <Link
                key={l.id}
                to="/listing/$id"
                params={{ id: l.id }}
                className="group bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:border-primary/50 hover:-translate-y-0.5 transition-all animate-fade-up block"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0" style={{ background: l.squad }} />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                  <div className="absolute right-3 bottom-3 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-white/20 shadow-soft" style={{ background: l.player }}>
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_50%)]" />
                    <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white/90 tracking-wider">PLAYER</div>
                  </div>
                  <div className="absolute top-3 left-3 text-[10px] font-bold text-white/70 tracking-[0.2em]">SQUAD</div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {l.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-bold tracking-wider">FEATURED</span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-semibold text-white">{l.platform}</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-bold tracking-wide">{l.rank}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[15px] leading-snug mb-2 line-clamp-1">{l.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <span className="font-medium text-foreground/90">{l.seller}</span>
                    {l.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                    <span>·</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{l.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="font-display font-bold text-xl">{l.price}</div>
                      {l.oldPrice && <div className="text-xs text-muted-foreground line-through">{l.oldPrice}</div>}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-success font-semibold">
                      <Shield className="w-3 h-3" /> Escrow
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-9 bg-gradient-primary text-primary-foreground font-semibold shadow-primary hover:opacity-95 text-xs">Buy now</Button>
                    <Button
                      variant="outline"
                      className="h-9 border-border bg-secondary/50 hover:bg-secondary font-semibold text-xs"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBid(l); }}
                    >
                      <Gavel className="w-3.5 h-3.5 mr-1" /> Bid
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">No listings match your filters. Try adjusting them.</p>
          </div>
        )}
      </div>

      <BidDialog open={!!bid} onClose={() => setBid(null)} listing={bid} />
    </section>
  );
}

function DesktopFilters({
  activePlatform,
  setActivePlatform,
  activePriceRange,
  setActivePriceRange,
}: {
  activePlatform: string;
  setActivePlatform: (v: string) => void;
  activePriceRange: number;
  setActivePriceRange: (v: number) => void;
}) {
  return (
    <aside className="bg-card border border-border rounded-2xl p-5 shadow-soft sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold">Filters</h3>
      </div>

      <div className="space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Platform</div>
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setActivePlatform(p)}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                  activePlatform === p
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Budget</div>
          <div className="flex flex-wrap gap-1.5">
            {priceRanges.map((r, i) => (
              <button
                key={r.label}
                onClick={() => setActivePriceRange(i)}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                  activePriceRange === i
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
