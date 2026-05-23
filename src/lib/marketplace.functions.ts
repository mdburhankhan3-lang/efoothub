import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Public: list active listings (joined with seller profile)
export const listListings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select(
      "id, title, price, old_price, currency, platform, rank, category, featured, images, seller:profiles!listings_seller_id_fkey(id, username, display_name, verified, rating)"
    )
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Public: list upcoming + live tournaments
export const listTournaments = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("tournaments")
    .select("*")
    .in("status", ["upcoming", "live"])
    .order("start_time", { ascending: true })
    .limit(6);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Authenticated: place a private bid (visible only to seller + bidder via RLS)
export const placeBid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        listingId: z.string().uuid(),
        amount: z.number().positive().max(10_000_000),
        message: z.string().max(500).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("bids").insert({
      listing_id: data.listingId,
      bidder_id: userId,
      amount: data.amount,
      message: data.message ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
