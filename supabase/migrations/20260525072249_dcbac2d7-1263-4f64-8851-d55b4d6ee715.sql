
REVOKE EXECUTE ON FUNCTION public.is_listing_seller(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bids_restrict_seller_updates() FROM PUBLIC, anon, authenticated;
