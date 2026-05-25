# Production-Ready Rollout Plan

This is a large request. I'll build it in focused phases to keep the app stable and avoid breaking what already works. Confirm the plan (or trim it) and I'll execute end-to-end.

## Scope I will build

### 1. Database (single migration)
New tables + RLS:
- `user_roles` (enum: `admin`, `user`) + `has_role()` security definer (no recursion)
- `notifications` (user_id, type, title, body, link, read, created_at) — user reads own
- `tournament_participants` (tournament_id, user_id, joined_at) — user joins/leaves own
- `escrow_deals` (listing_id, buyer_id, seller_id, amount, status: `pending_payment | paid | account_submitted | verified | released | refunded | disputed`, account_details (admin-only), buyer_contact, created_at)
- Add `admin_status` column to `listings` (`pending | approved | rejected`) + seed existing to `approved`
- RLS: admins can read/write everything; users see their own escrow/notifications/bids; account_details only visible to admin + buyer after release
- Triggers: welcome notification on signup; bid placed → notify seller; bid accepted → notify bidder; tournament join → notify; escrow status changes → notify both parties
- Seed UCL Final tournament

### 2. Admin Panel (`/admin`, role-gated)
Tabs:
- Listings — approve / reject pending, delete
- Users — list profiles, toggle admin role
- Bids — view all, force-decline
- Escrow Deals — see all stages, mark verified, release to buyer (reveals creds) + payout seller, refund
- Tournaments — create / edit / delete, view participants

### 3. Notifications
- Bell icon in header with unread count + dropdown list
- Real-time via Supabase channel
- Triggered by DB triggers above (no client logic needed)

### 4. Tournaments
- `/tournaments` page lists all, Join button (auth required, free or paid placeholder)
- Tournament detail shows participants
- Seed UCL Final (26 May, 1000 coins prize, free entry)

### 5. Escrow Flow
- Listing detail: "Buy Now" → creates `escrow_deals` row (status `pending_payment`) + opens instructions modal (manual payment confirmation by admin for v1, no Stripe)
- Buyer dashboard: My Purchases tab with current status
- Seller dashboard: prompted to submit account details when status = `paid`
- Admin releases → buyer sees account details, seller sees "paid"

### 6. Social links + footer polish
- Add Facebook + Telegram icons in Footer and BottomNav

### 7. Performance & cleanup
- Convert public reads to lighter queries (already done for listings)
- Add proper loading skeletons
- Verify no build errors

## What I will NOT do (out of scope unless you ask)
- Real payment processor (Stripe/bKash) — escrow uses manual admin confirmation
- Email notifications (in-app only)
- Full redesign — keep existing layout
- GitHub push — Lovable auto-syncs to GitHub if you've connected it (Settings → GitHub). I cannot run `git push` from here.

## Technical notes
- Roles stored in `user_roles` table with `has_role()` security definer — never on profiles (privilege escalation risk)
- All admin actions go through `createServerFn` with admin check
- Notifications use Supabase Realtime channel scoped to `user_id = auth.uid()`
- Escrow `account_details` column protected by RLS — only admin sees until release

## Execution order
1. Migration (tables, RLS, triggers, seed) — single approval
2. Admin role assignment helper + `/admin` route
3. Notifications (bell + realtime)
4. Tournaments page + join
5. Escrow flow (Buy Now → dashboards → admin release)
6. Footer socials + final QA

Estimated: ~6–8 file changes per phase. I'll execute all phases in one go after you approve.

**Approve to proceed, or tell me which phases to drop/reorder.**
