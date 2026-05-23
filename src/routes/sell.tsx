import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/site/BottomNav";
import { Header } from "@/components/site/Header";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell your eFootball ID — eFootHub" },
      { name: "description", content: "Create a listing to sell your eFootball ID, coins or packs safely with admin-secured escrow." },
    ],
  }),
  component: SellPage,
});

const PLATFORMS = ["Mobile", "PS5", "PS4", "Xbox", "PC"] as const;
const REGIONS = ["Bangladesh", "South Asia", "Asia", "Europe", "Americas", "Global"];

function SellPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    platform: "" as (typeof PLATFORMS)[number] | "",
    region: "",
  });

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!form.title.trim() || !form.price || !form.platform) {
      toast.error("Title, price and platform are required");
      return;
    }
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Enter a valid price");
      return;
    }

    setSubmitting(true);
    try {
      let images: string[] = [];
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("listing-images")
          .upload(path, imageFile, { upsert: false, contentType: imageFile.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("listing-images").getPublicUrl(path);
        images = [pub.publicUrl];
      }

      const desc = form.region
        ? `${form.description}\n\nRegion: ${form.region}`.trim()
        : form.description.trim();

      const { error } = await supabase.from("listings").insert({
        seller_id: user.id,
        title: form.title.trim(),
        description: desc || null,
        price: priceNum,
        platform: form.platform,
        category: "id",
        images,
      });
      if (error) throw error;
      toast.success("Listing created!");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Sell your ID</h1>
            <p className="text-sm text-muted-foreground">Create a listing in under a minute.</p>
          </div>
        </div>

        {!authLoading && !user && (
          <div className="rounded-xl border border-border bg-card p-4 mb-5 text-sm">
            You need to sign in before posting a listing.{" "}
            <Link to="/auth" className="text-primary font-semibold">Sign in →</Link>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="space-y-2">
            <Label>Player image</Label>
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-secondary/40">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                <ImagePlus className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tap to upload (JPG/PNG, max 5MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" maxLength={120} placeholder="e.g. Stacked Epic squad — 950k GP"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={4} maxLength={1000} placeholder="Top players, GP/coins balance, account level…"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price (BDT) *</Label>
              <Input id="price" type="number" min={1} inputMode="numeric" placeholder="5000"
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as any })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
              <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={submitting || !user}
            className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold shadow-primary">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : "Publish listing"}
          </Button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
