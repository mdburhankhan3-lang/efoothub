import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BadgeCheck, CircleCheck as CheckCircle2, Clock, Eye, Gavel, Loader as Loader2, Package, Pause, Play, ShoppingBag, Star, Circle as XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  getSellerListings,
  getSellerBids,
  updateBidStatus,
  updateListingStatus,
  getMyBids,
} from "@/lib/marketplace.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — eFootHub" },
      { name: "description", content: "Manage your listings and bids on eFootHub." },
    ],
  }),
  component: DashboardPage,
});

function fmt(n: number, c = "BDT") {
  return (c === "BDT" ? "৳" : c + " ") + Number(n).toLocaleString();
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-24 lg:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-lg text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Sign in required</h1>
          <p className="text-sm text-muted-foreground mb-6">You need an account to access the dashboard.</p>
          <Link to="/auth">
            <Button className="bg-gradient-primary text-primary-foreground font-semibold shadow-primary">Sign in</Button>
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your listings and bids</p>
          </div>
        </div>

        <Tabs defaultValue="listings" className="space-y-5">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="listings" className="gap-1.5">
              <Package className="w-4 h-4" /> My Listings
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-1.5">
              <Gavel className="w-4 h-4" /> Incoming Bids
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-1.5">
              <ShoppingBag className="w-4 h-4" /> My Bids
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <MyListings />
          </TabsContent>
          <TabsContent value="incoming">
            <IncomingBids />
          </TabsContent>
          <TabsContent value="outgoing">
            <MyBidsTab />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

function MyListings() {
  const fetchFn = useServerFn(getSellerListings);
  const { data: listings, isLoading } = useQuery({
    queryKey: ["seller-listings"],
    queryFn: () => fetchFn(),
  });
  const updateFn = useServerFn(updateListingStatus);
  const qc = useQueryClient();

  const toggleStatus = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: string; status: "active" | "paused" | "sold" }) => {
      return updateFn({ data: { listingId, status } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-listings"] });
      toast.success("Listing updated");
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to update"),
  });

  if (isLoading) {
    return <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>;
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-2xl">
        <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">No listings yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Create your first listing to start selling.</p>
        <Link to="/sell"><Button className="bg-gradient-primary text-primary-foreground font-semibold">Create listing</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((l: any) => {
        const statusColors: Record<string, string> = {
          active: "bg-success/15 text-success",
          paused: "bg-amber-500/15 text-amber-400",
          sold: "bg-muted text-muted-foreground",
          pending: "bg-primary/15 text-primary",
        };
        return (
          <div key={l.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary/40">
              {l.images?.[0] ? (
                <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link to="/listing/$id" params={{ id: l.id }} className="font-semibold text-sm truncate hover:text-primary transition-colors">
                  {l.title}
                </Link>
                <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${statusColors[l.status] ?? statusColors.pending}`}>
                  {l.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-display font-bold text-base text-foreground">{fmt(l.price, l.currency)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.views ?? 0}</span>
                <Badge variant="outline" className="text-[10px]">{l.platform}</Badge>
              </div>
            </div>
            <div className="shrink-0 flex gap-1.5">
              {l.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => toggleStatus.mutate({ listingId: l.id, status: "paused" })}
                  disabled={toggleStatus.isPending}
                >
                  <Pause className="w-3 h-3 mr-1" /> Pause
                </Button>
              )}
              {l.status === "paused" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => toggleStatus.mutate({ listingId: l.id, status: "active" })}
                  disabled={toggleStatus.isPending}
                >
                  <Play className="w-3 h-3 mr-1" /> Resume
                </Button>
              )}
              {l.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => toggleStatus.mutate({ listingId: l.id, status: "sold" })}
                  disabled={toggleStatus.isPending}
                >
                  Mark sold
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncomingBids() {
  const fetchFn = useServerFn(getSellerBids);
  const { data: bids, isLoading } = useQuery({
    queryKey: ["seller-bids"],
    queryFn: () => fetchFn(),
  });
  const updateFn = useServerFn(updateBidStatus);
  const qc = useQueryClient();

  const respond = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: string; status: "accepted" | "declined" }) => {
      return updateFn({ data: { bidId, status } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-bids"] });
      toast.success("Bid updated");
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to update bid"),
  });

  if (isLoading) {
    return <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}</div>;
  }

  if (!bids?.length) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-2xl">
        <Gavel className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">No incoming bids</h3>
        <p className="text-sm text-muted-foreground">When buyers place bids on your listings, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((b: any) => {
        const listing = Array.isArray(b.listings) ? b.listings[0] : b.listings;
        const bidder = Array.isArray(b.bidder) ? b.bidder[0] : b.bidder;
        const statusColors: Record<string, string> = {
          pending: "bg-primary/15 text-primary",
          accepted: "bg-success/15 text-success",
          declined: "bg-destructive/15 text-destructive",
          withdrawn: "bg-muted text-muted-foreground",
        };
        const isPending = b.status === "pending";
        return (
          <div key={b.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold shrink-0">
                {(bidder?.display_name ?? bidder?.username ?? "B")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{bidder?.display_name ?? bidder?.username ?? "Buyer"}</span>
                  {bidder?.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                  <span className={`ml-auto shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${statusColors[b.status] ?? statusColors.pending}`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  on <Link to="/listing/$id" params={{ id: b.listing_id }} className="hover:text-primary transition-colors">{listing?.title ?? "Listing"}</Link>
                  <span className="mx-1">·</span>
                  <Clock className="w-3 h-3 inline -mt-0.5" /> {getTimeAgo(new Date(b.created_at))}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display font-bold text-lg">{fmt(b.amount, listing?.currency)}</span>
                  <span className="text-xs text-muted-foreground">asking {fmt(listing?.price, listing?.currency)}</span>
                </div>
                {b.message && (
                  <p className="text-sm text-muted-foreground bg-secondary/40 rounded-lg p-2.5 mb-2">"{b.message}"</p>
                )}
                {b.contact && (
                  <div className="text-xs mb-3 flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-2.5 py-2">
                    <span className="font-semibold">Contact:</span>
                    <span className="font-mono break-all">{b.contact}</span>
                  </div>
                )}
                {isPending && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 bg-success/90 hover:bg-success text-success-foreground text-xs"
                      onClick={() => respond.mutate({ bidId: b.id, status: "accepted" })}
                      disabled={respond.isPending}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => respond.mutate({ bidId: b.id, status: "declined" })}
                      disabled={respond.isPending}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MyBidsTab() {
  const fetchFn = useServerFn(getMyBids);
  const { data: bids, isLoading } = useQuery({
    queryKey: ["my-bids"],
    queryFn: () => fetchFn(),
  });

  if (isLoading) {
    return <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>;
  }

  if (!bids?.length) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-2xl">
        <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">No bids placed</h3>
        <p className="text-sm text-muted-foreground">Browse listings and place private bids to get the best deals.</p>
        <Link to="/"><Button variant="outline" className="mt-4">Browse marketplace</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((b: any) => {
        const listing = Array.isArray(b.listings) ? b.listings[0] : b.listings;
        const statusColors: Record<string, string> = {
          pending: "bg-primary/15 text-primary",
          accepted: "bg-success/15 text-success",
          declined: "bg-destructive/15 text-destructive",
          withdrawn: "bg-muted text-muted-foreground",
        };
        const statusIcons: Record<string, any> = {
          pending: Clock,
          accepted: CheckCircle2,
          declined: XCircle,
          withdrawn: XCircle,
        };
        const Icon = statusIcons[b.status] ?? Clock;
        return (
          <div key={b.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-secondary/40">
              {listing?.images?.[0] ? (
                <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link to="/listing/$id" params={{ id: b.listing_id }} className="font-semibold text-sm truncate hover:text-primary transition-colors block">
                {listing?.title ?? "Listing"}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Your bid: <span className="font-display font-bold text-base text-foreground">{fmt(b.amount, listing?.currency)}</span></span>
                <span>· asking {fmt(listing?.price, listing?.currency)}</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${statusColors[b.status] ?? statusColors.pending}`}>
                <Icon className="w-3 h-3" /> {b.status.toUpperCase()}
              </span>
              <div className="text-[10px] text-muted-foreground mt-1">{getTimeAgo(new Date(b.created_at))}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
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
