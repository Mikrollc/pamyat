create or replace function public.nearby_cemeteries(
  lat double precision,
  lng double precision,
  radius_m double precision default 50000
)
returns setof public.cemeteries
language sql stable
as $$
  select *
  from public.cemeteries
  where ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_m
  )
  order by location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
$$;
