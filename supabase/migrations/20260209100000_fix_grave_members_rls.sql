-- Fix infinite recursion in grave_members RLS policies.
-- The SELECT policy was self-referencing (querying grave_members to authorize
-- a read on grave_members), causing recursion when other policies joined to it.

-- Replace self-referencing read policy with direct user_id check.
-- A user can see all members of graves they belong to.
drop policy "Members: member read" on public.grave_members;
create policy "Members: member read"
  on public.grave_members for select
  using (user_id = auth.uid());

-- Also fix the insert policy: the old one required an existing owner row,
-- but the trigger (SECURITY DEFINER) handles the first member. This policy
-- is for manual invites — owner adds another member.
drop policy "Members: owner insert" on public.grave_members;
create policy "Members: owner insert"
  on public.grave_members for insert
  with check (
    auth.uid() in (
      select gm.user_id from public.grave_members gm
      where gm.grave_id = grave_members.grave_id
        and gm.role = 'owner'
    )
  );

-- Fix delete policy similarly to avoid self-reference.
drop policy "Members: owner delete" on public.grave_members;
create policy "Members: owner delete"
  on public.grave_members for delete
  using (
    auth.uid() in (
      select gm.user_id from public.grave_members gm
      where gm.grave_id = grave_members.grave_id
        and gm.role = 'owner'
    )
  );
