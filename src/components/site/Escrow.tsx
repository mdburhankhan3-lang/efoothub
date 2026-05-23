import { CheckCircle2, Lock, ShieldCheck, Wallet } from "lucide-react";

const steps = [
  { icon: Wallet, title: "Buyer pays into escrow", desc: "Funds held safely by admin, not the seller." },
  { icon: Lock, title: "Seller delivers", desc: "Account or coins are transferred to the buyer." },
  { icon: CheckCircle2, title: "Buyer confirms", desc: "After verification, the deal is approved." },
  { icon: ShieldCheck, title: "Seller paid", desc: "Funds released. 100% scam protection guarantee." },
];

export function Escrow() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-medium text-primary mb-2">SCAM-PROOF</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-6">
              Admin-Secured <span className="text-gradient">Escrow Deals</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-base md:text-lg">
              Every transaction is held by eFootHub admins until both parties confirm.
              Zero scams. Zero stress. Full refund if anything goes wrong.
            </p>

            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={s.title} className="flex gap-4 group">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform">
                      <s.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-primary/50 to-transparent" />
                    )}
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                      <h3 className="font-semibold">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass rounded-3xl p-6 md:p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">ESCROW #4821</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-success/20 text-success font-semibold">ACTIVE</span>
                </div>

                <div className="text-center py-6">
                  <div className="text-xs text-muted-foreground mb-2">Locked in Escrow</div>
                  <div className="font-display font-black text-5xl md:text-6xl text-gradient mb-1">৳12,500</div>
                  <div className="text-xs text-muted-foreground">Legendary Account · 110 OVR</div>
                </div>

                <div className="space-y-3 mt-6">
                  {[
                    { label: "Buyer payment received", done: true },
                    { label: "Account credentials transferred", done: true },
                    { label: "Buyer verification", done: false },
                    { label: "Funds released to seller", done: false },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                      <CheckCircle2 className={`w-5 h-5 ${step.done ? "text-success" : "text-muted-foreground/40"}`} />
                      <span className={`text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
