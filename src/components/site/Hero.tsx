import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Trusted by 50,000+ eFootball players</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            The Premium Marketplace for
            <span className="block text-gradient mt-2">eFootball Players</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Buy and sell eFootball accounts, coins, and packs with admin-secured escrow.
            Built for Bangladesh, trusted worldwide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="w-full sm:w-auto bg-gradient-neon hover:opacity-90 text-primary-foreground font-semibold shadow-neon h-12 px-8 group">
              Browse Marketplace
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 border-border hover:bg-secondary">
              Start Selling
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Users, value: "50K+", label: "Active Users" },
              { icon: Shield, value: "100%", label: "Escrow Secured" },
              { icon: TrendingUp, value: "৳2Cr+", label: "Volume Traded" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 md:p-5">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-display font-bold text-xl md:text-2xl">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
