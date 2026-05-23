
-- PROFILES (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  country text,
  verified boolean not null default false,
  rating numeric(3,2) not null default 0,
  total_sales integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- LISTINGS
create type public.listing_category as enum ('id', 'coins', 'pack', 'boost');
create type public.listing_status as enum ('active', 'sold', 'paused', 'pending');
create type public.platform as enum ('Mobile', 'PS5', 'PS4', 'Xbox', 'PC');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category public.listing_category not null,
  platform public.platform not null,
  rank text,
  price numeric(12,2) not null check (price >= 0),
  old_price numeric(12,2),
  currency text not null default 'BDT',
  images text[] not null default '{}',
  status public.listing_status not null default 'active',
  featured boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.listings enable row level security;
create index listings_status_idx on public.listings(status, created_at desc);
create index listings_category_idx on public.listings(category);

create policy "Active listings are public"
  on public.listings for select using (status = 'active' or seller_id = auth.uid());
create policy "Sellers can create listings"
  on public.listings for insert with check (auth.uid() = seller_id);
create policy "Sellers can update own listings"
  on public.listings for update using (auth.uid() = seller_id);
create policy "Sellers can delete own listings"
  on public.listings for delete using (auth.uid() = seller_id);

-- BIDS (private)
create type public.bid_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  bidder_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  message text,
  status public.bid_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.bids enable row level security;
create index bids_listing_idx on public.bids(listing_id);

create policy "Bidder and seller can view bids"
  on public.bids for select using (
    auth.uid() = bidder_id
    or auth.uid() in (select seller_id from public.listings where id = listing_id)
  );
create policy "Authenticated users can place bids"
  on public.bids for insert with check (auth.uid() = bidder_id);
create policy "Bidder can withdraw own bid"
  on public.bids for update using (auth.uid() = bidder_id);
create policy "Seller can update bid status"
  on public.bids for update using (
    auth.uid() in (select seller_id from public.listings where id = listing_id)
  );

-- TOURNAMENTS
create type public.tournament_status as enum ('upcoming', 'live', 'completed', 'cancelled');

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  prize_pool numeric(12,2) not null default 0,
  entry_fee numeric(12,2) not null default 0,
  max_players integer not null default 32,
  current_players integer not null default 0,
  start_time timestamptz not null,
  status public.tournament_status not null default 'upcoming',
  created_at timestamptz not null default now()
);
alter table public.tournaments enable row level security;
create policy "Tournaments are public"
  on public.tournaments for select using (true);

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);
alter table public.reviews enable row level security;
create policy "Reviews are public"
  on public.reviews for select using (true);
create policy "Buyers can create reviews"
  on public.reviews for insert with check (auth.uid() = buyer_id);
create policy "Buyers can update own reviews"
  on public.reviews for update using (auth.uid() = buyer_id);
create policy "Buyers can delete own reviews"
  on public.reviews for delete using (auth.uid() = buyer_id);
