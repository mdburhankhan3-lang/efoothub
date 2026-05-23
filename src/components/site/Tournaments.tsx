import { Calendar, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const tournaments = [
  { title: "BD Champions Cup", prize: "৳50,000", players: 128, slots: 32, date: "Sat, 8 PM", tag: "LIVE", tagClass: "bg-destructive text-destructive-foreground" },
  { title: "Weekend Warriors", prize: "৳15,000", players: 64, slots: 12, date: "Sun, 6 PM", tag: "OPEN", tagClass: "bg-success/20 text-success" },
  { title: "Pro League · Season 4", prize: "৳1,00,000", players: 256, slots: 8, date: "Next Friday", tag: "ELITE", tagClass: "bg-primary/20 text-primary" },
];

export function Tournaments() {
  return (
    <section id="tournaments" className="py-12 md:py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Tournament hub</h2>
            <p className="text-sm text-muted-foreground mt-1">Daily and weekly cups. Real cash prizes, instant payouts.</p>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">View schedule →</a>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {tournaments.map((t, i) => (
            <div
              key={t.title}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:border-primary/50 hover:-translate-y-0.5 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-28 bg-gradient-primary relative">
                <Trophy className="absolute -bottom-4 -right-4 w-24 h-24 text-white/15" />
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${t.tagClass}`}>
                  {t.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg mb-3">{t.title}</h3>
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {t.players} players</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t.date}</span>
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Prize pool</div>
                    <div className="font-display font-bold text-xl">{t.prize}</div>
                  </div>
                  <Button size="sm" className="bg-gradient-primary text-primary-foreground font-semibold shadow-primary">
                    Join · {t.slots} left
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
