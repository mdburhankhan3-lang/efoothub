
-- =========================
-- ROLES
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);
-- No client INSERT — triggers/server functions only

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- =========================
-- TOURNAMENT PARTICIPANTS
-- =========================
CREATE TABLE public.tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);

ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants are public" ON public.tournament_participants
  FOR SELECT USING (true);
CREATE POLICY "Users join tournaments" ON public.tournament_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave own" ON public.tournament_participants
  FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Admin can fully manage tournaments
CREATE POLICY "Admins manage tournaments insert" ON public.tournaments
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tournaments update" ON public.tournaments
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tournaments delete" ON public.tournaments
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- LISTINGS admin moderation
-- =========================
CREATE TYPE public.listing_admin_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.listings
  ADD COLUMN admin_status public.listing_admin_status NOT NULL DEFAULT 'approved';

-- Admins can update/delete any listing
CREATE POLICY "Admins manage any listing" ON public.listings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete any listing" ON public.listings
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- ESCROW DEALS
-- =========================
CREATE TYPE public.escrow_status AS ENUM (
  'pending_payment', 'paid', 'account_submitted', 'verified', 'released', 'refunded', 'disputed'
);

CREATE TABLE public.escrow_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status public.escrow_status NOT NULL DEFAULT 'pending_payment',
  buyer_contact text,
  account_details text,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.escrow_deals (buyer_id);
CREATE INDEX ON public.escrow_deals (seller_id);

ALTER TABLE public.escrow_deals ENABLE ROW LEVEL SECURITY;

-- Buyer & seller see their own; admins see all
CREATE POLICY "Parties view own escrow" ON public.escrow_deals
  FOR SELECT USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Buyer creates escrow" ON public.escrow_deals
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);
-- Seller can submit account_details; admin can update anything; buyer can update contact
CREATE POLICY "Parties update escrow" ON public.escrow_deals
  FOR UPDATE USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- Restrict account_details visibility: hide it for buyer until released
CREATE OR REPLACE FUNCTION public.escrow_restrict_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Non-admin updates can only change specific fields
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    -- Buyer may only set buyer_contact
    IF auth.uid() = OLD.buyer_id AND auth.uid() <> OLD.seller_id THEN
      IF NEW.status IS DISTINCT FROM OLD.status
         OR NEW.account_details IS DISTINCT FROM OLD.account_details
         OR NEW.amount IS DISTINCT FROM OLD.amount
         OR NEW.admin_note IS DISTINCT FROM OLD.admin_note
         OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
         OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
         OR NEW.listing_id IS DISTINCT FROM OLD.listing_id THEN
        RAISE EXCEPTION 'Buyers may only update buyer_contact';
      END IF;
    END IF;
    -- Seller may only set account_details and move status from paid -> account_submitted
    IF auth.uid() = OLD.seller_id AND auth.uid() <> OLD.buyer_id THEN
      IF NEW.amount IS DISTINCT FROM OLD.amount
         OR NEW.buyer_contact IS DISTINCT FROM OLD.buyer_contact
         OR NEW.admin_note IS DISTINCT FROM OLD.admin_note
         OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
         OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
         OR NEW.listing_id IS DISTINCT FROM OLD.listing_id THEN
        RAISE EXCEPTION 'Sellers may only submit account details';
      END IF;
      IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'account_submitted' THEN
        RAISE EXCEPTION 'Sellers can only mark account_submitted';
      END IF;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER escrow_restrict_fields_trigger
  BEFORE UPDATE ON public.escrow_deals
  FOR EACH ROW EXECUTE FUNCTION public.escrow_restrict_fields();

-- =========================
-- NOTIFICATION TRIGGERS
-- =========================
CREATE OR REPLACE FUNCTION public.notify_user(_user_id uuid, _type text, _title text, _body text, _link text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (_user_id, _type, _title, _body, _link);
$$;

-- Welcome notification on signup (extend handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  PERFORM public.notify_user(
    NEW.id, 'welcome',
    'Welcome to eFootHub! 🎉',
    'Start by browsing listings or post your first ID for sale.',
    '/'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bid placed -> notify seller
CREATE OR REPLACE FUNCTION public.notify_on_bid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid;
  v_title text;
BEGIN
  SELECT seller_id, title INTO v_seller, v_title FROM public.listings WHERE id = NEW.listing_id;
  IF v_seller IS NOT NULL THEN
    PERFORM public.notify_user(
      v_seller, 'bid_received',
      'New bid on "' || COALESCE(v_title, 'your listing') || '"',
      'You received a bid of ' || NEW.amount::text,
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_on_bid_trigger AFTER INSERT ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_bid();

-- Bid status change -> notify bidder
CREATE OR REPLACE FUNCTION public.notify_on_bid_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT title INTO v_title FROM public.listings WHERE id = NEW.listing_id;
    PERFORM public.notify_user(
      NEW.bidder_id,
      'bid_' || NEW.status::text,
      'Your bid was ' || NEW.status::text,
      'Listing: ' || COALESCE(v_title, ''),
      '/listing/' || NEW.listing_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_on_bid_status_trigger AFTER UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_bid_status();

-- Tournament join -> notify
CREATE OR REPLACE FUNCTION public.notify_on_tournament_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
BEGIN
  SELECT title INTO v_title FROM public.tournaments WHERE id = NEW.tournament_id;
  PERFORM public.notify_user(
    NEW.user_id, 'tournament_joined',
    'Joined "' || COALESCE(v_title, 'tournament') || '" 🏆',
    'You are now registered. Good luck!',
    '/tournaments'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_on_tournament_join_trigger AFTER INSERT ON public.tournament_participants
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_tournament_join();

-- Escrow status change -> notify both parties
CREATE OR REPLACE FUNCTION public.notify_on_escrow_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.notify_user(
      NEW.buyer_id, 'escrow_' || NEW.status::text,
      'Escrow update: ' || NEW.status::text,
      'Your purchase status changed.',
      '/dashboard'
    );
    PERFORM public.notify_user(
      NEW.seller_id, 'escrow_' || NEW.status::text,
      'Escrow update: ' || NEW.status::text,
      'A buyer escrow on your listing changed status.',
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_on_escrow_insert AFTER INSERT ON public.escrow_deals
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_escrow_status();
CREATE TRIGGER notify_on_escrow_update AFTER UPDATE ON public.escrow_deals
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_escrow_status();

-- =========================
-- SEED: UCL Final tournament
-- =========================
INSERT INTO public.tournaments (title, description, prize_pool, entry_fee, max_players, start_time, status)
VALUES (
  'UCL Final',
  'Champions League grand final tournament. Free entry — winner takes 1000 coins.',
  1000, 0, 64,
  '2026-05-26 18:00:00+00'::timestamptz,
  'live'
);
