import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BadgeCheck, Eye, Gavel, Shield, Star, Clock, Tag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BidDialog } from "@/components/site/BidDialog";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { getListing } from "@/lib/marketplace.functions";
import { createEscrowDeal } from "@/lib/escrow.functions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/listing/$id")({
  head: () => ({
    meta: [
      { title: "Listing — eFootHub" },
      { name: "description", content: "View listing details on eFootHub." },
    ],
  }),
  component: ListingDetailPage,
});

const gradients = [
  "linear-gradient(135deg,#0ea5e9,#1e3a8a)",
  "linear-gradient(135deg,#f59e0b,#b45309)",
  "linear-gradient(135deg,#10b981,#065f46)",
  "linear-gradient(135deg,#3b82f6,#1e40af)",
  "linear-gradient(135deg,#ef4444,#991b1b)",
  "linear-gradient(135deg,#a855f7,#6b21a8)",
];

function ListingDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bidOpen, setBidOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [contact, setContact] = useState("");
  const fetchListing = useServerFn(getListing);
  const buyFn = useServerFn(createEscrowDeal);
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing({ data: { id } }),
  });

  const buy = useMutation({
    mutationFn: () => buyFn({ data: { listingId: id, buyerContact: contact.trim() } }),
    onSuccess: () => {
      toast.success("Escrow created — admin will confirm payment");
      setBuyOpen(false);
      navigate({ to: "/dashboard" });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-card rounded-2xl" />
            <div className="h-8 bg-card rounded w-3/4" />
            <div className="h-6 bg-card rounded w-1/2" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen pb-24 lg:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Listing not found</h1>
          <p className="text-muted-foreground mb-6">This listing may have been removed or doesn't exist.</p>
          <Link to="/"><Button>Go home</Button></Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const seller = Array.isArray(listing.seller) ? listing.seller[0] : listing.seller;
  const isOwn = user?.id === seller?.id;
  const price = (listing.currency === "BDT" ? "৳" : listing.currency + " ") + Number(listing.price).toLocaleString();
  const oldPrice = listing.old_price ? (listing.currency === "BDT" ? "৳" : listing.currency + " ") + Number(listing.old_price).toLocaleString() : null;
  const heroGradient = gradients[Math.abs(hashCode(listing.id)) % gradients.length];
  const image = listing.images?.[0];
  const created = new Date(listing.created_at);
  const timeAgo = getTimeAgo(created);

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Left: image + details */}
          <div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-soft mb-5">
              {image ? (
                <img src={image} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0" style={{ background: heroGradient }} />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Tag className="w-12 h-12 text-white/30 mx-auto mb-2" />
                      <div className="text-xs text-white/40 tracking-widest uppercase">No image</div>
                    </div>
                  </div>
                </>
              )}
              <div className="absolute top-3 right-3 flex gap-1.5">
                <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-0">
                  {listing.platform}
                </Badge>
                {listing.rank && (
                  <Badge className="bg-primary/90 text-primary-foreground border-0">
                    {listing.rank}
                  </Badge>
                )}
              </div>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">{listing.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {listing.views ?? 0} views</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {timeAgo}</span>
              <Badge variant="outline" className="text-xs capitalize">{listing.category}</Badge>
            </div>

            {listing.description && (
              <div className="bg-card border border-border rounded-xl p-5 mb-5">
                <h3 className="font-semibold mb-2 text-sm">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Seller card - mobile only (desktop shows sidebar) */}
            <div className="lg:hidden bg-card border border-border rounded-xl p-4 mb-5">
              <SellerInfo seller={seller} />
            </div>

            {/* Escrow badge */}
            <div className="flex items-center gap-2 p-4 rounded-xl bg-success/10 border border-success/20 mb-5">
              <Shield className="w-5 h-5 text-success shrink-0" />
              <div>
                <div className="text-sm font-semibold text-success">Escrow protected</div>
                <div className="text-xs text-muted-foreground">Funds held safely until you confirm delivery.</div>
              </div>
            </div>
          </div>

          {/* Right sidebar: price + actions + seller */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-soft sticky top-20">
              <div className="mb-4">
                {oldPrice && <div className="text-sm text-muted-foreground line-through mb-0.5">{oldPrice}</div>}
                <div className="font-display font-bold text-3xl">{price}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  className="h-12 bg-gradient-primary text-primary-foreground font-semibold shadow-primary"
                  disabled={isOwn || listing.status !== "active"}
                >
                  Buy now
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-border bg-secondary/50 hover:bg-secondary font-semibold"
                  onClick={() => setBidOpen(true)}
                  disabled={isOwn || listing.status !== "active"}
                >
                  <Gavel className="w-4 h-4 mr-1.5" /> Place bid
                </Button>
              </div>

              {isOwn && (
                <p className="text-xs text-muted-foreground text-center mb-3">This is your listing</p>
              )}

              {listing.status !== "active" && !isOwn && (
                <p className="text-xs text-destructive text-center mb-3">This listing is {listing.status}</p>
              )}

              <div className="border-t border-border pt-4 hidden lg:block">
                <SellerInfo seller={seller} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <BidDialog
        open={bidOpen}
        onClose={() => setBidOpen(false)}
        listing={{ id: listing.id, title: listing.title, price }}
      />
      <BottomNav />
    </div>
  );
}

function SellerInfo({ seller }: { seller: any }) {
  if (!seller) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg shrink-0">
        {(seller.display_name ?? seller.username ?? "S")[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm truncate">{seller.display_name ?? seller.username ?? "Seller"}</span>
          {seller.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {Number(seller.rating ?? 0).toFixed(1)}</span>
          <span>{seller.total_sales ?? 0} sales</span>
          {seller.country && <span>· {seller.country}</span>}
        </div>
      </div>
    </div>
  );
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
