-- Seed cemeteries in and around Minsk, Belarus
-- Coordinates verified against Yandex Maps, Find a Grave, and local cemetery directories (Feb 2026)
-- Sources: ecodar.by, moikorni.com, granitnoedelo.by, findagrave.com

insert into public.cemeteries (name, name_ru, city, state, country, location) values
  -- Active cemeteries
  ('Western Cemetery', 'Западное кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5554, 53.8682), 4326)::geography),
  ('Kolodishchi Cemetery', 'Колодищанское кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.8588, 53.9168), 4326)::geography),
  ('Mikhanovichi Cemetery', 'Михановичское кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5307, 53.7610), 4326)::geography),
  ('Sukharevskoe Cemetery', 'Сухаревское кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5831, 53.9690), 4326)::geography),
  ('Chernigovskoe Cemetery', 'Черниговское кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5395, 53.8612), 4326)::geography),
  ('Urutche Cemetery', 'Кладбище Уручье', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.6830, 53.9420), 4326)::geography),
  ('Petrovshchina Cemetery', 'Кладбище Петровщина', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5058, 53.8607), 4326)::geography),

  -- Conditionally active (family burials only)
  ('Northern Cemetery', 'Северное кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5542, 53.9839), 4326)::geography),
  ('Eastern Cemetery', 'Восточное кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.6606, 53.9404), 4326)::geography),
  ('Kalvariyskoe Cemetery', 'Кальварийское кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5043, 53.9078), 4326)::geography),
  ('Chizhovskoe Cemetery', 'Чижовское кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.6447, 53.8266), 4326)::geography),
  ('Kozyrevskoe Cemetery', 'Козыревское кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5215, 53.8730), 4326)::geography),
  ('Masyukovshchina Cemetery', 'Кладбище Масюковщина', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5082, 53.9450), 4326)::geography),

  -- Historical / closed
  ('Military Cemetery', 'Военное кладбище', 'Minsk', null, 'BY', ST_SetSRID(ST_MakePoint(27.5640, 53.9080), 4326)::geography)

on conflict (name) do nothing;
