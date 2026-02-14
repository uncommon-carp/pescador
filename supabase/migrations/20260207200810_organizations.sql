-- =============================================================
-- Sprint 2: Multi-Tenancy - Organizations, Members, Invitations
-- =============================================================

-- Helper: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- TABLES
-- =============================================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_org_id ON public.invitations(organization_id);
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);

-- =============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER to avoid RLS recursion)
-- =============================================================

-- Check if a user is a member of an organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID, uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
    AND user_id = uid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get a user's role in an organization
CREATE OR REPLACE FUNCTION public.get_org_role(org_id UUID, uid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = org_id
  AND user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get org members with email (joins auth.users which is not directly queryable)
CREATE OR REPLACE FUNCTION public.get_org_members_with_email(org_id UUID)
RETURNS TABLE (
  id UUID,
  organization_id UUID,
  user_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ,
  email TEXT
) AS $$
  SELECT
    om.id,
    om.organization_id,
    om.user_id,
    om.role,
    om.created_at,
    u.email
  FROM public.organization_members om
  JOIN auth.users u ON u.id = om.user_id
  WHERE om.organization_id = org_id
  AND public.is_org_member(org_id, auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ----- organizations -----

CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (
  owner_id = auth.uid()
  OR public.is_org_member(id, auth.uid())
);

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their organization"
ON public.organizations FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their organization"
ON public.organizations FOR DELETE
USING (owner_id = auth.uid());

-- ----- organization_members -----

CREATE POLICY "Members can view organization members"
ON public.organization_members FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

-- INSERT: org creator adding themselves as owner, OR admin/owner adding members
CREATE POLICY "Org creators and admins can add members"
ON public.organization_members FOR INSERT
WITH CHECK (
  (
    user_id = auth.uid()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = organization_id AND owner_id = auth.uid()
    )
  )
  OR
  (
    public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  )
);

CREATE POLICY "Owners can update member roles"
ON public.organization_members FOR UPDATE
USING (public.get_org_role(organization_id, auth.uid()) = 'owner')
WITH CHECK (public.get_org_role(organization_id, auth.uid()) = 'owner');

-- DELETE: admins/owners remove members, or members leave (self-delete)
CREATE POLICY "Admins can remove members or members can leave"
ON public.organization_members FOR DELETE
USING (
  user_id = auth.uid()
  OR public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
);

-- ----- invitations -----

CREATE POLICY "Members can view organization invitations"
ON public.invitations FOR SELECT
USING (
  public.is_org_member(organization_id, auth.uid())
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can create invitations"
ON public.invitations FOR INSERT
WITH CHECK (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  AND invited_by = auth.uid()
);

CREATE POLICY "Invitations can be updated by admins or invitee"
ON public.invitations FOR UPDATE
USING (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete invitations"
ON public.invitations FOR DELETE
USING (public.get_org_role(organization_id, auth.uid()) IN ('owner', 'admin'));
