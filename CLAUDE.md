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

**MVP: In progress.** Stripe Connect onboarding (item 2) is complete. Items 3-13 are next.

### What's built (on top of kit)

- **Domain schema** — `trips`, `bookings`, `booking_payments`, `guide_profiles`, `guide_availability`, `stripe_connect_accounts` tables with RLS, indexes, triggers
- **Stripe Connect onboarding** — Express account creation, onboarding/refresh links, dashboard link, status sync, `account.updated` webhook handler, payments page UI (status card + connect button)
- **Marketing site** — Public landing page with hero, features, about, CTA
- **Connected account fallback** — Graceful handling when Connect account doesn't exist yet

### What's NOT built yet

- Trip types CRUD
- Guide profiles & availability management
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
