import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Calendar, Users, Coins, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { listAllTournaments, joinTournament, leaveTournament, getMyTournaments } from "@/lib/tournaments.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/tournaments")({
  head: () => ({
    meta: [
      { title: "Tournaments — eFootHub" },
      { name: "description", content: "Join free and paid eFootball tournaments and win coins." },
    ],
  }),
  component: TournamentsPage,
});

function TournamentsPage() {
  const { user } = useAuth();
  const fetchTs = useServerFn(listAllTournaments);
  const fetchMine = useServerFn(getMyTournaments);
  const joinFn = useServerFn(joinTournament);
  const leaveFn = useServerFn(leaveTournament);
  const qc = useQueryClient();

  const { data: tournaments = [], isLoading } = useQuery({ queryKey: ["tournaments-all"], queryFn: () => fetchTs() });
  const { data: mine = [] } = useQuery({
    queryKey: ["my-tournaments", user?.id],
    queryFn: () => fetchMine(),
    enabled: !!user,
  });

  const join = useMutation({
    mutationFn: (id: string) => joinFn({ data: { tournamentId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tournaments"] });
      toast.success("Joined tournament!");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to join"),
  });
  const leave = useMutation({
    mutationFn: (id: string) => leaveFn({ data: { tournamentId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tournaments"] });
      toast.success("Left tournament");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to leave"),
  });

  const mineSet = new Set(mine as string[]);

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">Tournaments</h1>
            <p className="text-xs text-muted-foreground">Join live and upcoming tournaments</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-3">{[0,1,2].map(i => <div key={i} className="h-28 rounded-xl bg-card animate-pulse" />)}</div>
        ) : (tournaments as any[]).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No tournaments yet</div>
        ) : (
          <div className="grid gap-3">
            {(tournaments as any[]).map((t) => {
              const joined = mineSet.has(t.id);
              const statusColor = t.status === "live" ? "bg-success/15 text-success" : t.status === "upcoming" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground";
              return (
                <div key={t.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h2 className="font-display font-bold text-lg leading-tight">{t.title}</h2>
                        <Badge className={statusColor}>{t.status.toUpperCase()}</Badge>
                      </div>
                      {t.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(t.start_time).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-400" /> {Number(t.prize_pool).toLocaleString()} prize</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.current_players}/{t.max_players}</span>
                        <span>Entry: {Number(t.entry_fee) === 0 ? "Free" : `${t.entry_fee} coins`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60 flex justify-end">
                    {!user ? (
                      <Link to="/auth"><Button size="sm">Sign in to join</Button></Link>
                    ) : joined ? (
                      <div className="flex gap-2">
                        <Badge className="bg-success/15 text-success"><Check className="w-3 h-3 mr-1" /> Joined</Badge>
                        <Button size="sm" variant="outline" onClick={() => leave.mutate(t.id)} disabled={leave.isPending}>Leave</Button>
                      </div>
                    ) : (
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => join.mutate(t.id)} disabled={join.isPending || t.status === "completed" || t.status === "cancelled"}>
                        Join tournament
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
