-- #103: Invite family — schema migration + RLS fixes
-- Adds 'link' to invite_channel enum, makes recipient nullable,
-- fixes overly permissive RLS, adds token lookup policy,
-- allows editors (not just owners) to create invitations.

-- 1. Add 'link' to invite_channel enum (future-proofing)
ALTER TYPE public.invite_channel ADD VALUE IF NOT EXISTS 'link';

-- 2. Make recipient nullable (for future link-based invites)
ALTER TABLE public.invitations ALTER COLUMN recipient DROP NOT NULL;

-- 3. Drop overly permissive update policy (any authed user can update any pending invite)
DROP POLICY IF EXISTS "Invitations: accept update" ON public.invitations;

-- 4. Add scoped read policy for token lookup (invitees need to look up their invite by token)
CREATE POLICY "Invitations: token lookup"
  ON public.invitations FOR SELECT
  USING (status = 'pending' AND expires_at > now());

-- 5. Replace owner-only insert with owner+editor insert
DROP POLICY IF EXISTS "Invitations: owner insert" ON public.invitations;

CREATE POLICY "Invitations: member insert"
  ON public.invitations FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
    AND EXISTS (
      SELECT 1 FROM public.grave_members
      WHERE grave_members.grave_id = invitations.grave_id
        AND grave_members.user_id = auth.uid()
        AND grave_members.role IN ('owner', 'editor')
    )
  );
