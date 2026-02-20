-- Standardize all phone numbers to E.164 format (+country_code + number)
-- Prevents format mismatch between profiles.phone and invitations.recipient

-- 1. Fix existing profiles missing '+' prefix
UPDATE public.profiles
SET phone = '+' || phone
WHERE phone IS NOT NULL
  AND phone != ''
  AND phone NOT LIKE '+%';

-- 2. Fix existing invitation recipients missing '+' prefix
UPDATE public.invitations
SET recipient = '+' || recipient
WHERE recipient IS NOT NULL
  AND recipient != ''
  AND recipient NOT LIKE '+%';

-- 3. Update trigger to always store E.164 format
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    CASE
      WHEN new.phone IS NOT NULL AND new.phone != '' AND new.phone NOT LIKE '+%'
      THEN '+' || new.phone
      ELSE new.phone
    END
  );
  RETURN new;
END;
$$;
