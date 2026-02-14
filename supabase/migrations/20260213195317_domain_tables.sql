-- =============================================================
-- Domain Tables: Trips, Guide Profiles, Bookings, Payments,
--                Availability, Stripe Connect
-- =============================================================

-- =============================================================
-- ALTER organizations — add cancellation policy columns
-- =============================================================

ALTER TABLE public.organizations
  ADD COLUMN cancellation_policy_type TEXT NOT NULL DEFAULT 'moderate',
  ADD COLUMN cancellation_free_window_hours INTEGER NOT NULL DEFAULT 48,
  ADD COLUMN cancellation_late_refund_percent INTEGER NOT NULL DEFAULT 25;

-- =============================================================
-- TABLES
-- =============================================================

-- ----- trips -----

CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT NOT NULL CHECK (duration IN ('morning', 'afternoon', 'full_day')),
  price_cents INTEGER NOT NULL,
  deposit_required BOOLEAN DEFAULT true,
  deposit_cents INTEGER,
  capacity INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  conditions_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----- guide_profiles -----

CREATE TABLE public.guide_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bio TEXT,
  specialties TEXT[],
  certifications TEXT[],
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

-- ----- bookings -----

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id),
  guide_id UUID REFERENCES public.guide_profiles(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'full_day')),
  party_size INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled', 'no_show')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid', 'refunded', 'partially_refunded', 'disputed')),
  amount_total_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER DEFAULT 0,
  deposit_cents INTEGER,
  source TEXT DEFAULT 'client' CHECK (source IN ('client', 'guide')),
  notes TEXT,
  conditions_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----- booking_payments -----

CREATE TABLE public.booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'full')),
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded')),
  refunded_amount_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----- guide_availability -----

CREATE TABLE public.guide_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_profile_id UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'full_day')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (guide_profile_id, date, time_slot)
);

-- ----- stripe_connect_accounts -----

CREATE TABLE public.stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  details_submitted BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_trips_organization_id ON public.trips(organization_id);

CREATE INDEX idx_bookings_organization_id ON public.bookings(organization_id);
CREATE INDEX idx_bookings_trip_id ON public.bookings(trip_id);
CREATE INDEX idx_bookings_guide_id ON public.bookings(guide_id);
CREATE INDEX idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

CREATE INDEX idx_booking_payments_booking_id ON public.booking_payments(booking_id);
CREATE INDEX idx_booking_payments_organization_id ON public.booking_payments(organization_id);
CREATE INDEX idx_booking_payments_stripe_checkout_session_id ON public.booking_payments(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX idx_booking_payments_stripe_payment_intent_id ON public.booking_payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX idx_guide_profiles_user_id ON public.guide_profiles(user_id);
CREATE INDEX idx_guide_profiles_organization_id ON public.guide_profiles(organization_id);

CREATE INDEX idx_guide_availability_guide_profile_id ON public.guide_availability(guide_profile_id);
CREATE INDEX idx_guide_availability_organization_id ON public.guide_availability(organization_id);
CREATE INDEX idx_guide_availability_date ON public.guide_availability(date);

CREATE INDEX idx_stripe_connect_accounts_organization_id ON public.stripe_connect_accounts(organization_id);
CREATE INDEX idx_stripe_connect_accounts_stripe_account_id ON public.stripe_connect_accounts(stripe_account_id);

-- =============================================================
-- TRIGGERS (updated_at)
-- =============================================================

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER guide_profiles_updated_at
  BEFORE UPDATE ON public.guide_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER stripe_connect_accounts_updated_at
  BEFORE UPDATE ON public.stripe_connect_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_connect_accounts ENABLE ROW LEVEL SECURITY;

-- ----- trips -----

CREATE POLICY "Org members can view trips"
ON public.trips FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Admins and owners can create trips"
ON public.trips FOR INSERT
WITH CHECK (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins and owners can update trips"
ON public.trips FOR UPDATE
USING (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'))
WITH CHECK (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins and owners can delete trips"
ON public.trips FOR DELETE
USING (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

-- ----- guide_profiles -----

CREATE POLICY "Org members can view guide profiles"
ON public.guide_profiles FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Admins and owners can create guide profiles"
ON public.guide_profiles FOR INSERT
WITH CHECK (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins, owners, or self can update guide profiles"
ON public.guide_profiles FOR UPDATE
USING (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR user_id = auth.uid()
)
WITH CHECK (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR user_id = auth.uid()
);

CREATE POLICY "Admins and owners can delete guide profiles"
ON public.guide_profiles FOR DELETE
USING (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

-- ----- bookings -----

CREATE POLICY "Org members can view bookings"
ON public.bookings FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Org members can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Admins and owners can update bookings"
ON public.bookings FOR UPDATE
USING (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'))
WITH CHECK (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins and owners can delete bookings"
ON public.bookings FOR DELETE
USING (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

-- ----- booking_payments -----
-- Only SELECT for org members; INSERT/UPDATE handled by service role (webhooks)

CREATE POLICY "Org members can view booking payments"
ON public.booking_payments FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

-- ----- guide_availability -----

CREATE POLICY "Org members can view guide availability"
ON public.guide_availability FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Admins, owners, or self can create availability"
ON public.guide_availability FOR INSERT
WITH CHECK (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR guide_profile_id IN (
    SELECT id FROM public.guide_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins, owners, or self can update availability"
ON public.guide_availability FOR UPDATE
USING (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR guide_profile_id IN (
    SELECT id FROM public.guide_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR guide_profile_id IN (
    SELECT id FROM public.guide_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins, owners, or self can delete availability"
ON public.guide_availability FOR DELETE
USING (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR guide_profile_id IN (
    SELECT id FROM public.guide_profiles WHERE user_id = auth.uid()
  )
);

-- ----- stripe_connect_accounts -----

CREATE POLICY "Org members can view stripe connect accounts"
ON public.stripe_connect_accounts FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Admins and owners can create stripe connect accounts"
ON public.stripe_connect_accounts FOR INSERT
WITH CHECK (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Admins and owners can update stripe connect accounts"
ON public.stripe_connect_accounts FOR UPDATE
USING (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'))
WITH CHECK (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));
