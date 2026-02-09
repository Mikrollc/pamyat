-- 1a. RPC: all_cemeteries (for map discovery layer)
-- Intentionally public: cemetery locations are not private data.
-- No auth required — both anon and authenticated roles can call this.
create or replace function public.all_cemeteries()
returns table (
  id uuid,
  name text,
  name_ru text,
  city text,
  state text,
  lat double precision,
  lng double precision
)
language sql stable
as $$
  select
    c.id, c.name, c.name_ru, c.city, c.state,
    ST_Y(c.location::geometry) as lat,
    ST_X(c.location::geometry) as lng
  from public.cemeteries c
  where c.location is not null;
$$;

-- 1b. Update map_graves: only show current user's graves via grave_members
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
  inner join public.grave_members gm on gm.grave_id = g.id and gm.user_id = auth.uid()
  where g.deleted_at is null;
$$;

-- 1c. Add unique constraint on cemetery name for idempotent seeding
alter table public.cemeteries add constraint cemeteries_name_unique unique (name);

-- 1d. Seed NYC/NJ cemeteries (Russian-diaspora focus)
-- Coordinates verified against Find a Grave, Google Maps, and Wikipedia (Feb 2026)
insert into public.cemeteries (name, name_ru, city, state, location) values
  ('Washington Cemetery', 'Вашингтонское кладбище', 'Brooklyn', 'NY', ST_SetSRID(ST_MakePoint(-73.9754, 40.6193), 4326)::geography),
  ('Wellwood Cemetery', 'Кладбище Веллвуд', 'West Babylon', 'NY', ST_SetSRID(ST_MakePoint(-73.3860, 40.7365), 4326)::geography),
  ('Mount Hebron Cemetery', 'Кладбище Маунт-Хеврон', 'Flushing', 'NY', ST_SetSRID(ST_MakePoint(-73.8353, 40.7426), 4326)::geography),
  ('Beth David Cemetery', 'Кладбище Бет-Давид', 'Elmont', 'NY', ST_SetSRID(ST_MakePoint(-73.7121, 40.7012), 4326)::geography),
  ('Mount Richmond Cemetery', 'Кладбище Маунт-Ричмонд', 'Staten Island', 'NY', ST_SetSRID(ST_MakePoint(-74.1442, 40.5681), 4326)::geography),
  ('Baron Hirsch Cemetery', 'Кладбище Барон-Гирш', 'Staten Island', 'NY', ST_SetSRID(ST_MakePoint(-74.1549, 40.6221), 4326)::geography),
  ('Montefiore Cemetery', 'Кладбище Монтефиоре', 'Springfield Gardens', 'NY', ST_SetSRID(ST_MakePoint(-73.7388, 40.6848), 4326)::geography),
  ('Mount Zion Cemetery', 'Кладбище Маунт-Сион', 'Maspeth', 'NY', ST_SetSRID(ST_MakePoint(-73.9073, 40.7314), 4326)::geography),
  ('Maimonides Cemetery', 'Кладбище Маймонидес', 'Brooklyn', 'NY', ST_SetSRID(ST_MakePoint(-73.8710, 40.6919), 4326)::geography),
  ('Beth Israel Cemetery', 'Кладбище Бет-Исраэль', 'Woodbridge', 'NJ', ST_SetSRID(ST_MakePoint(-74.3092, 40.5491), 4326)::geography),
  ('Mount Judah Cemetery', 'Кладбище Маунт-Джуда', 'Ridgewood', 'NY', ST_SetSRID(ST_MakePoint(-73.8921, 40.6918), 4326)::geography),
  ('Cedar Park Cemetery', 'Кладбище Сидар-Парк', 'Paramus', 'NJ', ST_SetSRID(ST_MakePoint(-74.0519, 40.9714), 4326)::geography),
  ('King Solomon Memorial Park', 'Мемориальный парк Царь Соломон', 'Clifton', 'NJ', ST_SetSRID(ST_MakePoint(-74.1493, 40.8418), 4326)::geography),
  ('Beth Moses Cemetery', 'Кладбище Бет-Мозес', 'West Babylon', 'NY', ST_SetSRID(ST_MakePoint(-73.3892, 40.7406), 4326)::geography),
  ('New Montefiore Cemetery', 'Кладбище Нью-Монтефиоре', 'West Babylon', 'NY', ST_SetSRID(ST_MakePoint(-73.3878, 40.7264), 4326)::geography),
  ('Mount Lebanon Cemetery', 'Кладбище Маунт-Лебанон', 'Iselin', 'NJ', ST_SetSRID(ST_MakePoint(-74.3181, 40.5631), 4326)::geography),
  ('Old Montefiore Cemetery', 'Кладбище Старый Монтефиоре', 'Springfield Gardens', 'NY', ST_SetSRID(ST_MakePoint(-73.7388, 40.6848), 4326)::geography),
  ('Calverton National Cemetery', 'Национальное кладбище Калвертон', 'Calverton', 'NY', ST_SetSRID(ST_MakePoint(-72.8152, 40.9319), 4326)::geography),
  ('Long Island National Cemetery', 'Национальное кладбище Лонг-Айленд', 'Farmingdale', 'NY', ST_SetSRID(ST_MakePoint(-73.4015, 40.7506), 4326)::geography),
  ('Cypress Hills Cemetery', 'Кладбище Сайпресс-Хиллз', 'Brooklyn', 'NY', ST_SetSRID(ST_MakePoint(-73.8746, 40.6892), 4326)::geography),
  ('Green-Wood Cemetery', 'Кладбище Грин-Вуд', 'Brooklyn', 'NY', ST_SetSRID(ST_MakePoint(-73.9955, 40.6589), 4326)::geography),
  ('Woodlawn Cemetery', 'Кладбище Вудлон', 'Bronx', 'NY', ST_SetSRID(ST_MakePoint(-73.8720, 40.8882), 4326)::geography),
  ('Gate of Heaven Cemetery', 'Кладбище Врата Рая', 'Hawthorne', 'NY', ST_SetSRID(ST_MakePoint(-73.7946, 41.0956), 4326)::geography),
  ('Saint Charles Cemetery', 'Кладбище Святого Карла', 'Farmingdale', 'NY', ST_SetSRID(ST_MakePoint(-73.4006, 40.7462), 4326)::geography),
  ('Holy Cross Cemetery', 'Кладбище Святого Креста', 'Brooklyn', 'NY', ST_SetSRID(ST_MakePoint(-73.9433, 40.6471), 4326)::geography),
  ('Saint John Cemetery', 'Кладбище Святого Иоанна', 'Middle Village', 'NY', ST_SetSRID(ST_MakePoint(-73.8669, 40.7150), 4326)::geography),
  ('Calvary Cemetery', 'Кладбище Калвари', 'Woodside', 'NY', ST_SetSRID(ST_MakePoint(-73.9322, 40.7328), 4326)::geography),
  ('Lutheran All Faiths Cemetery', 'Лютеранское кладбище Всех Верующих', 'Middle Village', 'NY', ST_SetSRID(ST_MakePoint(-73.8881, 40.7122), 4326)::geography),
  ('Silver Mount Cemetery', 'Кладбище Силвер-Маунт', 'Staten Island', 'NY', ST_SetSRID(ST_MakePoint(-74.0950, 40.6220), 4326)::geography),
  ('Moravian Cemetery', 'Моравское кладбище', 'Staten Island', 'NY', ST_SetSRID(ST_MakePoint(-74.1181, 40.5836), 4326)::geography),
  ('Beth El Cemetery', 'Кладбище Бет-Эль', 'Paramus', 'NJ', ST_SetSRID(ST_MakePoint(-74.0476, 40.9694), 4326)::geography),
  ('George Washington Memorial Park', 'Мемориальный парк Джорджа Вашингтона', 'Paramus', 'NJ', ST_SetSRID(ST_MakePoint(-74.0870, 40.9400), 4326)::geography),
  ('Floral Park Cemetery', 'Кладбище Флорал-Парк', 'South Brunswick', 'NJ', ST_SetSRID(ST_MakePoint(-74.4977, 40.3954), 4326)::geography),
  ('Rosedale Memorial Park', 'Мемориальный парк Роуздейл', 'Linden', 'NJ', ST_SetSRID(ST_MakePoint(-74.2408, 40.6353), 4326)::geography),
  ('Hollywood Memorial Park', 'Мемориальный парк Голливуд', 'Union', 'NJ', ST_SetSRID(ST_MakePoint(-74.2652, 40.7087), 4326)::geography),
  ('Gomel Chesed Cemetery', 'Кладбище Гомель-Хесед', 'Newark', 'NJ', ST_SetSRID(ST_MakePoint(-74.1979, 40.6885), 4326)::geography),
  ('Mount Olivet Cemetery', 'Кладбище Маунт-Оливет', 'Maspeth', 'NY', ST_SetSRID(ST_MakePoint(-73.8967, 40.7206), 4326)::geography),
  ('Pinelawn Memorial Park', 'Мемориальный парк Пайнлон', 'Farmingdale', 'NY', ST_SetSRID(ST_MakePoint(-73.4454, 40.7326), 4326)::geography),
  ('Mount Ararat Cemetery', 'Кладбище Маунт-Арарат', 'Farmingdale', 'NY', ST_SetSRID(ST_MakePoint(-73.3989, 40.7186), 4326)::geography),
  ('New Mount Carmel Cemetery', 'Кладбище Нью-Маунт-Кармель', 'Glendale', 'NY', ST_SetSRID(ST_MakePoint(-73.8871, 40.6992), 4326)::geography),
  ('Beth Israel Memorial Park', 'Мемориальный парк Бет-Исраэль', 'Woodbridge', 'NJ', ST_SetSRID(ST_MakePoint(-74.3108, 40.5509), 4326)::geography),
  ('Mount Pleasant Cemetery', 'Кладбище Маунт-Плезант', 'Hawthorne', 'NY', ST_SetSRID(ST_MakePoint(-73.7883, 41.0939), 4326)::geography),
  ('Kensico Cemetery', 'Кладбище Кенсико', 'Valhalla', 'NY', ST_SetSRID(ST_MakePoint(-73.7892, 41.0707), 4326)::geography),
  ('Saint Raymond Cemetery', 'Кладбище Святого Реймонда', 'Bronx', 'NY', ST_SetSRID(ST_MakePoint(-73.8334, 40.8253), 4326)::geography),
  ('Resurrection Cemetery', 'Кладбище Воскресения', 'Staten Island', 'NY', ST_SetSRID(ST_MakePoint(-74.2087, 40.5140), 4326)::geography),
  ('Trinity Church Cemetery', 'Кладбище Церкви Троицы', 'Manhattan', 'NY', ST_SetSRID(ST_MakePoint(-73.9487, 40.8343), 4326)::geography),
  ('Most Holy Redeemer Cemetery', 'Кладбище Святого Искупителя', 'South Plainfield', 'NJ', ST_SetSRID(ST_MakePoint(-74.4353, 40.5831), 4326)::geography),
  ('Saint Gertrude Cemetery', 'Кладбище Святой Гертруды', 'Colonia', 'NJ', ST_SetSRID(ST_MakePoint(-74.3073, 40.5979), 4326)::geography),
  ('Restland Memorial Park', 'Мемориальный парк Рестлэнд', 'East Hanover', 'NJ', ST_SetSRID(ST_MakePoint(-74.3689, 40.8175), 4326)::geography),
  ('Ocean View Cemetery', 'Кладбище Оушн-Вью', 'Staten Island', 'NY', ST_SetSRID(ST_MakePoint(-74.1389, 40.5606), 4326)::geography)
on conflict (name) do nothing;
