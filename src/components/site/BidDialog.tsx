import { Lock, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  listing?: { title: string; price: string } | null;
};

export function BidDialog({ open, onClose, listing }: Props) {
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-2xl p-6 shadow-soft animate-fade-up">
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold mb-3">
              <Lock className="w-3 h-3" /> Private bid
            </div>
            <h3 className="font-display text-xl font-bold mb-1">Place your bid</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {listing?.title || "Listing"} · Asking <span className="text-foreground font-medium">{listing?.price}</span>
            </p>

            <label className="block text-xs font-medium text-muted-foreground mb-2">Your offer (BDT)</label>
            <div className="flex items-center gap-2 bg-input border border-border rounded-xl px-4 h-12 mb-4">
              <span className="text-muted-foreground text-sm">৳</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="Enter amount"
                className="flex-1 bg-transparent outline-none text-base font-medium"
              />
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground mb-5 p-3 rounded-xl bg-secondary/50">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <span>Only the seller sees your offer. Other buyers cannot view your bid amount.</span>
            </div>

            <Button
              disabled={!amount}
              onClick={() => setSubmitted(true)}
              className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold shadow-primary disabled:opacity-50"
            >
              Submit private bid
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7 text-success" />
            </div>
            <h3 className="font-display text-xl font-bold mb-1">Bid sent privately</h3>
            <p className="text-sm text-muted-foreground mb-5">The seller has been notified. You'll get a message if they accept.</p>
            <Button onClick={onClose} className="w-full h-11 bg-secondary hover:bg-secondary/80">Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}
