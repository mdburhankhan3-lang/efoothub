import { CheckCircle2, Lock, ShieldCheck, Wallet } from "lucide-react";

const steps = [
  { icon: Wallet, title: "Buyer pays into escrow", desc: "Funds held safely by admin, not the seller." },
  { icon: Lock, title: "Seller delivers", desc: "Account or coins transferred to the buyer." },
  { icon: CheckCircle2, title: "Buyer confirms", desc: "After verification, the deal is approved." },
  { icon: ShieldCheck, title: "Seller paid", desc: "Funds released. 100% scam protection." },
];

export function Escrow() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/15 text-success text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Scam-proof
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
              Admin-secured escrow on every deal
            </h2>
            <p className="text-muted-foreground mb-8 md:text-lg">
              Every payment is held by eFootHub admins until both parties confirm. Zero scams, full refund if anything goes wrong.
            </p>

            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={s.title} className="flex gap-3 items-start p-3 rounded-xl bg-card border border-border">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">0{i + 1}</span>
                      <h3 className="font-semibold text-sm">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">ESCROW #4821</span>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-md bg-success/15 text-success font-bold tracking-wider">ACTIVE</span>
            </div>

            <div className="text-center py-4 border-y border-border">
              <div className="text-xs text-muted-foreground mb-1">Locked in escrow</div>
              <div className="font-display font-bold text-4xl md:text-5xl">৳12,500</div>
              <div className="text-xs text-muted-foreground mt-1">Legendary Squad · 110 OVR</div>
            </div>

            <div className="space-y-2 mt-5">
              {[
                { label: "Buyer payment received", done: true },
                { label: "Account credentials transferred", done: true },
                { label: "Buyer verification (pending)", done: false },
                { label: "Funds released to seller", done: false },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <CheckCircle2 className={`w-5 h-5 ${step.done ? "text-success" : "text-muted-foreground/40"}`} />
                  <span className={`text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
