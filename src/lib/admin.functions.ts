import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    return { isAdmin: !!data };
  });

export const adminListAll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const [listings, bids, escrows, tournaments, users, roles] = await Promise.all([
      supabase.from("listings").select("id, title, price, currency, status, admin_status, seller_id, created_at, images, platform, category").order("created_at", { ascending: false }).limit(200),
      supabase.from("bids").select("id, amount, status, created_at, listing_id, bidder_id, listings(title)").order("created_at", { ascending: false }).limit(200),
      supabase.from("escrow_deals").select("id, status, amount, created_at, buyer_id, seller_id, listing_id, listings(title), buyer_contact, account_details, admin_note").order("created_at", { ascending: false }).limit(200),
      supabase.from("tournaments").select("*").order("start_time", { ascending: false }),
      supabase.from("profiles").select("id, username, display_name, verified, rating, total_sales, country, created_at").order("created_at", { ascending: false }).limit(200),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    return {
      listings: listings.data ?? [],
      bids: bids.data ?? [],
      escrows: escrows.data ?? [],
      tournaments: tournaments.data ?? [],
      users: users.data ?? [],
      roles: roles.data ?? [],
    };
  });

export const adminSetListingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    listingId: z.string().uuid(),
    adminStatus: z.enum(["pending", "approved", "rejected"]).optional(),
    status: z.enum(["active", "paused", "sold"]).optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const patch: any = {};
    if (data.adminStatus) patch.admin_status = data.adminStatus;
    if (data.status) patch.status = data.status;
    const { error } = await context.supabase.from("listings").update(patch).eq("id", data.listingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ listingId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("listings").delete().eq("id", data.listingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    userId: z.string().uuid(),
    role: z.enum(["admin", "moderator"]),
    grant: z.boolean(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.grant) {
      const { error } = await context.supabase.from("user_roles").insert({ user_id: data.userId, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminUpdateEscrow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    dealId: z.string().uuid(),
    status: z.enum(["pending_payment", "paid", "account_submitted", "verified", "released", "refunded", "disputed"]),
    adminNote: z.string().max(1000).optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("escrow_deals")
      .update({ status: data.status, admin_note: data.adminNote ?? null })
      .eq("id", data.dealId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateBidStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    bidId: z.string().uuid(),
    status: z.enum(["pending", "accepted", "declined"]),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("bids").update({ status: data.status }).eq("id", data.bidId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpsertTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(2).max(120),
    description: z.string().max(2000).optional(),
    prize_pool: z.number().min(0),
    entry_fee: z.number().min(0),
    max_players: z.number().int().min(2).max(1024),
    start_time: z.string(),
    status: z.enum(["upcoming", "live", "completed", "cancelled"]),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await context.supabase.from("tournaments").update(data as any).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("tournaments").insert(data as any);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("tournaments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
