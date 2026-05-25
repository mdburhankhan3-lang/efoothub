import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createEscrowDeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      listingId: z.string().uuid(),
      buyerContact: z.string().min(3).max(200),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: listing, error: lErr } = await supabase
      .from("listings")
      .select("id, price, seller_id, status")
      .eq("id", data.listingId)
      .maybeSingle();
    if (lErr) throw new Error(lErr.message);
    if (!listing) throw new Error("Listing not found");
    if ((listing as any).seller_id === userId) throw new Error("You cannot buy your own listing");
    if ((listing as any).status !== "active") throw new Error("Listing is not active");

    const { data: deal, error } = await supabase
      .from("escrow_deals")
      .insert({
        listing_id: listing.id,
        buyer_id: userId,
        seller_id: (listing as any).seller_id,
        amount: (listing as any).price,
        buyer_contact: data.buyerContact,
        status: "pending_payment",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, dealId: (deal as any).id };
  });

export const submitAccountDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      dealId: z.string().uuid(),
      accountDetails: z.string().min(5).max(4000),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: deal } = await supabase
      .from("escrow_deals").select("seller_id, status").eq("id", data.dealId).maybeSingle();
    if (!deal || (deal as any).seller_id !== userId) throw new Error("Not authorized");
    if ((deal as any).status !== "paid") throw new Error("Deal must be marked paid before submitting details");
    const { error } = await supabase
      .from("escrow_deals")
      .update({ account_details: data.accountDetails, status: "account_submitted" })
      .eq("id", data.dealId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyEscrowDeals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("escrow_deals")
      .select("id, status, amount, buyer_contact, account_details, admin_note, created_at, buyer_id, seller_id, listing_id, listings(title, images, currency)")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
