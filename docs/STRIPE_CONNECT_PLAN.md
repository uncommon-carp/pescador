# Stripe Connect Integration Plan

## Overview

Pescador has **two distinct Stripe relationships**:

1. **SaaS billing** (already built in the kit) — Guide companies pay Pescador a monthly subscription fee. This uses standard Stripe Checkout + Customer Portal. No changes needed.

2. **Stripe Connect** (to be built) — Clients pay guide companies for bookings *through* Pescador. Pescador facilitates the payment and takes a transaction fee. This is the core of the platform.

These are separate concerns. A guide company is both a **Stripe Customer** (they pay us) and a **Stripe Connected Account** (clients pay them through us).

---

## Key Decisions

### Connect Account Type: Express

| Option | Pros | Cons |
|--------|------|------|
| **Standard** | Guides get full Stripe dashboard, may already have accounts | Less control over onboarding UX, harder to enforce platform rules |
| **Express** | Stripe-hosted onboarding, KYC handled, clean embedded dashboard | Guides don't get a full standalone Stripe account |
| **Custom** | Full control | Massive compliance burden, overkill |

**Choice: Express.**

Rationale:
- Fishing/hunting guides are not Stripe power users. They want to get paid, not manage a Stripe dashboard.
- Stripe handles all KYC/identity verification — critical because guides are sole proprietors and small LLCs.
- Express onboarding is a Stripe-hosted flow, so we don't build or maintain identity collection forms.
- Express accounts support the embedded Stripe Connect dashboard component, so guides can see payouts and earnings without leaving Pescador.
- If a guide already has a standalone Stripe account, Express still works — they just connect it during onboarding.

### Charge Type: Destination Charges

| Option | How It Works | Fits Pescador? |
|--------|-------------|----------------|
| **Direct charges** | Created on connected account, application_fee flows to platform | Better when the connected account "owns" the customer relationship |
| **Destination charges** | Created on platform account, funds transfer to connected account | Better when the platform owns the checkout experience |
| **Separate charges & transfers** | Platform charges, then manually transfers | Most flexible, most complex |

**Choice: Destination charges.**

Rationale:
- Pescador owns the checkout experience (public booking pages are our UI).
- The PaymentIntent is created on Pescador's account with `transfer_data.destination` pointing to the guide company's connected account.
- `application_fee_amount` specifies Pescador's cut — deducted automatically before transfer.
- Refunds are initiated from Pescador's side (simpler than coordinating with connected accounts).
- Client's card statement shows Pescador (or a configurable statement descriptor per connected account).

### Deposit Model: Single PaymentIntent per booking action

- **Full payment trips:** One PaymentIntent for the full amount at booking time.
- **Deposit trips:** One PaymentIntent for the deposit amount at booking time. The remaining balance is collected separately — either a second PaymentIntent triggered from the dashboard before the trip, or collected in person by the guide.
- Each PaymentIntent is a separate, trackable transaction with its own `application_fee_amount`.

---

## Connect Onboarding Flow

### Step-by-Step

```
Guide company owner clicks "Connect Stripe" in dashboard
  → Server action: stripe.accounts.create({ type: "express", ... })
  → Server action: stripe.accountLinks.create({ account, type: "account_onboarding", ... })
  → Redirect to Stripe-hosted onboarding
  → Guide completes identity/bank details on Stripe
  → Redirect back to Pescador (return_url)
  → Server checks account status (charges_enabled, details_submitted)
  → If incomplete: show "Continue Setup" button (re-enter onboarding)
  → If complete: show "Connected" status, enable booking payments
```

### Account Creation Details

```typescript
const account = await stripe.accounts.create({
  type: "express",
  country: "US",                    // US-only for MVP
  email: orgOwnerEmail,
  metadata: {
    organization_id: orgId,
    platform: "pescador",
  },
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  business_type: "individual",      // Most guides are sole proprietors
  // Don't prefill business_profile — let Stripe's onboarding collect it
})
```

### Account Link (Onboarding URL)

```typescript
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${baseUrl}/organizations/${orgId}/connect?refresh=true`,
  return_url: `${baseUrl}/organizations/${orgId}/connect?onboarding=complete`,
  type: "account_onboarding",
})
// Redirect user to accountLink.url
```

### Return URL Handling

When the guide returns from Stripe onboarding, we **cannot trust the URL alone** — the guide may have closed the tab early. Always verify:

```typescript
const account = await stripe.accounts.retrieve(stripeAccountId)
// Check: account.charges_enabled && account.details_submitted
```

- `details_submitted: true` — Guide completed the onboarding form.
- `charges_enabled: true` — Stripe has verified the account and it can accept payments.
- If `details_submitted: false`, the guide bailed partway through — show "Continue Setup" which generates a new account link.

### Refresh URL

If the account link expires (they're single-use and time-limited), Stripe redirects to `refresh_url`. This route should generate a fresh account link and redirect again.

---

## Client Booking Payment Flow

### Step-by-Step

```
Client visits /book/[company_slug]/
  → Browses trip types (public, no auth)
  → Selects trip, date, party size
  → Enters contact info (name, email, phone)
  → Clicks "Book & Pay"
  → Server action: create booking record (status: "pending")
  → Server action: create Stripe Checkout Session (destination charge)
  → Redirect to Stripe-hosted checkout
  → Client enters card details on Stripe
  → Stripe processes payment
  → Webhook: checkout.session.completed
  → Update booking status, store payment_intent_id
  → Send confirmation email to client + notification to guide company
  → Redirect to confirmation page
```

### Why Stripe Checkout (not Payment Intents + Elements)?

- Stripe Checkout is a hosted page — no PCI scope increase, no building card forms.
- The kit already uses this pattern for subscriptions.
- Handles 3D Secure, Apple Pay, Google Pay, Link out of the box.
- We can add Stripe Elements later for an embedded experience if needed.

### Checkout Session Creation

```typescript
const session = await stripe.checkout.sessions.create({
  mode: "payment",                          // One-time, not subscription
  customer_email: clientEmail,              // Pre-fill on checkout page
  line_items: [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${tripName} — ${companyName}`,
          description: `${formattedDate} · ${partySize} guest(s)`,
        },
        unit_amount: amountInCents,          // Deposit or full amount
      },
      quantity: 1,
    },
  ],
  payment_intent_data: {
    application_fee_amount: feeInCents,     // Pescador's cut
    transfer_data: {
      destination: connectedAccountId,       // Guide company's Express account
    },
    metadata: {
      booking_id: bookingId,
      organization_id: orgId,
    },
  },
  metadata: {
    booking_id: bookingId,
    organization_id: orgId,
    payment_type: isDeposit ? "deposit" : "full",
  },
  success_url: `${baseUrl}/book/${companySlug}/confirmation?booking=${bookingId}`,
  cancel_url: `${baseUrl}/book/${companySlug}/?canceled=true`,
})
```

### Platform Fee Calculation

```typescript
function calculatePlatformFee(amountInCents: number): number {
  // Example: 5% platform fee
  // Actual percentage TBD — stored in config, not hardcoded
  return Math.round(amountInCents * PLATFORM_FEE_PERCENTAGE)
}
```

The fee applies to whatever is charged through Stripe (deposit or full amount). If a deposit is $100 and the platform fee is 5%, Pescador gets $5 from the deposit transaction. If the remaining balance is collected in person, Pescador gets no fee on that portion — this incentivizes guide companies to collect full payment through the platform.

---

## Balance Collection (Deposit Trips)

When a trip has a deposit and the remaining balance is due:

### Option A: Dashboard-Triggered Payment Link (MVP)

1. Guide company sees "Balance Due: $X" on the booking in their dashboard (calculated from `amount_total_cents - amount_paid_cents`).
2. Clicks "Send Payment Link."
3. Server action creates a new `booking_payments` row (`payment_type: 'balance'`, `status: 'pending'`) and a Stripe Checkout Session for the remaining amount.
4. Client receives email with payment link.
5. Client pays. Webhook updates `booking_payments` row to `succeeded`, rolls up `bookings.amount_paid_cents` and `bookings.payment_status` → `paid`.

### Option B: Automatic Balance Collection (Post-MVP)

- Schedule a payment link email N days before the trip date.
- Or use a saved payment method (requires SetupIntent at initial booking — adds complexity).

**MVP choice: Option A.** Manual trigger, simple, no saved payment methods.

---

## Refunds & Cancellations

### Platform-Initiated Refunds

Since we use destination charges, refunds are issued from Pescador's account:

```typescript
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: refundAmountInCents,              // Partial or full
  reverse_transfer: true,                    // Pull funds back from connected account
  refund_application_fee: true,              // Refund Pescador's fee too (configurable)
})
```

### Refund Scenarios

| Scenario | Refund Amount | Reverse Transfer? | Refund App Fee? |
|----------|--------------|-------------------|-----------------|
| Client cancels within policy window | Full | Yes | Yes |
| Client cancels outside policy window | Per policy (partial or none) | Proportional | Proportional |
| Guide company cancels | Full | Yes | Yes |
| Weather cancellation | Full | Yes | Yes — not the guide's fault |
| No-show | Per policy | Per policy | Per policy |
| Dispute/chargeback | Handled by Stripe | Automatic | Automatic |

### Cancellation Policy Enforcement

The cancellation policy (strict/moderate/flexible) determines the refund amount:

```typescript
interface CancellationPolicy {
  type: "strict" | "moderate" | "flexible" | "custom"
  // Hours before trip start when free cancellation ends
  freeCancellationWindow: number
  // Percentage refunded after free window closes (0-100)
  lateCancellationRefundPercent: number
}

// Examples:
// Flexible: 24hr free cancel, 50% after that
// Moderate: 48hr free cancel, 25% after that
// Strict:   72hr free cancel, 0% after that
```

---

## Webhook Events (Connect-Specific)

### New Events to Handle

Add these to the existing webhook handler:

| Event | Action |
|-------|--------|
| `checkout.session.completed` (Connect) | Update `booking_payments` row: set `status: succeeded`, store `stripe_payment_intent_id`. Roll up `bookings.amount_paid_cents` and `bookings.payment_status`. Send confirmation email. Differentiate from subscription checkout by checking `mode === "payment"` and presence of `booking_id` in metadata. |
| `payment_intent.succeeded` | Backup confirmation — update `booking_payments` if webhook race condition with checkout.session.completed. |
| `charge.refunded` | Update `booking_payments.status` and `refunded_amount_cents`. Roll up to `bookings.payment_status`. Send refund confirmation email to client. |
| `charge.dispute.created` | Flag booking as disputed, notify guide company. |
| `account.updated` | Update `charges_enabled` / `details_submitted` on `stripe_connect_accounts`. Catches async verification changes. |
| `payout.paid` | Optional — surface payout status in guide company dashboard. |
| `payout.failed` | Notify guide company that their bank transfer failed. |

### Webhook Routing

The existing webhook endpoint handles SaaS subscription events. Connect events come to the **same endpoint** (same webhook secret) but we need to route them:

```typescript
// In the webhook handler switch statement:
switch (event.type) {
  // --- Existing SaaS billing events ---
  case "customer.subscription.updated":
  case "customer.subscription.deleted":
  case "invoice.payment_failed":
  case "customer.subscription.trial_will_end":
    handleSubscriptionEvent(event)
    break

  // --- Connect booking events ---
  case "checkout.session.completed":
    // Route based on mode
    const session = event.data.object
    if (session.mode === "subscription") {
      handleSubscriptionCheckout(session)
    } else if (session.mode === "payment" && session.metadata?.booking_id) {
      handleBookingCheckout(session)
    }
    break

  case "charge.refunded":
  case "charge.dispute.created":
    handleBookingChargeEvent(event)
    break

  case "account.updated":
    handleConnectAccountUpdate(event)
    break

  // ... etc
}
```

### Connect Webhook Considerations

- **Account-level events** (like `account.updated`) are sent to Connect webhooks automatically.
- **Payment events on destination charges** are sent to the platform's webhook endpoint (not the connected account's), which is what we want.
- We may want a **separate webhook endpoint** for Connect events (`/api/webhooks/stripe-connect/`) to keep the handler clean. Both endpoints verify with different webhook secrets (configured separately in Stripe Dashboard). This is the cleaner approach.

**Recommendation: Separate endpoints.**

```
/api/webhooks/stripe/          → SaaS subscription events (existing)
/api/webhooks/stripe-connect/  → Connect payment + account events (new)
```

---

## Database Changes

### New Table: `stripe_connect_accounts`

```sql
CREATE TABLE stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  details_submitted BOOLEAN NOT NULL DEFAULT false,
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_org_connect_account UNIQUE (organization_id)
);

CREATE INDEX idx_connect_accounts_stripe_id ON stripe_connect_accounts(stripe_account_id);
CREATE INDEX idx_connect_accounts_org_id ON stripe_connect_accounts(organization_id);

-- RLS: Only org owners/admins can view their Connect account status
ALTER TABLE stripe_connect_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their connect account"
  ON stripe_connect_accounts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

### Booking Payments Table (separate from `bookings`)

Payment tracking lives in a dedicated `booking_payments` table. One booking can have multiple payment records (deposit → balance, or a single full payment). Each row maps to one Stripe Checkout Session.

```sql
-- See GUIDE_PLATFORM_SPEC.md Data Model for full schema.
-- Key fields per payment row:
--   booking_id, organization_id (denormalized for RLS)
--   payment_type: 'deposit' | 'balance' | 'full'
--   amount_cents, platform_fee_cents
--   stripe_checkout_session_id, stripe_payment_intent_id
--   status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded'
--   refunded_amount_cents
```

The `bookings` table carries summary fields (`amount_total_cents`, `amount_paid_cents`, `deposit_cents`, `payment_status`) that are rolled up from `booking_payments` when a webhook fires. This keeps booking reads fast while `booking_payments` serves as the audit trail.

Note: `payment_status` is separate from booking `status`. A booking can be `confirmed` with `payment_status: deposit_paid`. This avoids overloading a single status field.

---

## Server Actions (New)

### `actions/connect.ts`

| Action | Purpose | Auth |
|--------|---------|------|
| `createConnectAccount(orgId)` | Create Express account, return onboarding URL | Owner/Admin |
| `createConnectAccountLink(orgId)` | Generate new onboarding link (for refresh/continue) | Owner/Admin |
| `getConnectAccountStatus(orgId)` | Check account status (charges_enabled, etc.) | Owner/Admin |
| `createConnectLoginLink(orgId)` | Generate Express dashboard login link | Owner/Admin |

### `actions/booking-payments.ts`

| Action | Purpose | Auth |
|--------|---------|------|
| `createBookingCheckout(bookingId)` | Create Checkout Session for a pending booking | Public (no auth — client-facing) |
| `createBalancePaymentLink(bookingId)` | Create Checkout Session for remaining balance | Owner/Admin/Guide |
| `refundBooking(bookingId, amount?)` | Issue full or partial refund | Owner/Admin |

---

## UI Touchpoints

### Guide Company Dashboard

1. **Connect Setup Page** (`/organizations/[org_id]/connect/`)
   - Status card: Not connected / Onboarding incomplete / Connected
   - "Connect with Stripe" or "Continue Setup" button
   - Once connected: link to Express dashboard, charges_enabled badge, payouts_enabled badge

2. **Booking Detail** — shows payment status, payment intent link, refund button

3. **Billing Page** — existing page unchanged; Connect is a separate concern from the platform subscription

### Public Booking Flow

1. **Trip Selection** — shows price, deposit info if applicable
2. **Booking Form** — client info + date/party size
3. **Checkout** — redirects to Stripe Checkout (Stripe-hosted)
4. **Confirmation** — shows booking details, "you'll receive a confirmation email"

---

## Pre-Flight Checklist (Before Building)

- [ ] Create Stripe account for Pescador (platform account)
- [ ] Enable Connect in Stripe Dashboard (Settings → Connect)
- [ ] Configure Express account settings (branding, payout schedule, statement descriptor)
- [ ] Set platform-level branding in Connect settings (logo, colors, business name)
- [ ] Create Connect webhook endpoint in Stripe Dashboard (separate from subscription webhook)
- [ ] Decide on platform fee percentage
- [ ] Decide on payout schedule for connected accounts (daily, weekly, manual)
- [ ] Set up Stripe CLI for local webhook testing (`stripe listen --forward-to`)

---

## Testing Strategy

### Local Development

- **Stripe CLI:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe-connect/`
- **Test mode:** All development uses Stripe test mode keys.
- **Test Connect accounts:** Stripe provides test account numbers for Express onboarding.
- **Test cards:** `4242 4242 4242 4242` for success, `4000 0000 0000 9995` for decline.

### Key Scenarios to Test

1. **Happy path:** Connect onboarding → trip created → client books → payment succeeds → booking confirmed
2. **Incomplete onboarding:** Guide starts onboarding but doesn't finish → return URL → "Continue Setup"
3. **Payment failure:** Client's card declines → booking stays pending → client can retry
4. **Deposit flow:** Client pays deposit → guide sends balance link → client pays remainder
5. **Refund:** Guide cancels trip → platform issues refund → funds reversed
6. **Dispute:** Client files chargeback → booking flagged → Connect handles evidence
7. **Connect account disabled:** Stripe disables account (compliance) → block new bookings for that company
8. **Webhook replay:** Idempotent handling — same event processed twice doesn't double-update

---

## Implementation Order

This maps to the MVP roadmap item #1 (Stripe Connect onboarding) and feeds into items #4-5 (Bookings, Public booking flow):

1. **Database migration** — `stripe_connect_accounts` table + RLS
2. **Server actions** — `createConnectAccount`, `createConnectAccountLink`, `getConnectAccountStatus`
3. **Connect onboarding UI** — Dashboard page with status + onboarding button
4. **Connect webhook endpoint** — Handle `account.updated` events
5. **Booking checkout action** — `createBookingCheckout` (depends on bookings table existing)
6. **Connect payment webhook** — Handle `checkout.session.completed` for bookings
7. **Refund action** — `refundBooking`
8. **Balance payment link** — `createBalancePaymentLink`
9. **Express dashboard link** — So guides can see their payouts in Stripe

Steps 1-4 can be built as soon as we start. Steps 5-6 depend on the trips and bookings tables existing. Steps 7-9 round out the payment lifecycle.
