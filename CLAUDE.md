# CLAUDE.md

A platform for fishing and hunting guide companies to manage bookings, payments,
scheduling, and client communication. Built on the
[freelance kit](https://github.com/uncommon-carp/kit). This is a real product, not a portfolio piece.

## Project Docs

- **GUIDE_PLATFORM_SPEC.md** — Product vision, data model, key decisions, and roadmap with progress tracking
- **TECHNICAL_SPEC.md** — Kit foundation technical docs (auth, multi-tenancy, billing, etc.)
- **docs/STRIPE_CONNECT_PLAN.md** — Stripe Connect integration strategy (Express accounts, destination charges, webhook routing)

## Current State

**Phase 0 (Kit Onboarding & Foundation): Complete.**
Kit cloned, branded as Pescador, all 6 domain tables migrated with RLS.

**MVP: In progress.** Stripe Connect onboarding (item 2), Trip types CRUD (item 3), and Guide profiles & availability (item 4) are complete. Items 5-13 are next.

### What's built (on top of kit)

- **Domain schema** — `trips`, `bookings`, `booking_payments`, `guide_profiles`, `guide_availability`, `stripe_connect_accounts` tables with RLS, indexes, triggers
- **Stripe Connect onboarding** — Express account creation, onboarding/refresh links, dashboard link, status sync, `account.updated` webhook handler, payments page UI (status card + connect button)
- **Marketing site** — Public landing page with hero, features, about, CTA
- **Connected account fallback** — Graceful handling when Connect account doesn't exist yet
- **Trip types CRUD** — Card grid with create/edit dialogs, delete confirmation, inline status toggle, dollar→cents validation (separate form/server schemas), role-based access
- **Guide profiles CRUD** — Card grid with photo, bio, specialty/certification badges. Create (admin picks org member), edit (admin or self), delete (admin, email confirmation). Photo upload via Supabase Storage (`guide-photos` bucket). Comma-separated array input for specialties/certifications
- **Guide availability calendar** — Dedicated page per guide (`/organizations/[org_id]/guides/[guide_id]/availability`). Custom month grid (CSS grid, no dependencies). Day-click dialog to toggle slots (morning/afternoon/full_day × available/blocked). Bulk set dialog (date range, day-of-week filter, time slot selection). Booked slots are read-only. Full_day vs morning/afternoon conflict resolution. Linked from GuideCard

### What's NOT built yet
- Booking creation (client self-service or guide-created)
- Public booking pages (`/book/[slug]/`)
- Booking payment checkout flow
- Booking lifecycle emails
- Conditions integration
- Dashboard views (schedule, stats)
- Cancellation logic
- Analytics

## Architecture Decisions

| Decision | Choice | Notes |
|---|---|---|
| Platform vs. software | Platform (Stripe Connect) | Transaction fee revenue, stickier |
| Connect account type | Express | Stripe handles KYC, onboarding hosted by Stripe |
| Charge type | Destination charges | Platform owns checkout, simpler refunds |
| Client auth | None — public booking flow | No account required to book |
| Webhook routing | Separate endpoints | `/api/webhooks/stripe/` (SaaS) and `/api/webhooks/stripe/connect/` (Connect) |
| Architecture | Monolith, clean boundaries | Server actions + lib modules, no microservices |
| Conditions data | External API | Existing weather/water API called as a service |

## Tech Stack

Next.js 16 (App Router), TypeScript 5, Supabase (Postgres + Auth + Storage),
Stripe (Billing + Connect), Resend + React Email, Tailwind v4, shadcn/ui, Vercel

## Conventions

- Server actions in `actions/`, grouped by domain
- Stripe helpers in `lib/stripe/` (`server.ts`, `connect.ts`)
- Validation schemas in `lib/validations/`
- Email templates in `emails/` with shared layout in `emails/_components/`
- Database migrations in `supabase/migrations/`
- RLS on all tables, scoped to `organization_id` via `is_org_member()` / `get_org_role()`
- Zod validation on all server action inputs
- Separate form/server Zod schemas when transforms are involved (form schema validates only, server schema transforms) to avoid double-transform via `standardSchemaResolver`
- Storage helpers in `lib/storage/` for domain-specific uploads (e.g., `guide-photos.ts`), base avatar helper in `lib/storage.ts`
