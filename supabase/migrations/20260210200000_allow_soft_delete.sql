-- Soft-delete a grave via SECURITY DEFINER function.
-- The function verifies the caller is an owner before deleting.
-- This avoids RLS complications with the UPDATE policy's WITH CHECK
-- rejecting the row after deleted_at is set.

create or replace function public.soft_delete_grave(p_grave_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Verify caller is owner of this grave
  if not exists (
    select 1 from public.grave_members
    where grave_id = p_grave_id
      and user_id = auth.uid()
      and role = 'owner'
  ) then
    raise exception 'Not authorized to delete this grave';
  end if;

  update public.graves
  set deleted_at = now()
  where id = p_grave_id
    and deleted_at is null;
end;
$$;

-- Allow members to update their own grave_members row (e.g. relationship).
-- Without this, any UPDATE on grave_members is denied by RLS.
create policy "Members: self update"
  on public.grave_members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
