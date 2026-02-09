-- Replace date columns with partial-date integer columns
-- Supports partial dates common on gravestones (e.g. year-only)

ALTER TABLE public.graves DROP COLUMN birth_date;
ALTER TABLE public.graves DROP COLUMN death_date;
ALTER TABLE public.graves
  ADD COLUMN birth_year  int,
  ADD COLUMN birth_month int CHECK (birth_month BETWEEN 1 AND 12),
  ADD COLUMN birth_day   int CHECK (birth_day   BETWEEN 1 AND 31),
  ADD COLUMN death_year  int,
  ADD COLUMN death_month int CHECK (death_month BETWEEN 1 AND 12),
  ADD COLUMN death_day   int CHECK (death_day   BETWEEN 1 AND 31);
