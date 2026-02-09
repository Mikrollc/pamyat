create or replace function public.map_graves()
returns table (
  id uuid,
  slug text,
  person_name text,
  lat double precision,
  lng double precision
)
language sql stable security definer
as $$
  select
    g.id,
    g.slug,
    g.person_name,
    ST_Y(g.location::geometry) as lat,
    ST_X(g.location::geometry) as lng
  from public.graves g
  where g.deleted_at is null
    and g.is_public = true;
$$;
