import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function pub() {
  const url = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return createClient<Database>(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const listAllTournaments = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub()
    .from("tournaments")
    .select("*")
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getTournamentParticipants = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ tournamentId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await pub()
      .from("tournament_participants")
      .select("id, joined_at, user_id, profiles(username, display_name, avatar_url)")
      .eq("tournament_id", data.tournamentId);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const joinTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ tournamentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("tournament_participants")
      .insert({ tournament_id: data.tournamentId, user_id: userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const leaveTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ tournamentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("tournament_participants")
      .delete()
      .eq("tournament_id", data.tournamentId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyTournaments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("tournament_participants")
      .select("tournament_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => r.tournament_id as string);
  });
