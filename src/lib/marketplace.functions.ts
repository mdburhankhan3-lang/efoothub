import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    const missing = [
      ...(!supabaseUrl ? ["SUPABASE_URL"] : []),
      ...(!publishableKey ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`);
  }

  return createClient<Database>(supabaseUrl, publishableKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let publicSupabase: ReturnType<typeof createPublicSupabaseClient> | undefined;

function getPublicSupabase() {
  publicSupabase ??= createPublicSupabaseClient();
  return publicSupabase;
}

// Public: list active listings with optional filters
export const listListings = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        category: z.enum(["id", "coins", "pack", "boost"]).optional(),
        platform: z.enum(["Mobile", "PS5", "PS4", "Xbox", "PC"]).optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        search: z.string().max(200).optional(),
        sort: z.enum(["newest", "price_asc", "price_desc", "featured"]).optional(),
      })
      .optional()
      .parse(input)
  )
  .handler(async ({ data: filters }) => {
    let query = getPublicSupabase()
      .from("listings")
      .select(
        "id, title, price, old_price, currency, platform, rank, category, featured, images, seller:profiles!listings_seller_id_fkey(id, username, display_name, verified, rating)"
      )
      .eq("status", "active");

    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.platform) query = query.eq("platform", filters.platform);
    if (filters?.minPrice !== undefined) query = query.gte("price", filters.minPrice);
    if (filters?.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const sort = filters?.sort ?? "featured";
    if (sort === "featured") {
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
    } else if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("price", { ascending: false });
    }

    const { data, error } = await query.limit(48);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Public: get single listing by id
export const getListing = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: listing, error } = await getPublicSupabase()
      .from("listings")
      .select(
        "id, title, description, price, old_price, currency, platform, rank, category, featured, images, status, views, created_at, seller:profiles!listings_seller_id_fkey(id, username, display_name, verified, rating, total_sales, avatar_url, country)"
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!listing) throw new Error("Listing not found");

    return listing;
  });

// Public: list upcoming + live tournaments
export const listTournaments = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await getPublicSupabase()
    .from("tournaments")
    .select("*")
    .in("status", ["upcoming", "live"])
    .order("start_time", { ascending: true })
    .limit(6);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Authenticated: place a private bid
export const placeBid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        listingId: z.string().uuid(),
        amount: z.number().positive().max(10_000_000),
        message: z.string().max(500).optional(),
        contact: z.string().max(200).optional(),
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
      contact: data.contact ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Authenticated (seller): get bids for the seller's listings
export const getSellerBids = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: myListings, error: lErr } = await supabase
      .from("listings")
      .select("id")
      .eq("seller_id", userId);
    if (lErr) throw new Error(lErr.message);
    const ids = (myListings ?? []).map((l) => l.id);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from("bids")
      .select(
        "id, amount, message, contact, status, created_at, listing_id, listings(title, price, currency, status, images), bidder:profiles!bids_bidder_id_fkey(id, username, display_name, avatar_url, verified)"
      )
      .in("listing_id", ids)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Authenticated (seller): accept or decline a bid
export const updateBidStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        bidId: z.string().uuid(),
        status: z.enum(["accepted", "declined"]),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify this bid belongs to one of the seller's listings
    const { data: bid } = await supabase
      .from("bids")
      .select("id, listing_id, listings!inner(seller_id)")
      .eq("id", data.bidId)
      .maybeSingle();
    if (!bid || (bid.listings as any).seller_id !== userId) {
      throw new Error("Not authorized to update this bid");
    }
    const { error } = await supabase
      .from("bids")
      .update({ status: data.status })
      .eq("id", data.bidId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Authenticated (seller): get own listings
export const getSellerListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, price, currency, platform, status, featured, views, created_at, images, category, rank")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Authenticated (seller): update listing status (pause/activate)
export const updateListingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        listingId: z.string().uuid(),
        status: z.enum(["active", "paused", "sold"]),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("listings")
      .update({ status: data.status })
      .eq("id", data.listingId)
      .eq("seller_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Authenticated: get bids the user has placed
export const getMyBids = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("bids")
      .select(
        "id, amount, message, status, created_at, listing_id, listings(title, price, currency, status, images, platform)"
      )
      .eq("bidder_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Authenticated (seller): delete listing
export const deleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ listingId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", data.listingId)
      .eq("seller_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Authenticated (seller): edit listing fields
export const updateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        listingId: z.string().uuid(),
        title: z.string().min(3).max(120).optional(),
        description: z.string().max(2000).optional(),
        price: z.number().positive().max(10_000_000).optional(),
        platform: z.enum(["Mobile", "PS5", "PS4", "Xbox", "PC"]).optional(),
        rank: z.string().max(60).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { listingId, ...fields } = data;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) if (v !== undefined) patch[k] = v;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabase
      .from("listings")
      .update(patch as never)
      .eq("id", listingId)
      .eq("seller_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
