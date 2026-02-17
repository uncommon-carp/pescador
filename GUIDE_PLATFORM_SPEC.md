# Guide Company Management Platform

## What This Document Is

Product and architecture decisions from an initial planning conversation.
Intended to bootstrap a fresh repo using the [freelance kit](git@github.com:uncommon-carp/kit.git) as the foundation.

---

## Product Concept

**A business platform for fishing/hunting guide companies to manage their operations — bookings, payments, guide scheduling, and client communication.**

Think Calendly or Square Appointments, but purpose-built for guide operations with weather/water conditions data baked in.

### What it is NOT

- **Not a marketplace.** We don't aggregate demand. Clients already know the guide company (Instagram, word of mouth, referrals, repeat business). We give the company tools to convert that demand into bookings.
- **Not competing with Captain Experiences.** We're complementary — a guide company can be listed on Captain Experiences for discovery AND use this platform for direct bookings and ops.
- **Not just a scheduling tool.** Stripe Connect puts us in the transaction flow. That makes it a platform, not a utility.

### Positioning

Guide companies share a booking link (Instagram bio, website, text to a client). That link lands on a booking page *for their company*, hosted on our platform. We handle the booking, the payment (via Stripe Connect), and give the company a dashboard to manage everything.

---

## Key Decisions Made

| Decision | Choice | Reasoning |
|---|---|---|
| **Platform vs. software** | Platform (Stripe Connect from day one) | Stickier product, transaction fee revenue, more defensible. User has Connect experience. |
| **Infrastructure** | Supabase + Vercel (kit default) | Sufficient for 100s-1000s users. Postgres is portable to RDS/Aurora later if needed. AWS pivot would mean rebuilding the kit. |
| **Architecture** | Monolith with clean internal boundaries | No microservices. Server actions, shared DB, one deployment. The kit's `actions/` + `lib/` structure provides module boundaries without service overhead. |
| **Weather/water data** | Consumed as external API | User has an existing weather/water data API/logic. The main app calls it as a service — not a microservice, just an external dependency like Stripe. |
| **Client payment model** | Stripe Connect (platform collects on behalf of guide companies) | Guide companies are connected accounts. Clients pay through our booking flow. We can take a transaction fee. |
| **Client auth** | Public booking flow, no auth required | Clients book and pay without creating an account. The booking record lives in the guide company's org. |

---

## Feature Pillars

### 1. Bookings & Payments (Core)

The transaction loop. A guide company converts demand into a paid booking. Pescador owns the transaction, not the conversation.

**Two booking creation paths (both first-class):**

#### Client Self-Service Booking

The client already knows the guide company (Instagram, website, word of mouth, repeat business). They land on the company's public booking page and book directly.

```
Client visits /book/[company_slug]/
  → Browses trip types and available dates
  → Selects trip, date, party size
  → Enters contact info
  → Pays deposit or full amount via Stripe Checkout
  → Booking confirmed automatically
```

Best for: Straightforward trips with clear availability. New clients coming from social media or the guide's website. Companies that want a hands-off booking flow.

#### Guide-Created Booking

The guide had a conversation with the client (text, DM, phone, in person) and agreed on the details. Now they need to formalize it and collect payment.

```
Guide creates booking from dashboard
  → Fills in client name, email, phone, trip, date, party size
  → Booking created in "pending" status, payment_status: "unpaid"
  → Clicks "Send Payment Link"
  → Client receives email with a link to Stripe Checkout
  → Client pays
  → Booking confirmed
```

Best for: Custom or complex trips that required discussion. Repeat clients where the guide texted "conditions look great Thursday, you in?" and got a yes. Any situation where the conversation happened outside the platform.

**Why this matters:** Guiding isn't a "pick a slot and book" business. There's often back-and-forth about conditions, dates, group size, which river, which guide. Pescador doesn't try to own that conversation — guides already do it via text and DM, and they're good at it. Pescador picks up where the conversation ends: formalizing the booking and collecting payment professionally.

**What we are NOT building:** Lead tracking, CRM pipelines, in-app messaging, or conversion funnels. A guide-created booking is not a "lead" — it's a booking that the guide already closed. The conversation happened elsewhere, and that's fine.

**Core features:**

- Trip types defined by the guide company (half-day wade, full-day float, etc.)
- Public booking page per company (`/book/[company_slug]/`)
- Guide-created bookings with payment link delivery
- Stripe Connect: company onboarding, client checkout, platform fee
- Booking statuses (pending, confirmed, completed, canceled, no-show)
- Payment statuses (unpaid, deposit_paid, paid, refunded, partially_refunded, disputed)
- Deposit and cancellation policy support

**Kit provides:** Stripe subscription billing (for company's platform fee), webhook handling pattern, server action patterns.
**Must build:** Connect onboarding flow, per-booking checkout (shared by both paths), public booking pages, guide-created booking flow, payment link generation, trip/booking CRUD.

### 2. Guide Management & Scheduling

Extends the kit's org member model. Guides are org members with additional scheduling data.

- Guide profiles (specialties, bio, certifications)
- Availability management (which days/times a guide is available)
- Trip assignment (which guide takes which booking)
- Schedule view (what does this week look like for the company)

**Kit provides:** Org membership, roles (owner/admin/member), invitations, RLS scoped to org.
**Must build:** Guide profile extension, availability model, schedule views, assignment logic.

### 3. Public Booking Presence

Each guide company gets a client-facing booking experience scoped to their slug. Not a landing page for *our* platform — a storefront for *their* company.

- Unauthenticated route group (`app/(public)/book/[slug]/`)
- Different layout than the dashboard (no sidebar, client-friendly)
- Shows available trip types, dates, and pricing
- Booking form → Stripe Connect checkout
- Confirmation page / email

**Kit provides:** Next.js routing, layout groups, Resend email.
**Must build:** Public route group, booking flow UI, Connect checkout integration.

### 4. Client Communication

Transactional emails triggered by booking lifecycle events. Guide companies are probably doing this manually via text right now.

- Booking confirmation
- Reminder (day before)
- Pre-trip info ("bring X, we provide Y", meeting location, conditions forecast)
- Post-trip follow-up (thank you, review request)
- Cancellation / reschedule notices

**Kit provides:** Resend integration, React Email templates (4 templates as examples), `sendEmail` helper with graceful degradation.
**Must build:** Booking-specific email templates, trigger logic tied to booking status changes.

### 5. Conditions Data

The existing weather/water data API surfaces in two places:

- **Scheduling side:** Help guide companies plan — "conditions look good Thursday, bad Saturday"
- **Public booking side:** Show clients what to expect

**Kit provides:** Server action pattern for calling external APIs, dashboard layout for displaying data.
**Must build:** Integration layer (`lib/conditions/`), UI components for conditions display, mapping conditions to trip viability.

### Analytics (Cross-cutting)

Not a separate pillar — it's queries against the same tables. The kit's admin dashboard pattern (RPC functions returning aggregates) scales to:

- Revenue this month/quarter/year
- Bookings by trip type
- Busiest guides
- Seasonal trends
- Cancellation rates

**Kit provides:** Admin RPC function pattern, dashboard card layout.
**Must build:** Guide-company-scoped analytics queries, dashboard views.

---

## What the Kit Handles (Zero/Minimal Effort)

These are production-ready out of the box:

- **Auth:** Email/password, magic link, Google OAuth, password reset, email verification
- **Multi-tenancy:** Org creation, member management, invitations, role-based permissions, RLS
- **Platform billing:** Guide companies pay a monthly subscription (Free/Starter/Pro tiers)
- **Email infrastructure:** Resend + React Email with templates
- **Admin dashboard:** System-wide metrics, user/org management
- **User settings:** Profile, avatar upload, password change, email change, account deletion
- **UI shell:** Sidebar, header, breadcrumbs, org switcher, 23 shadcn/ui components
- **Security:** RLS policies, Zod validation, server-side auth checks, webhook signature verification

---

## What Must Be Built (Domain-Specific)

Roughly ordered by dependency:

1. **Stripe Connect onboarding** — Guide companies connect their Stripe account during setup
2. **Trip types** — CRUD for the offerings a company provides (name, duration, price, capacity, description)
3. **Guide profiles & availability** — Extend org members with scheduling data
4. **Bookings** — Core table linking a client to a trip, a guide, a date, and a payment
5. **Public booking flow** — Client self-service: unauthenticated route group with company-scoped trip browsing and checkout
6. **Guide-created booking flow** — Dashboard UI for guides to create bookings on behalf of clients and send payment links
7. **Booking lifecycle emails** — Confirmation, reminder, pre-trip, post-trip, payment link templates
8. **Conditions integration** — Wire in the existing weather/water API
9. **Dashboard views** — Company-scoped stats, schedule overview, upcoming bookings
10. **Analytics** — Revenue, utilization, trends (can be MVP-light or post-MVP)

---

## Data Model

Domain tables added on top of the kit's base schema (`organizations`, `organization_members`, `invitations`). All scoped to `organization_id` with RLS via `is_org_member()` / `get_org_role()`, following the kit's established patterns.

### Cancellation Policies

Platform provides a default policy. Organizations can override it. No per-trip customization for MVP.

```
-- Platform default stored in app config (not DB). Org override stored on the org row.
organizations (existing table — new columns)
├── cancellation_policy_type TEXT DEFAULT 'moderate'    -- 'strict' | 'moderate' | 'flexible' | 'custom'
├── cancellation_free_window_hours INTEGER DEFAULT 48   -- Hours before trip start for free cancellation
└── cancellation_late_refund_percent INTEGER DEFAULT 25  -- % refunded after free window closes (0-100)
```

Policy templates (resolved from `cancellation_policy_type`, overridden by the explicit columns if type is `custom`):

| Type | Free Window | Late Refund % |
|------|-------------|---------------|
| Flexible | 24 hours | 50% |
| Moderate (default) | 48 hours | 25% |
| Strict | 72 hours | 0% |
| Custom | org-defined | org-defined |

### Trips

```
trips
├── id UUID PK
├── organization_id UUID FK → organizations ON DELETE CASCADE
├── name TEXT NOT NULL
├── description TEXT
├── duration TEXT NOT NULL                -- 'morning' | 'afternoon' | 'full_day'
├── price_cents INTEGER NOT NULL          -- Total trip price in cents
├── deposit_required BOOLEAN DEFAULT true -- Promotes deposit flow for everyone's sake
├── deposit_cents INTEGER                 -- Required if deposit_required is true
├── capacity INTEGER NOT NULL DEFAULT 1   -- Max clients per trip instance
├── status TEXT DEFAULT 'active'          -- 'active' | 'inactive'
├── conditions_notes TEXT                 -- What weather/water conditions matter for this trip
├── created_at TIMESTAMPTZ DEFAULT now()
└── updated_at TIMESTAMPTZ DEFAULT now()  -- trigger: update_updated_at()
```

### Bookings

Core record linking a client to a trip, guide, date, and payment lifecycle. Payment amounts live on `booking_payments`, not here.

```
bookings
├── id UUID PK
├── organization_id UUID FK → organizations ON DELETE CASCADE
├── trip_id UUID FK → trips
├── guide_id UUID FK → guide_profiles (nullable — assigned later or auto-assigned)
├── client_name TEXT NOT NULL
├── client_email TEXT NOT NULL
├── client_phone TEXT                     -- Captured from day one for future SMS
├── booking_date DATE NOT NULL
├── time_slot TEXT NOT NULL               -- 'morning' | 'afternoon' | 'full_day' (copied from trip at booking time)
├── party_size INTEGER NOT NULL DEFAULT 1
├── status TEXT DEFAULT 'pending'         -- 'pending' | 'confirmed' | 'completed' | 'canceled' | 'no_show'
├── payment_status TEXT DEFAULT 'unpaid'  -- 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'partially_refunded' | 'disputed'
├── amount_total_cents INTEGER NOT NULL   -- Snapshot of trip price at booking time
├── amount_paid_cents INTEGER DEFAULT 0   -- Running total, updated as payments come in
├── deposit_cents INTEGER                 -- Snapshot of deposit amount (nullable = no deposit)
├── source TEXT DEFAULT 'client'          -- 'client' (self-service) | 'guide' (guide-created)
├── notes TEXT                            -- Client-provided or guide-provided notes
├── conditions_snapshot JSONB             -- Weather/water at time of booking
├── created_at TIMESTAMPTZ DEFAULT now()
└── updated_at TIMESTAMPTZ DEFAULT now()  -- trigger: update_updated_at()
```

### Booking Payments

Separate table for payment events. One booking can have multiple payments (deposit, then balance, or a single full payment). Each row is one Stripe Checkout Session / PaymentIntent.

```
booking_payments
├── id UUID PK
├── booking_id UUID FK → bookings ON DELETE CASCADE
├── organization_id UUID FK → organizations ON DELETE CASCADE  -- Denormalized for RLS
├── payment_type TEXT NOT NULL             -- 'deposit' | 'balance' | 'full'
├── amount_cents INTEGER NOT NULL          -- Amount of this specific payment
├── platform_fee_cents INTEGER NOT NULL    -- Pescador's cut on this payment
├── stripe_checkout_session_id TEXT        -- Stripe Checkout Session ID
├── stripe_payment_intent_id TEXT          -- Filled by webhook after payment succeeds
├── status TEXT DEFAULT 'pending'          -- 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded'
├── refunded_amount_cents INTEGER DEFAULT 0
├── created_at TIMESTAMPTZ DEFAULT now()
└── updated_at TIMESTAMPTZ DEFAULT now()   -- trigger: update_updated_at()
```

When a payment succeeds (webhook), update `booking_payments.status` → `succeeded`, then roll up `bookings.amount_paid_cents` and `bookings.payment_status` accordingly. This keeps `bookings` as the quick-read summary and `booking_payments` as the audit trail.

### Guide Profiles

```
guide_profiles
├── id UUID PK
├── user_id UUID FK → auth.users ON DELETE CASCADE
├── organization_id UUID FK → organizations ON DELETE CASCADE
├── bio TEXT
├── specialties TEXT[]                     -- Array of text tags
├── certifications TEXT[]
├── photo_url TEXT
├── created_at TIMESTAMPTZ DEFAULT now()
└── updated_at TIMESTAMPTZ DEFAULT now()   -- trigger: update_updated_at()
   UNIQUE (user_id, organization_id)
```

### Guide Availability

Time slots: morning, afternoon, full_day. A guide marks slots as available. Bookings consume them.

```
guide_availability
├── id UUID PK
├── guide_profile_id UUID FK → guide_profiles ON DELETE CASCADE
├── organization_id UUID FK → organizations ON DELETE CASCADE  -- Denormalized for RLS
├── date DATE NOT NULL
├── time_slot TEXT NOT NULL                -- 'morning' | 'afternoon' | 'full_day'
├── status TEXT DEFAULT 'available'        -- 'available' | 'booked' | 'blocked'
├── booking_id UUID FK → bookings (nullable — filled when slot is booked)
├── created_at TIMESTAMPTZ DEFAULT now()
   UNIQUE (guide_profile_id, date, time_slot)
```

**Slot logic:**
- A `full_day` availability slot means the guide is free all day. Booking a `morning` trip against it should split or consume the full day (implementation detail — simplest: booking a morning/afternoon trip against a `full_day` slot changes it to `booked` and blocks the whole day).
- A guide with `morning: available` and `afternoon: available` as separate rows can take two half-day trips.
- MVP keeps it simple: a `full_day` booking blocks the entire day. A `morning` or `afternoon` booking blocks that slot. If a guide only has `full_day` availability posted and a `morning` trip is booked, the whole day is consumed.

### Stripe Connect Accounts

```
stripe_connect_accounts
├── id UUID PK
├── organization_id UUID FK → organizations ON DELETE CASCADE  UNIQUE
├── stripe_account_id TEXT NOT NULL UNIQUE
├── details_submitted BOOLEAN DEFAULT false
├── charges_enabled BOOLEAN DEFAULT false
├── payouts_enabled BOOLEAN DEFAULT false
├── created_at TIMESTAMPTZ DEFAULT now()
└── updated_at TIMESTAMPTZ DEFAULT now()   -- trigger: update_updated_at()
```

### Relationships Diagram

```
organizations (kit)
├──< trips                        (1:many)
├──< bookings                     (1:many)
│    ├──< booking_payments        (1:many — deposit, balance, full)
│    └──> guide_profiles          (many:1 — assigned guide)
├──< guide_profiles               (1:many)
│    └──< guide_availability      (1:many — per-date slots)
├──< stripe_connect_accounts      (1:1)
└──< organization_members (kit)   (1:many)
```

---

## Pricing Model (Platform Revenue)

Two revenue streams:

1. **SaaS subscription** (guide company → us): Monthly platform fee using the kit's existing Stripe billing. Tiers TBD but likely:
   - Free: 1 guide, limited bookings/month
   - Pro: Unlimited guides, unlimited bookings, conditions data, analytics

2. **Transaction fee** (per booking, via Stripe Connect): Small percentage of each client payment flows to us as the platform fee. Percentage TBD.

---

## Resolved Questions

| Question | Decision | Phase | Notes |
|---|---|---|---|
| **Product name** | Pescador (pescador.io) | — | Domain owned. Better product than the weather/water dashboard alone. |
| **Cancellation / refund policy** | Per-company configurable with platform defaults | MVP | Preset templates (strict, moderate, flexible) that companies can pick or customize. Stored on the org or trip level. |
| **Multi-day trips** | Start date + duration from trip type for MVP | Immediate post-MVP | MVP covers single-day trips. Multi-day support (date ranges, multi-day guide blocking) comes right after launch. |
| **Client accounts** | No-auth booking | Deferred | Booking record captures everything needed. Can backfill client history by email match later if demand warrants it. |
| **SMS notifications** | Capture `client_phone` from day one, email-only at launch | Later | Notification triggers should be abstracted (`sendBookingNotification()`) so SMS (Twilio or similar) can layer on without rearchitecting. |
| **Waiver / liability forms** | Digital waiver signing via Supabase Storage | Immediate post-MVP | Real pain point for guides, strong differentiator. E-signature flow + signed PDF storage. |
| **Trip photos** | Supabase Storage | Later | Nice engagement feature, not a booking/revenue driver. Straightforward to add when the time comes. |
| **Calendar integrations** | iCal feed export per guide (read-only) | Late MVP | No two-way sync needed initially — just generate an `.ics` URL per guide. Guides live on their phones and already use Google Calendar. |
| **Pricing tiers & transaction fee** | TBD | Pre-launch | Kit already supports tiered billing. Numbers are a business decision. |

## Roadmap Phases

> **Progress key:** ✅ Complete | 🚧 In Progress | ⬚ Not Started

### Phase 0: Kit Onboarding & Foundation ✅
Kit setup and domain schema foundation.

0. ✅ **Kit onboarding** — Rename to Pescador, branding/theme, Supabase project setup, env vars, Stripe keys (platform account + Connect enabled), Resend domain verification
1. ✅ **Domain schema migration** — All 6 domain tables in one migration (`20260213195317_domain_tables.sql`): `trips`, `bookings`, `booking_payments`, `guide_profiles`, `guide_availability`, `stripe_connect_accounts`. Cancellation policy columns on `organizations`. RLS policies, indexes, triggers.

### MVP 🚧
2. ✅ **Stripe Connect onboarding** — Express account creation, onboarding/refresh/dashboard links, `account.updated` webhook, payments page UI with status card + connect button, sync helper with skip-if-unchanged optimization. Separate Connect webhook endpoint at `/api/webhooks/stripe/connect/`.
3. ✅ **Trip types CRUD** — Card grid UI with create/edit dialogs, delete confirmation, inline status toggle. Zod validation with dollar→cents transform (separate form/server schemas). Server actions with role-based access (owner/admin only). `max-w-4xl` two-column card layout.
4. ✅ **Guide profiles & availability** — Profiles: card grid with avatar photo, bio, specialty/certification badges. Admin creates profile by selecting org member; admin or guide self-edits; admin deletes (email confirmation). Photo upload to `guide-photos` Supabase Storage bucket. Comma-separated input → `TEXT[]` transform (separate form/server schemas). Availability calendar: dedicated page at `/organizations/[org_id]/guides/[guide_id]/availability` with custom month grid, day-click slot toggling (morning/afternoon/full_day × available/blocked), bulk set dialog (date range + day-of-week filter), booked-slot protection, full_day vs half-day conflict resolution. Linked from GuideCard.
5. ⬚ Bookings (core table + lifecycle)
6. ⬚ Public booking flow — client self-service (unauthenticated)
7. ⬚ Guide-created booking flow — dashboard booking creation + payment link delivery
8. ⬚ Booking lifecycle emails (confirmation, reminder, pre-trip, post-trip, payment link)
9. ⬚ Conditions integration (weather/water API)
10. ⬚ Dashboard views (schedule, upcoming bookings, company stats)
11. ⬚ Cancellation policy templates (per-company configurable)
12. ⬚ Analytics (MVP-light: revenue, booking counts, utilization)
13. ⬚ iCal feed export per guide (late MVP)

### Immediate Post-MVP
- Digital waiver / liability forms (e-signature + Supabase Storage)
- Multi-day trip support (date ranges, multi-day guide availability blocking)

### Later
- Client accounts (booking history for repeat clients)
- SMS notifications (Twilio, layered onto existing notification triggers)
- Trip photo sharing (Supabase Storage)
- Two-way calendar sync (Google Calendar API)

---

## Technical References

- **Kit repo:** `git@github.com:uncommon-carp/kit.git`
- **Kit stack:** Next.js 16, Supabase (Postgres + Auth + Storage), Stripe, Resend, Tailwind v4, shadcn/ui
- **Kit test run:** The SiteLog scaffolding in this repo proves the domain-model-bolt-on pattern works. ~2,000 lines of custom code on top of the kit's base for a full jobs CRUD with RLS.
- **Target scale:** 100s-1000s of users per deployment
- **Deployment:** Vercel (app) + Supabase (database) + Stripe Connect (payments)
