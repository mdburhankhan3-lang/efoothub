import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, ShieldAlert, Check, X, Trash2, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import {
  isAdmin,
  adminListAll,
  adminSetListingStatus,
  adminDeleteListing,
  adminToggleRole,
  adminUpdateEscrow,
  adminUpdateBidStatus,
  adminUpsertTournament,
  adminDeleteTournament,
} from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — eFootHub" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const checkAdmin = useServerFn(isAdmin);
  const { data: adminCheck, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });

  if (loading || (user && checkingAdmin)) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-24"><Header />
        <main className="container mx-auto px-4 py-12 text-center max-w-md">
          <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h1 className="font-display text-xl font-bold mb-2">Admin sign in required</h1>
          <Link to="/auth"><Button>Sign in</Button></Link>
        </main><BottomNav /></div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen pb-24"><Header />
        <main className="container mx-auto px-4 py-12 text-center max-w-md">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-3" />
          <h1 className="font-display text-xl font-bold mb-2">Access denied</h1>
          <p className="text-sm text-muted-foreground mb-4">Your account does not have admin privileges.</p>
          <Link to="/"><Button variant="outline">Go home</Button></Link>
        </main><BottomNav /></div>
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const fetchAll = useServerFn(adminListAll);
  const { data, isLoading } = useQuery({ queryKey: ["admin-all"], queryFn: () => fetchAll() });

  if (isLoading || !data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Full marketplace management</p>
          </div>
        </div>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList className="bg-secondary/60 w-full grid grid-cols-5 h-auto p-1">
            <TabsTrigger value="listings" className="text-xs">Listings</TabsTrigger>
            <TabsTrigger value="bids" className="text-xs">Bids</TabsTrigger>
            <TabsTrigger value="escrow" className="text-xs">Escrow</TabsTrigger>
            <TabsTrigger value="tournaments" className="text-xs">Tournaments</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="listings"><ListingsAdmin items={data.listings} /></TabsContent>
          <TabsContent value="bids"><BidsAdmin items={data.bids} /></TabsContent>
          <TabsContent value="escrow"><EscrowAdmin items={data.escrows} /></TabsContent>
          <TabsContent value="tournaments"><TournamentsAdmin items={data.tournaments} /></TabsContent>
          <TabsContent value="users"><UsersAdmin users={data.users} roles={data.roles} /></TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

function ListingsAdmin({ items }: { items: any[] }) {
  const setStatusFn = useServerFn(adminSetListingStatus);
  const delFn = useServerFn(adminDeleteListing);
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-all"] });

  const setStatus = useMutation({
    mutationFn: (v: any) => setStatusFn({ data: v }),
    onSuccess: () => { refresh(); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { listingId: id } }),
    onSuccess: () => { refresh(); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-2">
      {items.map((l) => (
        <div key={l.id} className="bg-card border border-border rounded-lg p-3 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{l.title}</div>
            <div className="text-xs text-muted-foreground flex gap-2 flex-wrap mt-1">
              <span>৳{Number(l.price).toLocaleString()}</span>
              <Badge variant="outline" className="text-[10px]">{l.platform}</Badge>
              <Badge className="text-[10px]">{l.status}</Badge>
              <Badge variant="outline" className="text-[10px]">{l.admin_status}</Badge>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ listingId: l.id, adminStatus: "approved" })}>
              <Check className="w-3 h-3 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ listingId: l.id, adminStatus: "rejected", status: "paused" })}>
              <X className="w-3 h-3 mr-1" /> Reject
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => confirm("Delete this listing?") && del.mutate(l.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
      {!items.length && <div className="text-center text-muted-foreground py-8">No listings</div>}
    </div>
  );
}

function BidsAdmin({ items }: { items: any[] }) {
  const updFn = useServerFn(adminUpdateBidStatus);
  const qc = useQueryClient();
  const upd = useMutation({
    mutationFn: (v: any) => updFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all"] }); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="space-y-2">
      {items.map((b) => (
        <div key={b.id} className="bg-card border border-border rounded-lg p-3 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <span className="font-semibold">৳{Number(b.amount).toLocaleString()}</span> on{" "}
              <span className="text-muted-foreground">{b.listings?.title ?? b.listing_id}</span>
            </div>
            <div className="text-xs text-muted-foreground"><Badge>{b.status}</Badge> · {new Date(b.created_at).toLocaleString()}</div>
          </div>
          <Select value={b.status} onValueChange={(v) => upd.mutate({ bidId: b.id, status: v })}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
      {!items.length && <div className="text-center text-muted-foreground py-8">No bids</div>}
    </div>
  );
}

function EscrowAdmin({ items }: { items: any[] }) {
  const updFn = useServerFn(adminUpdateEscrow);
  const qc = useQueryClient();
  const [noteFor, setNoteFor] = useState<any | null>(null);
  const [note, setNote] = useState("");

  const upd = useMutation({
    mutationFn: (v: any) => updFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all"] }); toast.success("Escrow updated"); setNoteFor(null); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-2">
      {items.map((e) => (
        <div key={e.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-sm">{e.listings?.title ?? e.listing_id}</span>
            <Badge>{e.status}</Badge>
            <span className="text-sm">৳{Number(e.amount).toLocaleString()}</span>
            <span className="text-xs text-muted-foreground ml-auto">{new Date(e.created_at).toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground grid sm:grid-cols-2 gap-1">
            <div>Buyer contact: <span className="text-foreground">{e.buyer_contact ?? "—"}</span></div>
            <div>Buyer: {e.buyer_id.slice(0, 8)} · Seller: {e.seller_id.slice(0, 8)}</div>
            {e.account_details && <div className="sm:col-span-2">Account details: <code className="text-foreground bg-secondary/40 px-1 rounded">{e.account_details}</code></div>}
            {e.admin_note && <div className="sm:col-span-2">Note: {e.admin_note}</div>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["paid", "verified", "released", "refunded", "disputed"].map((s) => (
              <Button key={s} size="sm" variant="outline" className="h-8 text-xs"
                onClick={() => { setNoteFor({ ...e, nextStatus: s }); setNote(e.admin_note ?? ""); }}>
                Mark {s}
              </Button>
            ))}
          </div>
        </div>
      ))}
      {!items.length && <div className="text-center text-muted-foreground py-8">No escrow deals</div>}

      <Dialog open={!!noteFor} onOpenChange={(o) => !o && setNoteFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as {noteFor?.nextStatus}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Admin note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteFor(null)}>Cancel</Button>
            <Button onClick={() => upd.mutate({ dealId: noteFor.id, status: noteFor.nextStatus, adminNote: note || undefined })}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersAdmin({ users, roles }: { users: any[]; roles: any[] }) {
  const toggleFn = useServerFn(adminToggleRole);
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: (v: any) => toggleFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all"] }); toast.success("Role updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="space-y-2">
      {users.map((u) => {
        const isAdminUser = u.role === "admin";
        return (
          <div key={u.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold">
              {(u.display_name ?? u.username ?? "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{u.display_name ?? u.username}</div>
              <div className="text-xs text-muted-foreground truncate">@{u.username} · {u.total_sales ?? 0} sales</div>
            </div>
            {isAdminUser && <Badge>Admin</Badge>}
            <Button size="sm" variant="outline"
              onClick={() => toggle.mutate({ userId: u.id, role: "admin", grant: !isAdminUser })}>
              {isAdminUser ? "Remove admin" : "Make admin"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function TournamentsAdmin({ items }: { items: any[] }) {
  const upsertFn = useServerFn(adminUpsertTournament);
  const delFn = useServerFn(adminDeleteTournament);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      <Button onClick={() => setEditing({})} className="bg-gradient-primary text-primary-foreground">
        <Plus className="w-4 h-4 mr-1" /> New tournament
      </Button>
      {items.map((t) => (
        <div key={t.id} className="bg-card border border-border rounded-lg p-3 flex flex-wrap gap-3 items-center">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{t.title}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(t.start_time).toLocaleString()} · {t.current_players}/{t.max_players} · {t.prize_pool} prize · <Badge className="text-[10px]">{t.status}</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(t)}>Edit</Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => confirm("Delete tournament?") && del.mutate(t.id)}><Trash2 className="w-3 h-3" /></Button>
        </div>
      ))}

      <TournamentForm
        open={!!editing}
        onClose={() => setEditing(null)}
        initial={editing}
        onSave={async (payload) => { await upsertFn({ data: payload }); qc.invalidateQueries({ queryKey: ["admin-all"] }); toast.success("Saved"); setEditing(null); }}
      />
    </div>
  );
}

function TournamentForm({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial: any; onSave: (p: any) => Promise<void> }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [prize, setPrize] = useState(String(initial?.prize_pool ?? 0));
  const [fee, setFee] = useState(String(initial?.entry_fee ?? 0));
  const [maxP, setMaxP] = useState(String(initial?.max_players ?? 32));
  const [start, setStart] = useState(initial?.start_time ? new Date(initial.start_time).toISOString().slice(0, 16) : "");
  const [status, setStatus] = useState(initial?.status ?? "upcoming");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()} key={initial?.id ?? "new"}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{initial?.id ? "Edit" : "New"} tournament</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Prize pool</Label><Input type="number" value={prize} onChange={(e) => setPrize(e.target.value)} /></div>
            <div><Label>Entry fee</Label><Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} /></div>
            <div><Label>Max players</Label><Input type="number" value={maxP} onChange={(e) => setMaxP(e.target.value)} /></div>
            <div><Label>Start time</Label><Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          </div>
          <div><Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["upcoming", "live", "completed", "cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({
            id: initial?.id,
            title, description: description || undefined,
            prize_pool: Number(prize), entry_fee: Number(fee), max_players: Number(maxP),
            start_time: new Date(start).toISOString(), status,
          })}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
