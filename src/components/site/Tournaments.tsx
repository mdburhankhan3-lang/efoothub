import { Calendar, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const tournaments = [
  { title: "BD Champions Cup", prize: "৳50,000", players: 128, slots: 32, date: "Sat, 8 PM", tag: "LIVE", color: "from-red-500 to-orange-500" },
  { title: "Weekend Warriors", prize: "৳15,000", players: 64, slots: 12, date: "Sun, 6 PM", tag: "OPEN", color: "from-blue-500 to-cyan-500" },
  { title: "Pro League Season 4", prize: "৳1,00,000", players: 256, slots: 8, date: "Next Friday", tag: "ELITE", color: "from-purple-500 to-pink-500" },
];

export function Tournaments() {
  return (
    <section id="tournaments" className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-medium text-primary mb-2">COMPETE & WIN</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Tournament Hub</h2>
          <p className="text-muted-foreground">Join daily and weekly tournaments. Real cash prizes, fair brackets, instant payouts.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {tournaments.map((t, i) => (
            <div
              key={t.title}
              className="group relative bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`h-32 bg-gradient-to-br ${t.color} relative overflow-hidden`}>
                <div className="absolute inset-0 grid-bg opacity-30" />
                <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-white/20" />
                <span className="absolute top-3 right-3 px-2 py-1 rounded-md glass text-[10px] font-bold tracking-wider">
                  {t.tag}
                </span>
              </div>
              <div className="p-5 md:p-6">
                <h3 className="font-display font-bold text-xl mb-3">{t.title}</h3>
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" /> {t.players} players
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" /> {t.date}
                  </div>
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Prize pool</div>
                    <div className="font-display font-bold text-2xl text-gradient">{t.prize}</div>
                  </div>
                  <Button size="sm" className="bg-gradient-neon text-primary-foreground font-semibold">
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
