import { Calendar, Trophy, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { listTournaments } from "@/lib/marketplace.functions";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

function formatPrize(n: number) {
  return "৳" + n.toLocaleString();
}

const tagStyles: Record<string, string> = {
  live: "bg-destructive text-destructive-foreground",
  upcoming: "bg-success/20 text-success",
  completed: "bg-muted text-muted-foreground",
};

export function Tournaments() {
  const fetchFn = useServerFn(listTournaments);
  const { data, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => fetchFn(),
  });

  const tournaments = data ?? [];

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

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tournaments scheduled yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {tournaments.map((t, i) => {
              const slotsLeft = Math.max(0, t.max_players - t.current_players);
              const tag = t.status.toUpperCase();
              return (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:border-primary/50 hover:-translate-y-0.5 transition-all animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="h-28 bg-gradient-primary relative">
                    <Trophy className="absolute -bottom-4 -right-4 w-24 h-24 text-white/15" />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${tagStyles[t.status] ?? tagStyles.upcoming}`}>
                      {tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg mb-3 line-clamp-1">{t.title}</h3>
                    <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {t.current_players}/{t.max_players}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(t.start_time)}</span>
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t border-border">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Prize pool</div>
                        <div className="font-display font-bold text-xl">{formatPrize(Number(t.prize_pool))}</div>
                      </div>
                      <Button size="sm" disabled={slotsLeft === 0} className="bg-gradient-primary text-primary-foreground font-semibold shadow-primary">
                        {slotsLeft === 0 ? "Full" : `Join · ${slotsLeft} left`}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
