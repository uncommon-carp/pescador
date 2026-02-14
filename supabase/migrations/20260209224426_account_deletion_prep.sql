-- Make invited_by nullable and change FK to ON DELETE SET NULL
-- so that deleting a user account is not blocked by invitation records.

ALTER TABLE public.invitations
  ALTER COLUMN invited_by DROP NOT NULL;

ALTER TABLE public.invitations
  DROP CONSTRAINT invitations_invited_by_fkey;

ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_invited_by_fkey
  FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;
