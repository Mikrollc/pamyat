-- Seed data for local development
-- This file runs automatically with `supabase db reset`

-- Create dev user in auth.users (email: dev@pamyat.local, password: devpassword123)
-- The on_auth_user_created trigger will auto-create the profile row.
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'dev@pamyat.local',
  crypt('devpassword123', gen_salt('bf')),
  now(),
  '{"full_name": "Dev User"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Ensure the identity record exists (required for email/password auth)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'dev@pamyat.local',
  '{"sub": "a0000000-0000-0000-0000-000000000001", "email": "dev@pamyat.local"}'::jsonb,
  'email',
  now(),
  now(),
  now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- Update the dev user profile with display name
UPDATE public.profiles
SET display_name = 'Dev User', locale = 'en'
WHERE id = 'a0000000-0000-0000-0000-000000000001';
