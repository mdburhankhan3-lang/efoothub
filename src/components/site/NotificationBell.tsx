import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Check } from "lucide-react";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { listNotifications, markNotificationRead } from "@/lib/notifications.functions";
import { supabase } from "@/integrations/supabase/client";

export function NotificationBell({ userId }: { userId: string }) {
  const fetchFn = useServerFn(listNotifications);
  const markFn = useServerFn(markNotificationRead);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifs = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchFn(),
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const ch = supabase
      .channel(`notif-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => {
        qc.invalidateQueries({ queryKey: ["notifications", userId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, qc]);

  const unread = (notifs as any[]).filter((n) => !n.read).length;

  const markAll = useMutation({
    mutationFn: () => markFn({ data: { all: true } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAll.mutate()}>
              <Check className="w-3 h-3 mr-1" /> Mark all
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {(notifs as any[]).length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            (notifs as any[]).map((n) => (
              <a
                key={n.id}
                href={n.link ?? "#"}
                onClick={() => markFn({ data: { id: n.id } }).then(() => qc.invalidateQueries({ queryKey: ["notifications", userId] }))}
                className={`block px-3 py-2.5 border-b last:border-b-0 hover:bg-secondary/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{n.title}</div>
                    {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>}
                    <div className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
