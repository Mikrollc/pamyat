-- Make graves private by default. Users must explicitly opt in to public visibility.
ALTER TABLE public.graves ALTER COLUMN is_public SET DEFAULT false;
