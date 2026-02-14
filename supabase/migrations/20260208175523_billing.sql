-- Add billing columns to organizations
ALTER TABLE organizations
  ADD COLUMN stripe_customer_id TEXT UNIQUE,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN subscription_plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN trial_ends_at TIMESTAMPTZ;

-- Index for webhook lookups by Stripe customer ID
CREATE INDEX idx_organizations_stripe_customer_id ON organizations (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
