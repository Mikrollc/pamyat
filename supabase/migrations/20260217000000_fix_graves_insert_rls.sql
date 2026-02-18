-- Fix graves insert policy: add TO authenticated
-- Without this, the policy defaults to PUBLIC (anon) role and
-- authenticated users cannot insert graves.

DROP POLICY "Graves: authenticated insert" ON public.graves;
CREATE POLICY "Graves: authenticated insert"
  ON public.graves FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);
