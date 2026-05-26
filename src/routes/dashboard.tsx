import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BadgeCheck,
  CircleCheck as CheckCircle2,
  Clock,
  Eye,
  Gavel,
  Handshake,
  Loader as Loader2,
  Package,
  Pause,
  Pencil,
  Play,
  Trash2,
  Trophy,
  Circle as XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  getSellerListings,
  getSellerBids,
  updateBidStatus,
  updateListingStatus,
  deleteListing,
  updateListing,
} from "@/lib/marketplace.functions";
import { getMyEscrowDeals, submitAccountDetails } from "@/lib/escrow.functions";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard — eFootHub" },
      { name: "description", content: "Manage your listings, bids, and deals on eFootHub." },
    ],
  }),
  component: DashboardPage,
});

function fmt(n: number, c = "BDT") {
  return (c === "BDT" ? "৳" : c + " ") + Number(n).toLocaleString();
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
          <p className="text-sm text-muted-foreground mb-6">You need an account to access your seller dashboard.</p>
          <Link to="/auth">
            <Button className="bg-gradient-primary text-primary-foreground font-semibold shadow-primary">Sign in</Button>
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const fetchListings = useServerFn(getSellerListings);
  const fetchBids = useServerFn(getSellerBids);

  const listingsQ = useQuery({ queryKey: ["seller-listings"], queryFn: () => fetchListings() });
  const bidsQ = useQuery({ queryKey: ["seller-bids"], queryFn: () => fetchBids() });

  const listings = listingsQ.data ?? [];
  const bids = bidsQ.data ?? [];

  const stats = useMemo(() => {
    const active = listings.filter((l: any) => l.status === "active").length;
    const sold = listings.filter((l: any) => l.status === "sold").length;
    const pendingBids = bids.filter((b: any) => b.status === "pending").length;
    const accepted = bids.filter((b: any) => b.status === "accepted").length;
    return { active, sold, pendingBids, accepted };
  }, [listings, bids]);

  const activeBids = bids.filter((b: any) => b.status === "pending");
  const acceptedBids = bids.filter((b: any) => b.status === "accepted");
  const soldListings = listings.filter((l: any) => l.status === "sold");

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold leading-tight">Seller Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage listings, bids and deals</p>
          </div>
          <Link to="/sell" className="shrink-0">
            <Button size="sm" className="bg-gradient-primary text-primary-foreground font-semibold shadow-primary">
              + New
            </Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <StatCard icon={Package} label="Active" value={stats.active} tint="text-success" />
          <StatCard icon={Gavel} label="Bids" value={stats.pendingBids} tint="text-primary" />
          <StatCard icon={Handshake} label="Accepted" value={stats.accepted} tint="text-amber-400" />
          <StatCard icon={Trophy} label="Sold" value={stats.sold} tint="text-muted-foreground" />
        </div>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList className="bg-secondary/60 w-full grid grid-cols-5 h-auto p-1">
            <TabsTrigger value="listings" className="flex-col gap-0.5 py-2 text-[11px] sm:text-xs sm:flex-row sm:gap-1.5">
              <Package className="w-4 h-4" />
              <span>Listings</span>
            </TabsTrigger>
            <TabsTrigger value="active-bids" className="flex-col gap-0.5 py-2 text-[11px] sm:text-xs sm:flex-row sm:gap-1.5">
              <Gavel className="w-4 h-4" />
              <span>Bids</span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex-col gap-0.5 py-2 text-[11px] sm:text-xs sm:flex-row sm:gap-1.5">
              <Handshake className="w-4 h-4" />
              <span>Deals</span>
            </TabsTrigger>
            <TabsTrigger value="escrow" className="flex-col gap-0.5 py-2 text-[11px] sm:text-xs sm:flex-row sm:gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Escrow</span>
            </TabsTrigger>
            <TabsTrigger value="sold" className="flex-col gap-0.5 py-2 text-[11px] sm:text-xs sm:flex-row sm:gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>Sold</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <MyListings listings={listings} isLoading={listingsQ.isLoading} />
          </TabsContent>
          <TabsContent value="active-bids">
            <BidsList bids={activeBids} isLoading={bidsQ.isLoading} variant="active" />
          </TabsContent>
          <TabsContent value="accepted">
            <BidsList bids={acceptedBids} isLoading={bidsQ.isLoading} variant="accepted" />
          </TabsContent>
          <TabsContent value="escrow">
            <EscrowList />
          </TabsContent>
          <TabsContent value="sold">
            <SoldListings listings={soldListings} isLoading={listingsQ.isLoading} />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: any; label: string; value: number; tint: string }) {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
        <Icon className={`w-3.5 h-3.5 ${tint}`} />
        {label}
      </div>
      <div className="font-display text-2xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function MyListings({ listings, isLoading }: { listings: any[]; isLoading: boolean }) {
  const updateStatusFn = useServerFn(updateListingStatus);
  const deleteFn = useServerFn(deleteListing);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);

  const toggleStatus = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: string; status: "active" | "paused" | "sold" }) =>
      updateStatusFn({ data: { listingId, status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-listings"] });
      toast.success("Listing updated");
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to update"),
  });

  const removeListing = useMutation({
    mutationFn: async (listingId: string) => deleteFn({ data: { listingId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-listings"] });
      qc.invalidateQueries({ queryKey: ["seller-bids"] });
      toast.success("Listing deleted");
      setDeleting(null);
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to delete"),
  });

  if (isLoading) {
    return <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}</div>;
  }

  if (!listings.length) {
    return (
      <EmptyState
        icon={Package}
        title="No listings yet"
        body="Create your first listing to start selling."
        cta={<Link to="/sell"><Button className="bg-gradient-primary text-primary-foreground font-semibold">Create listing</Button></Link>}
      />
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-success/15 text-success",
    paused: "bg-amber-500/15 text-amber-400",
    sold: "bg-muted text-muted-foreground",
    pending: "bg-primary/15 text-primary",
  };

  return (
    <>
      <div className="space-y-3">
        {listings.map((l) => (
          <div key={l.id} className="bg-card border border-border rounded-xl p-3 sm:p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-secondary/40">
                {l.images?.[0] ? (
                  <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <Link to="/listing/$id" params={{ id: l.id }} className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
                    {l.title}
                  </Link>
                  <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${statusColors[l.status] ?? statusColors.pending}`}>
                    {l.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                  <span className="font-display font-bold text-base text-foreground">{fmt(l.price, l.currency)}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.views ?? 0}</span>
                  <Badge variant="outline" className="text-[10px]">{l.platform}</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(l)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
              {l.status === "active" && (
                <Button variant="outline" size="sm" className="h-8 text-xs"
                  onClick={() => toggleStatus.mutate({ listingId: l.id, status: "paused" })}
                  disabled={toggleStatus.isPending}>
                  <Pause className="w-3 h-3 mr-1" /> Pause
                </Button>
              )}
              {l.status === "paused" && (
                <Button variant="outline" size="sm" className="h-8 text-xs"
                  onClick={() => toggleStatus.mutate({ listingId: l.id, status: "active" })}
                  disabled={toggleStatus.isPending}>
                  <Play className="w-3 h-3 mr-1" /> Resume
                </Button>
              )}
              {l.status !== "sold" && (
                <Button variant="outline" size="sm" className="h-8 text-xs"
                  onClick={() => toggleStatus.mutate({ listingId: l.id, status: "sold" })}
                  disabled={toggleStatus.isPending}>
                  <Trophy className="w-3 h-3 mr-1" /> Mark sold
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10 ml-auto"
                onClick={() => setDeleting(l)}>
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <EditListingDialog listing={editing} onClose={() => setEditing(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" will be permanently removed along with its bids. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); deleting && removeListing.mutate(deleting.id); }}
              disabled={removeListing.isPending}
            >
              {removeListing.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EditListingDialog({ listing, onClose }: { listing: any | null; onClose: () => void }) {
  const updateFn = useServerFn(updateListing);
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState<string>("Mobile");
  const [rank, setRank] = useState("");

  // Sync form when listing changes
  useMemo(() => {
    if (listing) {
      setTitle(listing.title ?? "");
      setPrice(String(listing.price ?? ""));
      setPlatform(listing.platform ?? "Mobile");
      setRank(listing.rank ?? "");
    }
  }, [listing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!listing) return;
      const priceNum = Number(price);
      if (!title.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
        throw new Error("Title and a valid price are required");
      }
      return updateFn({
        data: {
          listingId: listing.id,
          title: title.trim(),
          price: priceNum,
          platform: platform as any,
          rank: rank.trim() || undefined,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-listings"] });
      toast.success("Listing saved");
      onClose();
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to save"),
  });

  return (
    <Dialog open={!!listing} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit listing</DialogTitle>
          <DialogDescription>Update the details for this listing.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Price</label>
              <Input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Mobile", "PS5", "PS4", "Xbox", "PC"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Rank (optional)</label>
            <Input value={rank} onChange={(e) => setRank(e.target.value)} maxLength={60} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-gradient-primary text-primary-foreground font-semibold"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BidsList({ bids, isLoading, variant }: { bids: any[]; isLoading: boolean; variant: "active" | "accepted" }) {
  const updateFn = useServerFn(updateBidStatus);
  const qc = useQueryClient();

  const respond = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: string; status: "accepted" | "declined" }) =>
      updateFn({ data: { bidId, status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-bids"] });
      toast.success("Bid updated");
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to update bid"),
  });

  if (isLoading) {
    return <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}</div>;
  }

  if (!bids.length) {
    return variant === "active" ? (
      <EmptyState icon={Gavel} title="No active bids" body="When buyers place bids on your listings, they'll appear here." />
    ) : (
      <EmptyState icon={Handshake} title="No accepted deals yet" body="Accept a bid to see buyer contact details here." />
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-primary/15 text-primary",
    accepted: "bg-success/15 text-success",
    declined: "bg-destructive/15 text-destructive",
    withdrawn: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-3">
      {bids.map((b) => {
        const listing = Array.isArray(b.listings) ? b.listings[0] : b.listings;
        const bidder = Array.isArray(b.bidder) ? b.bidder[0] : b.bidder;
        return (
          <div key={b.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold shrink-0">
                {(bidder?.display_name ?? bidder?.username ?? "B")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-display font-bold text-lg">{fmt(b.amount, listing?.currency)}</span>
                  {listing?.price && <span className="text-xs text-muted-foreground">asking {fmt(listing.price, listing.currency)}</span>}
                </div>
                {b.message && (
                  <p className="text-sm text-muted-foreground bg-secondary/40 rounded-lg p-2.5 mb-2">"{b.message}"</p>
                )}
                {variant === "accepted" && b.contact ? (
                  <div className="text-xs mb-1 flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-2.5 py-2">
                    <span className="font-semibold shrink-0">Buyer contact:</span>
                    <a href={`https://wa.me/${String(b.contact).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="font-mono break-all underline-offset-2 hover:underline">
                      {b.contact}
                    </a>
                  </div>
                ) : variant === "accepted" ? (
                  <div className="text-xs text-muted-foreground italic">Buyer did not share contact info.</div>
                ) : null}
                {variant === "active" && (
                  <div className="flex gap-2 mt-2">
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

function SoldListings({ listings, isLoading }: { listings: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="grid gap-3">{[0, 1].map((i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>;
  }
  if (!listings.length) {
    return <EmptyState icon={Trophy} title="No sales yet" body="Listings you mark as sold will appear here." />;
  }
  return (
    <div className="space-y-3">
      {listings.map((l) => (
        <div key={l.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-secondary/40">
            {l.images?.[0] ? (
              <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link to="/listing/$id" params={{ id: l.id }} className="font-semibold text-sm truncate hover:text-primary transition-colors block">
              {l.title}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="font-display font-bold text-base text-foreground">{fmt(l.price, l.currency)}</span>
              <Badge variant="outline" className="text-[10px]">{l.platform}</Badge>
            </div>
          </div>
          <Badge className="bg-success/15 text-success border-0 shrink-0">SOLD</Badge>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, cta }: { icon: any; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="text-center py-12 bg-card border border-border rounded-2xl px-4">
      <Icon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{body}</p>
      {cta}
    </div>
  );
}
