import { MessageCircle, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Community() {
  return (
    <section id="community" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-card border border-border rounded-3xl overflow-hidden p-8 md:p-16">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-medium text-primary mb-2">JOIN THE SQUAD</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4">
                50,000+ players. <span className="text-gradient">One community.</span>
              </h2>
              <p className="text-muted-foreground mb-6 md:text-lg">
                Trade tips, scout deals, and connect with the biggest eFootball community in Bangladesh.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-neon text-primary-foreground font-semibold shadow-neon">
                  <Send className="w-4 h-4 mr-2" /> Telegram
                </Button>
                <Button variant="outline" className="border-border">
                  <MessageCircle className="w-4 h-4 mr-2" /> Discord
                </Button>
                <Button variant="outline" className="border-border">
                  <Users className="w-4 h-4 mr-2" /> Facebook
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "50K+", l: "Members" },
                { v: "12K", l: "Daily active" },
                { v: "৳2Cr+", l: "Volume traded" },
                { v: "98%", l: "Positive reviews" },
              ].map((s) => (
                <div key={s.l} className="glass rounded-2xl p-5 text-center">
                  <div className="font-display font-black text-3xl text-gradient">{s.v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
