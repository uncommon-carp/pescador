# Freelance Kit - Technical Specification

**Version:** 2.0
**Last Updated:** February 9, 2026
**Purpose:** Reusable foundation for shipping client MVPs in 14 days

---

## Executive Summary

A batteries-included Next.js template for building full-stack web applications quickly and predictably. Optimized for solo freelancers delivering MVPs to founders, small businesses, and internal tool projects.

**Target Scale:** 100s to 1,000s of users per deployment  
**Target Timeline:** 14-day MVP delivery  
**Philosophy:** Predictable and repeatable over clever and complex

---

## Core Architecture Decisions

### Repository Structure

**Decision:** Single repository (not monorepo)

**Rationale:**

- Faster project initialization
- Simpler mental model
- Single deployment pipeline
- Easier client handoff
- No monorepo tooling overhead

**Structure:**

```
freelance-kit/
├── app/                    # Next.js App Router (routes)
├── components/             # Shared UI components
├── actions/                # Server Actions
├── lib/                    # Utilities, clients, helpers
├── types/                  # TypeScript definitions
├── hooks/                  # Custom React hooks
├── emails/                 # React Email templates
├── config/                 # App configuration
├── supabase/              # Supabase project files
│   ├── migrations/        # SQL migrations
│   ├── functions/         # Edge Functions (Deno)
│   └── config.toml        # Supabase config
└── public/                # Static assets
```

### Technology Stack

#### Frontend

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 4 (CSS-based config via `@theme` in `app/globals.css`)
- **UI Components:** shadcn/ui v3+ (installed, not dependency) - uses `sonner` for toasts
- **Icons:** Lucide React + Radix UI Icons
- **Deployment:** Vercel

#### Backend

- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Edge Functions:** Supabase Edge Functions (Deno)
- **API Pattern:** Server Actions (primary), API Routes (webhooks only)

#### Payments

- **Provider:** Stripe
- **Integration:** Checkout + Customer Portal
- **Webhooks:** Via Next.js API Route (`app/api/webhooks/stripe/route.ts`)

#### Email

- **Provider:** Resend
- **Templates:** React Email components

#### Validation

- **Schema:** Zod
- **Forms:** React Hook Form + @hookform/resolvers

---

## Complete Package Dependencies

See `package.json` for exact versions. Key packages:

- `next` 16.x, `react` 19.x, `typescript` 5.x
- `@supabase/supabase-js`, `@supabase/ssr` - Supabase integration
- `stripe`, `@stripe/stripe-js` - Payments
- `resend`, `@react-email/components` - Email
- `tailwindcss` v4, `tailwind-merge`, `clsx`, `class-variance-authority` - Styling
- `radix-ui` (unified package), `lucide-react` - Icons/primitives
- `react-hook-form`, `@hookform/resolvers`, `zod` v4 - Forms & validation
- `sonner` - Toast notifications
- `date-fns`, `nanoid`, `slugify` - Utilities
- `prettier`, `prettier-plugin-tailwindcss`, `supabase`, `shadcn` - Dev tools

### shadcn/ui Components to Install

```bash
npx shadcn@latest add button input label form card dialog dropdown-menu select checkbox textarea avatar badge separator skeleton sonner table tabs alert sheet tooltip breadcrumb sidebar scroll-area
```

> **Note:** `toast` is deprecated in shadcn/ui v3+. Use `sonner` instead.

---

## Multi-Tenant Architecture

### Data Model

**Core Tables:**

```sql
-- organizations (or workspaces/teams - pick one term)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- organization_members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Pattern for all domain tables:**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- other fields --
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row-Level Security (RLS)

**Organizations:**

```sql
-- Users can read organizations they own or are members of
-- NOTE: owner_id check is needed so INSERT ... RETURNING works
-- before the organization_members row is created
CREATE POLICY "Users can view their organizations"
ON organizations FOR SELECT
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organizations.id
    AND organization_members.user_id = auth.uid()
  )
);

-- Only owners can update their organization
CREATE POLICY "Owners can update their organization"
ON organizations FOR UPDATE
USING (owner_id = auth.uid());
```

**Domain Tables (example: projects):**

```sql
-- Users can read projects in their organizations
CREATE POLICY "Users can view organization projects"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = projects.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

-- Members can insert projects in their organizations
CREATE POLICY "Members can create projects"
ON projects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = projects.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

-- Only admins/owners can update projects
CREATE POLICY "Admins can update projects"
ON projects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = projects.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('owner', 'admin')
  )
);
```

---

## Pre-Built Features (Definition of Done)

### 1. Authentication Module ✓

**Features:**

- [] Email/password signup
- [] Email/password login
- [] Magic link login
- [] Password reset flow
- [] Email verification
- [] Google OAuth
- [] Session management
- [] Logout functionality

**Implementation:**

- Auth pages: `/login`, `/signup`, `/reset-password`, `/verify-email`
- Middleware for route protection
- Supabase Auth integration with `@supabase/ssr`
- Server/client/middleware Supabase clients

**Files:**

```
app/(auth)/
  ├── login/page.tsx
  ├── signup/page.tsx
  ├── reset-password/page.tsx
  └── verify-email/page.tsx
lib/supabase/
  ├── client.ts
  ├── server.ts
  └── middleware.ts
middleware.ts
```

### 2. Organization/Workspace Module ✓

**Features:**

- [] Create organization
- [] Update organization settings
- [] Delete organization
- [] Invite members via email
- [] Accept/decline invitations
- [] Remove members
- [] Change member roles
- [] Leave organization
- [] Organization switcher UI

**Implementation:**

- Server Actions for all mutations
- RLS policies enforce access control
- Email notifications for invitations
- Token-based invitation acceptance

**Files:**

```
actions/organizations.ts
app/(main)/organizations/
  ├── new/page.tsx
  └── [org_id]/
      ├── settings/page.tsx
      └── members/page.tsx
components/org-switcher.tsx
emails/invitation.tsx
```

### 3. Billing Module (Optional Toggle) ✓

**Features:**

- [x] Stripe Checkout integration
- [x] Subscription plans (configurable via `config/stripe.ts`)
- [x] Customer Portal link
- [x] Webhook handling (subscription events via API route)
- [x] Subscription status sync to database
- [x] Trial period support
- [x] Payment method management (via Customer Portal)
- [x] Cancel subscription (via Customer Portal)

**Implementation:**

- Stripe Checkout sessions (server action creates session, client redirects)
- Customer Portal for self-service (manage, upgrade, cancel)
- API route for webhook signature verification (uses admin Supabase client to bypass RLS)
- Database columns on `organizations`: `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `subscription_plan`, `trial_ends_at`
- Stripe customer created lazily on first checkout

**Files:**

```
actions/billing.ts                              # createCheckoutSession, createPortalSession
app/api/webhooks/stripe/route.ts                # Stripe webhook handler
app/(main)/organizations/[org_id]/billing/
  ├── page.tsx                                  # Billing page (current plan + pricing cards)
  ├── loading.tsx                               # Skeleton
  ├── error.tsx                                 # Error boundary
  └── _components/
      ├── PricingCards.tsx                       # Plan selection cards
      └── ManageSubscriptionButton.tsx           # Portal redirect
lib/stripe/server.ts                            # Server-side Stripe instance
lib/stripe/client.ts                            # Client-side loadStripe singleton
lib/validations/billing.ts                      # Checkout schema
config/stripe.ts                                # Plan config + types
```

**Configuration:**

```typescript
// config/stripe.ts
export const stripePlans = {
  starter: {
    name: "Starter",
    priceId: "price_xxx",
    price: 29,
    features: ["Feature 1", "Feature 2"],
  },
  pro: {
    name: "Pro",
    priceId: "price_yyy",
    price: 99,
    features: ["Feature 1", "Feature 2", "Feature 3"],
  },
}
```

### 4. Email Module ✓

**Features:**

- [x] Welcome email
- [x] Password reset email (custom Supabase template)
- [x] Email verification (custom Supabase template)
- [x] Organization invitation
- [x] Payment receipt
- [x] Trial ending reminder

**Implementation:**

- React Email components with shared layout
- Resend API integration via `sendEmail()` fire-and-forget helper
- Graceful degradation when `RESEND_API_KEY` not set

**Files:**

```
emails/
  ├── _components/
  │   └── email-layout.tsx
  ├── welcome.tsx
  ├── invitation.tsx
  ├── receipt.tsx
  └── trial-ending.tsx
lib/email.ts
```

### 5. Admin Dashboard ✓

**Features:**

- [x] User list with search/filter
- [x] Organization list
- [x] Basic metrics (user count, org count)
- [ ] ~~User impersonation~~ (deferred — session management complexity)

**Implementation:**

- Admin role via `app_metadata.is_admin` (set via SQL or Supabase Studio)
- `SECURITY DEFINER` RPC functions with `is_system_admin()` check
- Called via regular server client (has auth context), not admin client
- `requireAdmin()` returns 404 for non-admins (doesn't leak route existence)
- Admin nav group conditionally shown in sidebar via `isAdmin` prop

**Files:**

```
app/(main)/admin/
  ├── page.tsx                    # Metrics overview (4 cards)
  ├── loading.tsx
  ├── error.tsx
  ├── _components/
  │   ├── SearchInput.tsx         # Reusable search with URL params
  │   └── Pagination.tsx          # Reusable page navigation
  ├── users/
  │   ├── page.tsx                # Paginated user list
  │   └── loading.tsx
  └── organizations/
      ├── page.tsx                # Paginated org list
      └── loading.tsx
lib/admin.ts                      # requireAdmin() + isAdmin()
actions/admin.ts                  # getAdminMetrics, getAdminUsers, getAdminOrganizations
supabase/migrations/..._admin_functions.sql  # 6 SECURITY DEFINER RPCs
```

### 6. User Settings ✓

**Features:**

- [x] Update profile (display name)
- [x] Update profile avatar (Supabase Storage, Sprint 8)
- [x] Change email (with double-confirm flow)
- [x] Change password
- [x] Delete account (password verification, owned-org check, admin client deletion)
- [ ] Connected accounts (OAuth)

**Implementation:**

- Tab navigation layout (Profile / Security)
- Server Actions with Zod validation
- Settings link in UserMenu dropdown
- Change email sends confirmation to both old and new addresses (`double_confirm_changes = true`)
- Delete account: verifies password, blocks if user owns orgs, deletes via admin client, clears session

**Files:**

```
app/(main)/settings/
  ├── layout.tsx                  # Tab nav (client component)
  ├── page.tsx                    # Profile settings (avatar + name + email)
  ├── loading.tsx
  ├── error.tsx
  ├── _components/
  │   ├── AvatarUpload.tsx
  │   ├── UpdateProfileForm.tsx
  │   └── ChangeEmailForm.tsx
  └── security/
      ├── page.tsx                # Security settings (password + delete)
      ├── loading.tsx
      └── _components/
          ├── ChangePasswordForm.tsx
          └── DeleteAccountSection.tsx
actions/settings.ts               # updateProfile, changePassword, changeEmail, deleteAccount, uploadAvatar, removeAvatar
lib/validations/settings.ts       # Zod schemas (4 total)
lib/storage.ts                    # uploadAvatar, deleteAvatar helpers
```

### 7. File Upload Module ✓

**Features:**

- [x] Upload to Supabase Storage (avatars bucket)
- [x] File type validation (JPEG, PNG, WebP — client + server)
- [x] Size limit enforcement (2MB — client + server)
- [x] Image preview (current avatar displayed)
- [x] Delete files (remove avatar action)
- [x] Access control via storage RLS policies (users can only write to own `{user_id}/` path)

**Implementation:**

- `avatars` bucket configured in `config.toml` (public, 2MiB limit)
- Storage RLS policies: public read, authenticated write scoped to `(storage.foldername(name))[1] = auth.uid()`
- Path convention: `{user_id}/avatar` (one file per user, upsert on re-upload)
- Avatar URL stored in `user_metadata.avatar_url` (Supabase Auth)
- Cache-busting via `?t=` timestamp query param on upload
- `FileUpload` is a reusable component (accepts `accept`, `maxSize`, `onUpload`, `children`)
- Avatar displayed in sidebar `UserMenu` and settings page

**Files:**

```
components/shared/FileUpload.tsx    # Reusable click-to-upload wrapper
lib/storage.ts                      # uploadAvatar, deleteAvatar helpers
supabase/migrations/..._storage_avatars.sql  # Storage RLS policies
```

### 8. UI Component Library ✓

**Components (all from shadcn/ui — 23 installed):**

- [x] Forms (Input, Label, Textarea, Select, Checkbox, Form)
- [x] Buttons (variants: default, destructive, outline, ghost, link)
- [x] Cards
- [x] Dialogs/Modals
- [x] Dropdown Menus
- [x] Tables
- [x] Toast notifications (Sonner)
- [x] Avatars
- [x] Badges
- [x] Tabs
- [x] Alerts
- [x] Skeletons (loading states)
- [x] Separators
- [x] Sheet (slide-out panel, used by sidebar on mobile)
- [x] Tooltip (icon-only sidebar items)
- [x] Breadcrumb (page-level navigation context)
- [x] Sidebar (collapsible, cookie-persisted, keyboard shortcut)
- [x] Scroll Area (sidebar content overflow)

**Custom Components:**

- [x] `EmptyState` — dashed border, centered icon/title/description/CTA
- [x] `ErrorDisplay` — destructive icon, error message, retry button
- [x] `PageHeader` — reusable h1 + description + action buttons
- [x] `AppSidebar` — sidebar with brand, nav groups, OrgSwitcher, UserMenu
- [x] `AppHeader` — SidebarTrigger + auto-generated breadcrumbs
- [x] `UserMenu` — avatar + email dropdown with sign-out

**Files:**

```
components/
  ├── ui/          # shadcn components (23)
  ├── forms/       # Form wrappers
  ├── layouts/     # AppSidebar, AppHeader
  └── shared/      # OrgSwitcher, UserMenu, PageHeader, EmptyState, ErrorDisplay
```

---

## Security Defaults

### Authentication

- [x] Supabase Auth with secure session handling
- [x] HTTP-only cookies for session tokens
- [x] CSRF protection via Supabase SDK
- [x] Email verification required (configurable)
- [x] Rate limiting on auth endpoints

### Authorization

- [x] Row-Level Security (RLS) as primary boundary
- [x] Server-side auth checks in Server Actions
- [x] Middleware for route protection
- [x] Role-based access control (RBAC)

### Input Validation

- [x] Zod schemas for all inputs
- [x] Client-side validation (UX)
- [x] Server-side validation (security)
- [x] SQL injection protection (Supabase parameterized queries)

### API Security

- [x] Environment variables never exposed to client
- [x] Stripe webhook signature verification
- [x] CORS configured in Supabase
- [x] Rate limiting via Upstash Redis (optional, documented)

### Data Protection

- [x] Sensitive data encrypted at rest (Supabase default)
- [x] HTTPS only (enforced by Vercel/Supabase)
- [x] Content Security Policy headers
- [x] Secure file upload policies

---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone from template
gh repo create client-project --template username/freelance-kit
cd client-project

# 2. Install dependencies
npm install

# 3. Initialize Supabase
npx supabase init
npx supabase start  # Starts Docker containers

# 4. Run migrations
npx supabase db reset

# 5. Generate TypeScript types (grep strips spurious stdout line)
npx supabase gen types typescript --local 2>&1 | grep -v "^Connecting to" > types/database.types.ts

# 6. Copy environment variables
cp .env.example .env.local
# Fill in Supabase local values

# 7. Start Next.js
npm run dev
```

**Local URLs:**

- Next.js: <http://localhost:3000>
- Supabase Studio: <http://localhost:54323>
- Supabase API: <http://localhost:54321>

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
```

### Database Migrations

```bash
# Create new migration
npx supabase migration new add_projects_table

# Edit migration file in supabase/migrations/

# Apply locally
npx supabase db reset

# Apply to production
npx supabase db push

# Generate types after schema change (grep strips spurious stdout line)
npx supabase gen types typescript --local 2>&1 | grep -v "^Connecting to" > types/database.types.ts
```

### Deployment

**Vercel (Next.js):**

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

**Supabase:**

1. Create project in Supabase dashboard
2. Link local project: `npx supabase link --project-ref your-project`
3. Push migrations: `npx supabase db push`
4. Deploy edge functions: `npx supabase functions deploy function-name` (if any)

**Stripe:**

1. Add webhook endpoint in Stripe dashboard: `https://your-app.vercel.app/api/webhooks/stripe`
2. Copy webhook signing secret to environment variables
3. For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Configuration Files

### Tailwind CSS (v4 - CSS-based config)

Tailwind v4 does not use `tailwind.config.ts`. All configuration lives in `app/globals.css` via `@theme` blocks and CSS custom properties. Brand colors are customized by editing the CSS variables in `:root` and `.dark` sections.

### next.config.ts

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
```

### eslint.config.mjs (flat config)

ESLint v9 uses flat config format. Generated by `create-next-app` with `core-web-vitals` and `typescript` configs.

### .prettierrc

```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## Project Customization Checklist

When starting a new client project:

### Branding (30 minutes)

- [ ] Update `config/site.ts` (name, description, URLs)
- [ ] Replace logo in `public/logo.svg`
- [ ] Update Tailwind brand colors in `app/globals.css` (CSS variables)
- [ ] Update favicon
- [ ] Customize email templates with client branding

### Environment Setup (15 minutes)

- [ ] Create Supabase project
- [ ] Create Stripe account (if needed)
- [ ] Create Resend account
- [ ] Add all environment variables to Vercel
- [ ] Link Supabase project locally

### Feature Configuration (15 minutes)

- [ ] Enable/disable billing module
- [ ] Configure OAuth providers
- [ ] Set up Stripe products/prices
- [ ] Configure email settings
- [ ] Adjust RLS policies if needed

### Domain Model (varies)

- [ ] Design domain-specific tables
- [ ] Create migrations
- [ ] Generate types
- [ ] Add RLS policies
- [ ] Build CRUD Server Actions

### Total setup time: ~1-2 hours before client-specific development begins

---

## Development Sprint Plan

### Sprint 0: Foundation (1-2 days) -- COMPLETE

**Goal:** Get the kit itself built and ready to clone

- [x] Initialize Next.js project
- [x] Install all dependencies
- [x] Configure Tailwind + shadcn/ui (18 components)
- [x] Set up Prettier, ESLint
- [x] Create file structure
- [x] Initialize Supabase (local)
- [x] Configure environment variables template
- [x] Deploy to Vercel
- [ ] Set up GitHub template repository

### Sprint 1: Authentication (2-3 days)

**Goal:** Complete auth flows

- [x] Supabase client configuration (server/client/middleware/admin)
- [x] Middleware for route protection (with env var guard)
- [x] Auth pages (login, signup, reset, verify)
- [x] Session management
- [x] OAuth providers (Google)
- [x] Email templates for auth flows (custom Supabase templates in Sprint 7)
- [x] Test all auth flows

### Sprint 2: Multi-Tenancy (2-3 days) -- COMPLETE

**Goal:** Organization system works end-to-end

- [x] Database schema (organizations, members, invitations)
- [x] RLS policies (with SECURITY DEFINER helpers to avoid recursion)
- [x] Type generation
- [x] Create organization flow
- [x] Invite members flow
- [x] Accept invitation flow
- [x] Member management UI
- [x] Organization switcher
- [x] Test all org flows

### Sprint 3: UI Components (2-3 days) -- COMPLETE

**Goal:** Complete component library and app shell

- [x] Install additional shadcn components (sheet, tooltip, breadcrumb, sidebar, scroll-area — 23 total)
- [x] Sidebar app shell (`AppSidebar` with nav groups, `OrgSwitcher`, `UserMenu`)
- [x] `AppHeader` with `SidebarTrigger` + auto-generated breadcrumbs (skips UUID segments)
- [x] Centralized nav config (`config/navigation.ts` with `:org_id` placeholder resolution)
- [x] `PageHeader` component (title, description, action buttons slot)
- [x] `EmptyState` component (icon, title, description, CTA slot)
- [x] `ErrorDisplay` component (destructive icon, message, retry button)
- [x] Loading skeletons (`loading.tsx` for dashboard, members, settings)
- [x] Error boundaries (`error.tsx` for main group, settings, members)
- [x] Global 404 page (`app/not-found.tsx`)
- [x] Sidebar state persisted via `sidebar_state` cookie
- [x] Refactored all existing pages to use `PageHeader`

### Sprint 4: Billing (2-3 days) -- COMPLETE

**Goal:** Stripe integration complete (optional module)

- [x] Stripe configuration
- [x] Checkout flow
- [x] Customer Portal integration
- [x] Webhook handler (API route, not edge function — uses admin client)
- [x] Subscription status sync
- [x] Billing page UI
- [ ] Test with Stripe test mode
- [ ] Document how to disable billing

### Sprint 5: Admin & Settings (2 days) -- COMPLETE

**Goal:** Admin and user settings complete

- [x] User settings pages (profile, security)
- [x] Admin dashboard (metrics overview)
- [x] User list with search + pagination
- [x] Organization list with search + pagination
- [x] Basic metrics (total users, orgs, recent signups, active subscriptions)
- [ ] ~~User impersonation~~ (deferred)
- [x] Admin role via `app_metadata.is_admin` + `SECURITY DEFINER` RPCs
- [x] Settings link in UserMenu dropdown
- [x] Admin nav group conditionally shown in sidebar

### Sprint 6: Email (1-2 days) ✅

**Goal:** All transactional emails work

- [x] Resend setup
- [x] Application email templates (4 total — welcome, invitation, receipt, trial ending)
- [x] Email sending utility (`lib/email.ts`)
- [ ] Test all email flows
- [ ] Preview emails in development

### Sprint 7: Remaining Settings + Custom Auth Emails (1-2 days) -- COMPLETE

**Goal:** Complete user settings and custom auth email templates

- [x] Change email (settings) — double-confirm flow, ChangeEmailForm component
- [x] Delete account (settings) — password verification, owned-org check, Dialog confirmation
- [x] Profile avatar upload (completed in Sprint 8)
- [x] Custom password reset email template (replace Supabase default)
- [x] Custom email verification template (replace Supabase default)
- [x] Database migration: `invitations.invited_by` nullable with `ON DELETE SET NULL`

### Sprint 8: File Upload Module (2-3 days) -- COMPLETE

**Goal:** Reusable file upload with Supabase Storage

- [x] Supabase Storage `avatars` bucket setup (config.toml + migration)
- [x] Storage RLS policies (public read, auth user write to own path)
- [x] `lib/storage.ts` helpers (uploadAvatar, deleteAvatar)
- [x] `FileUpload` reusable component (click-to-upload, client-side validation)
- [x] File type validation (JPEG, PNG, WebP — client + server)
- [x] Size limit enforcement (2MB — client + server)
- [x] Image preview (current avatar in AvatarUpload component)
- [x] Delete files (removeAvatar action)
- [x] Wire profile avatar to settings page (AvatarUpload component)
- [x] Wire avatar URL into sidebar UserMenu (AvatarImage with initials fallback)
- [x] next.config.ts updated for local Supabase Storage images

### Sprint 9: Documentation & Polish (1-2 days) -- COMPLETE

**Goal:** Kit is ready to use

- [x] README with setup, deployment, customization, and env var docs
- [x] Deployment guide (Vercel + Supabase + Stripe sections in README)
- [x] Customization checklist (in README)
- [x] .env.example complete (audited — all vars present)
- [x] GitHub Actions CI workflow (lint, type-check, format-check, build)
- [x] Convenience npm scripts (`db:reset`, `db:push`, `db:types`, `db:migration`)
- [x] CLAUDE.md for Claude Code integration (updated with new scripts)

**Total: 17-24 days to build complete kit**

---

## Client Project Timeline (14 days)

### Days 1-2: Setup & Discovery

- Clone kit, configure branding
- Discovery call with client
- Define database schema
- Create migrations, generate types

### Days 3-5: Core Features

- Build domain-specific Server Actions
- Create main user workflows
- Implement business logic
- RLS policies for domain tables

### Days 6-8: User Interface

- Build pages using kit components
- Forms for all workflows
- List/table views
- Detail views

### Days 9-11: Polish

- Error states
- Loading states
- Mobile responsiveness
- Email notifications
- Edge case handling

### Days 12-13: Testing & Refinement

- Client feedback round
- Bug fixes
- Performance optimization
- Security review

### Day 14: Deploy & Handoff

- Production deployment
- Documentation
- Client walkthrough
- Support handoff

---

## Monitoring & Observability

### Free Tier (Every Project)

- Vercel Analytics (built-in)
- Supabase dashboard metrics
- Vercel logs
- Stripe dashboard

### Paid Tier (Optional Upsell)

- Sentry for error tracking (~$26/mo)
- Axiom or Betterstack for logs (~$25-50/mo)
- BetterUptime for uptime monitoring (free tier available)

**Implementation:**

- Pre-integrate but gate with environment variables
- Document how to enable in README
- Make it one-line config change

---

## Pricing Model

### Package Pricing

- **MVP Package:** $8-12k (14 days, core features, deployment)
- **MVP + Billing:** $12-15k (add Stripe integration)
- **Internal Tool:** $6-10k (no auth/billing complexity)

### Retainer

- **Ongoing Support:** $3-5k/month (features, hosting, support)

### Kit ROI

- Saves 3-4 days per project minimum
- Pays for itself in 2-3 projects
- Compounding value over time

---

## Risk Mitigation

### Technical Risks

- **Supabase limits:** Document upgrade path, monitor usage
- **Cold starts:** Cache aggressively, consider warming
- **Complex queries:** Plan for Postgres functions if needed
- **Webhook reliability:** Build retry logic, use Stripe CLI locally

### Project Risks

- **Scope creep:** Feature list sign-off before starting, change orders
- **Schema paralysis:** Dedicate Day 1-2 to schema design with client
- **Design requests:** One design system, color/logo only, charge extra for custom

### Business Risks

- **Feature bloat in kit:** Only add features after building 3x manually
- **Over-engineering:** Resist clever solutions, stick to boring
- **Maintenance burden:** Keep dependencies minimal and updated

---

## Server Actions Pattern

Server Actions are the **primary backend pattern** - use instead of API routes for most operations.

### Basic Pattern

```typescript
// actions/organizations.ts
"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
})

export async function createOrganization(formData: FormData) {
  // 1. Get current user
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // 2. Validate input
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
  }

  const result = createOrgSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // 3. Insert to database
  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      name: result.data.name,
      slug: result.data.slug,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: "Failed to create organization" }
  }

  // 4. Revalidate cached data
  revalidatePath("/dashboard")

  // 5. Redirect to new org
  redirect(`/org/${org.slug}`)
}
```

### When to Use API Routes Instead

- Webhooks (Stripe, etc.)
- Public APIs for external clients
- File uploads requiring special handling
- Non-POST methods (GET endpoints)

---

## Supabase Client Patterns

### Server Component Client

```typescript
// lib/supabase/server.ts
import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component
          }
        },
      },
    }
  )
}
```

### Client Component Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Middleware Client

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

---

## Future Enhancements (Not in v1)

Consider adding after 5+ successful projects:

- [ ] Real-time features (Supabase Realtime)
- [ ] Background jobs (Supabase pg_cron or Inngest)
- [ ] Full-text search (Postgres full-text or Algolia)
- [ ] AI features (OpenAI API integration)
- [ ] Mobile app support (React Native or Expo)
- [ ] Advanced analytics dashboard
- [ ] Internationalization (i18n)
- [ ] Dark mode
- [ ] Automated testing suite
- [ ] End-to-end type safety with tRPC

---

## Success Metrics

### Kit Quality Metrics

- New project setup time < 2 hours
- Zero security vulnerabilities in dependencies
- All core features have working examples
- Documentation clear enough for handoff

### Project Delivery Metrics

- 80% of projects ship within 14 days
- Client satisfaction score > 4.5/5
- Zero production security incidents
- < 5 bugs reported in first month

---

## File Structure Template

```
freelance-kit/
├── .github/
│   └── workflows/
│       └── ci.yml
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── organizations/
│   │   │   ├── new/page.tsx
│   │   │   └── [org_id]/
│   │   │       ├── settings/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   └── error.tsx
│   │   │       ├── members/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   └── error.tsx
│   │   │       └── billing/
│   │   │           ├── page.tsx
│   │   │           ├── loading.tsx
│   │   │           ├── error.tsx
│   │   │           └── _components/
│   │   │               ├── PricingCards.tsx
│   │   │               └── ManageSubscriptionButton.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx           # Metrics overview
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   ├── _components/
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── organizations/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   ├── settings/
│   │   │   ├── layout.tsx         # Tab nav
│   │   │   ├── page.tsx           # Profile settings (name + email)
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   ├── _components/
│   │   │   │   ├── UpdateProfileForm.tsx
│   │   │   │   └── ChangeEmailForm.tsx
│   │   │   └── security/
│   │   │       ├── page.tsx       # Security settings (password + delete)
│   │   │       ├── loading.tsx
│   │   │       └── _components/
│   │   │           ├── ChangePasswordForm.tsx
│   │   │           └── DeleteAccountSection.tsx
│   │   ├── error.tsx
│   │   └── layout.tsx          # SidebarProvider + AppSidebar + SidebarInset
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   ├── not-found.tsx          # Global 404 page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn components (23)
│   │   ├── sidebar.tsx
│   │   ├── breadcrumb.tsx
│   │   └── ...
│   ├── forms/                 # Form components
│   ├── layouts/
│   │   ├── AppSidebar.tsx     # Main sidebar navigation
│   │   └── AppHeader.tsx      # Top bar with breadcrumbs
│   └── shared/
│       ├── OrgSwitcher.tsx
│       ├── UserMenu.tsx
│       ├── PageHeader.tsx
│       ├── EmptyState.tsx
│       ├── ErrorDisplay.tsx
│       └── FileUpload.tsx
├── actions/
│   ├── auth.ts
│   ├── organizations.ts
│   ├── billing.ts
│   ├── admin.ts
│   └── settings.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── admin.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── organizations.ts
│   │   ├── billing.ts
│   │   └── settings.ts
│   ├── admin.ts
│   ├── email.ts
│   ├── storage.ts            # Supabase Storage helpers (avatars)
│   └── utils.ts
├── types/
│   ├── database.types.ts      # Generated - DO NOT EDIT
│   └── index.ts
├── emails/
│   ├── welcome.tsx
│   ├── reset-password.tsx
│   ├── verify-email.tsx
│   ├── invitation.tsx
│   ├── receipt.tsx
│   └── trial-ending.tsx
├── hooks/
│   └── use-mobile.ts           # Mobile detection (used by sidebar)
├── config/
│   ├── site.ts
│   ├── navigation.ts          # Sidebar nav items
│   └── stripe.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260207200810_organizations.sql
│   │   ├── 20260208175523_billing.sql
│   │   ├── 20260209073444_admin_functions.sql
│   │   ├── 20260209224426_account_deletion_prep.sql
│   │   └── 20260209225606_storage_avatars.sql
│   ├── templates/
│   │   ├── confirmation.html   # Custom Supabase auth email
│   │   └── recovery.html       # Custom Supabase auth email
│   ├── functions/         # Edge Functions (if needed)
│   ├── config.toml
│   └── seed.sql
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── .env.example
├── .env.local
├── eslint.config.mjs
├── .gitignore
├── .prettierrc
├── CLAUDE.md
├── README.md
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Changelog

**v2.0 (Current):**

- Sprint 9 (Documentation & Polish) complete — all sprints finished
- README rewritten: setup guide, env var table, deployment (Vercel/Supabase/Stripe), customization checklist
- GitHub Actions CI: lint, type-check, format-check, build on push/PR to main
- Convenience npm scripts: `db:reset`, `db:push`, `db:types`, `db:migration`
- CLAUDE.md updated with new scripts, all sprint statuses current

**v1.9:**

- Sprint 8 (File Upload + Profile Avatar) complete
- Supabase Storage `avatars` bucket with public read, auth-scoped write RLS policies
- `lib/storage.ts` helpers: `uploadAvatar` (upsert + cache-busting), `deleteAvatar`
- Reusable `FileUpload` component (`components/shared/FileUpload.tsx`) — click-to-upload with client-side type/size validation
- `AvatarUpload` settings component with preview, pencil overlay, and remove button
- `uploadAvatar` / `removeAvatar` server actions with server-side validation (2MB, JPEG/PNG/WebP)
- Avatar URL stored in `user_metadata.avatar_url`, displayed in sidebar `UserMenu` via `AvatarImage`
- `next.config.ts` updated with `127.0.0.1` for local Supabase Storage images

**v1.8:**

- Sprint 7 (Remaining Settings + Custom Auth Emails) complete
- Change email with double-confirm flow (`ChangeEmailForm` component)
- Delete account with password verification, owned-org blocking, and Dialog confirmation (`DeleteAccountSection` component)
- Server Actions: `changeEmail`, `deleteAccount` in `actions/settings.ts`
- Database migration: `invitations.invited_by` made nullable with `ON DELETE SET NULL` to unblock user deletion
- Custom Supabase auth email templates: `confirmation.html` and `recovery.html` in `supabase/templates/`
- Templates match React Email visual style (`#f6f9fc` background, `#556cd6` buttons, same font stack)
- `config.toml` updated with `[auth.email.template.confirmation]` and `[auth.email.template.recovery]` sections

**v1.7:**

- Sprint 5 (Admin & Settings) complete
- Admin dashboard with 4 metric cards (total users, orgs, recent signups, active subscriptions)
- Paginated user list with email search (`/admin/users`)
- Paginated organization list with name search (`/admin/organizations`)
- 6 `SECURITY DEFINER` RPC functions: `is_system_admin`, `admin_get_metrics`, `admin_list_users`, `admin_count_users`, `admin_list_organizations`, `admin_count_organizations`
- Admin role via `app_metadata.is_admin` (set via SQL or Supabase Studio)
- `requireAdmin()` helper returns 404 for non-admins
- Admin nav group conditionally shown in sidebar
- User profile settings (display name update)
- Security settings (password change)
- Settings tab navigation layout
- Settings link in UserMenu dropdown

**v1.6:**

- Sprint 6 (Email) complete
- Resend integration with fire-and-forget `sendEmail()` helper (`lib/email.ts`)
- 4 React Email templates: Welcome, Invitation, Receipt, Trial Ending
- Shared email layout component (`emails/_components/email-layout.tsx`)
- Welcome email sent on signup (wired into `actions/auth.ts`)
- Invitation email sent on member invite (wired into `actions/organizations.ts`)
- Receipt email sent on Stripe checkout completed (webhook)
- Trial ending email sent on `customer.subscription.trial_will_end` (webhook)
- Graceful degradation: no `RESEND_API_KEY` = warning log, no crash
- `RESEND_FROM` env var for configurable sender address

**v1.5:**

- Sprint 4 (Billing) complete
- Stripe Checkout + Customer Portal integration
- Webhook handler as Next.js API route (not edge function) using admin Supabase client
- Billing columns on `organizations` table (`stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `subscription_plan`, `trial_ends_at`)
- Billing page with pricing cards, current plan status, manage subscription button
- Server Actions: `createCheckoutSession`, `createPortalSession`
- Stripe utility files (`lib/stripe/server.ts`, `lib/stripe/client.ts`)
- Validation schema (`lib/validations/billing.ts`)
- Loading skeleton + error boundary for billing page
- Billing nav item in sidebar

**v1.4:**

- Sprint 3 (UI Components) complete
- Sidebar app shell replacing minimal top bar (`AppSidebar`, `AppHeader`, `UserMenu`)
- Centralized navigation config (`config/navigation.ts`) with `:org_id` placeholder resolution
- Auto-generated breadcrumbs from pathname (skips UUID segments)
- Reusable page components: `PageHeader`, `EmptyState`, `ErrorDisplay`
- Loading skeletons for dashboard, members, settings pages
- Error boundaries for main app group + individual routes
- Global 404 page
- Sidebar state persisted via `sidebar_state` cookie
- 23 shadcn components (added sheet, tooltip, breadcrumb, sidebar, scroll-area)

**v1.3:**

- Sprint 2 (Multi-Tenancy) complete
- Organizations, members, invitations with full CRUD Server Actions
- RLS policies with SECURITY DEFINER helpers to avoid circular RLS
- Fixed organizations SELECT policy to include `owner_id = auth.uid()` (required for `INSERT ... RETURNING` before membership row exists)
- Active org tracked via httpOnly cookie
- Organization switcher, member management, invitation flow

**v1.2:**

- Sprint 1 (Authentication) complete
- Full auth system: signup, login (password + magic link + Google OAuth), password reset, email verification
- Auth callback route, middleware guards, dashboard placeholder

**v1.1:**

- Updated to Next.js 16, Tailwind v4, Zod v4, ESLint v9 flat config
- Migrated from legacy Supabase anon/service_role keys to publishable/secret keys
- shadcn/ui: `toast` → `sonner` (deprecated component)
- Renamed `(app)` route group to `(main)`
- Added env var guard to middleware for graceful degradation
- Sprint 0 complete, Supabase clients and middleware implemented

**v1.0:**

- Initial architecture decisions
- Complete tech stack defined
- Core features scoped
- Sprint plan outlined
- Server Actions pattern defined
- Supabase client patterns documented
- Configuration files specified

---

**Document Owner:** Cory Sorel
**Review Frequency:** After every 3 client projects  
**Next Review:** [Date after 3rd project]
