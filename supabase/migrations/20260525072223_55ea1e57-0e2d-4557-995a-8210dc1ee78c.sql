
-- 1. Bids: prevent sellers from modifying any field other than status
DROP POLICY IF EXISTS "Seller can update bid status" ON public.bids;

CREATE OR REPLACE FUNCTION public.is_listing_seller(_listing_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = _listing_id AND seller_id = auth.uid()
  );
$$;

CREATE POLICY "Seller can update bid status"
ON public.bids
FOR UPDATE
USING (public.is_listing_seller(listing_id))
WITH CHECK (public.is_listing_seller(listing_id));

-- Trigger to enforce that sellers can only change `status`
CREATE OR REPLACE FUNCTION public.bids_restrict_seller_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the updater is not the bidder, they must be the seller and may only change status
  IF auth.uid() IS DISTINCT FROM OLD.bidder_id THEN
    IF NEW.listing_id IS DISTINCT FROM OLD.listing_id
       OR NEW.bidder_id IS DISTINCT FROM OLD.bidder_id
       OR NEW.amount IS DISTINCT FROM OLD.amount
       OR NEW.message IS DISTINCT FROM OLD.message
       OR NEW.contact IS DISTINCT FROM OLD.contact
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Sellers may only update the status field on bids';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bids_restrict_seller_updates_trg ON public.bids;
CREATE TRIGGER bids_restrict_seller_updates_trg
BEFORE UPDATE ON public.bids
FOR EACH ROW EXECUTE FUNCTION public.bids_restrict_seller_updates();

-- 2. Storage: remove public listing policy on listing-images bucket
-- Files remain accessible via direct public URL (bucket is public)
DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;

-- 3. Tournaments: explicit deny for INSERT/UPDATE/DELETE from client roles
CREATE POLICY "No client inserts on tournaments"
ON public.tournaments
FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "No client updates on tournaments"
ON public.tournaments
FOR UPDATE TO authenticated, anon
USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on tournaments"
ON public.tournaments
FOR DELETE TO authenticated, anon
USING (false);
