# Pescador

A business platform for fishing and hunting guide companies to manage bookings, payments, guide scheduling, and client communication. Built on the [freelance kit](https://github.com/uncommon-carp/kit).

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 16 (App Router) + TypeScript        |
| Database   | PostgreSQL via Supabase                     |
| Auth       | Supabase Auth                               |
| Storage    | Supabase Storage                            |
| Styling    | Tailwind CSS v4 + shadcn/ui (23 components) |
| Payments   | Stripe Connect + Checkout                   |
| Email      | Resend + React Email                        |
| Validation | Zod v4 + React Hook Form                    |
| Deployment | Vercel                                      |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Supabase (requires Docker)
npx supabase start

# 3. Apply migrations and generate types
npm run db:reset
npm run db:types

# 4. Set up environment variables
cp .env.example .env.local
# Fill in values from `npx supabase status` output

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable                               | Description                                      | Source                                                   |
| -------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase API URL                                 | `npx supabase status` (local) or Supabase dashboard      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key                         | `npx supabase status` or dashboard                       |
| `SUPABASE_SECRET_KEY`                  | Supabase secret key (server only)                | `npx supabase status` or dashboard                       |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Stripe publishable key                           | [Stripe dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_SECRET_KEY`                    | Stripe secret key (server only)                  | Stripe dashboard                                         |
| `STRIPE_WEBHOOK_SECRET`                | Stripe webhook signing secret                    | Stripe dashboard > Webhooks                              |
| `STRIPE_STARTER_PRICE_ID`              | Stripe price ID for starter plan                 | Stripe dashboard > Products                              |
| `STRIPE_PRO_PRICE_ID`                  | Stripe price ID for pro plan                     | Stripe dashboard > Products                              |
| `RESEND_API_KEY`                       | Resend API key (optional — graceful degradation) | [Resend dashboard](https://resend.com)                   |
| `RESEND_FROM`                          | Sender email address                             | Your verified domain                                     |
| `NEXT_PUBLIC_APP_URL`                  | Public app URL                                   | Your deployment URL                                      |
| `NEXT_PUBLIC_APP_NAME`                 | App display name                                 | Your project name                                        |

## Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript type checking
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Database
npm run db:reset         # Reset local DB (apply all migrations)
npm run db:push          # Push migrations to production
npm run db:types         # Regenerate TypeScript types from schema
npm run db:migration     # Create a new migration file
```

## Project Structure

```
app/                     Routes (App Router)
  (auth)/                Public auth pages (login, signup, etc.)
  (main)/                Authenticated app pages
  api/                   API routes (webhooks only)
actions/                 Server Actions (primary backend pattern)
components/              Shared UI components
  ui/                    shadcn/ui components (23 installed)
  layouts/               App shell (sidebar, header)
  shared/                Reusable components (PageHeader, FileUpload, etc.)
lib/                     Utilities, clients, helpers
  supabase/              4 Supabase clients (server, client, middleware, admin)
  stripe/                Stripe server + client utilities
  validations/           Zod schemas
config/                  App configuration (site, navigation, stripe)
emails/                  React Email templates
supabase/                Supabase project files
  migrations/            SQL migrations
  templates/             Custom auth email templates
types/                   TypeScript definitions (database.types.ts is auto-generated)
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) — Project instructions and conventions
- [GUIDE_PLATFORM_SPEC.md](./GUIDE_PLATFORM_SPEC.md) — Product spec, data model, and roadmap
- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) — Kit architecture and feature specs

## Local URLs

| Service          | URL                                       |
| ---------------- | ----------------------------------------- |
| Next.js          | [localhost:3000](http://localhost:3000)   |
| Supabase Studio  | [localhost:54323](http://localhost:54323) |
| Supabase API     | [localhost:54321](http://localhost:54321) |
| Inbucket (email) | [localhost:54324](http://localhost:54324) |
