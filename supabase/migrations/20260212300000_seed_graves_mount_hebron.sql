-- Seed 12 graves at Mount Hebron Cemetery (Flushing, NY)
-- Source: Find a Grave, verified Feb 2026
-- These are public seed data — no real user owns them.

-- Disable triggers and FK constraints for seed inserts.
-- This lets us create a system profile without an auth.users entry
-- and insert graves without the on_grave_created trigger firing.
SET session_replication_role = 'replica';

-- System profile for seed data ownership
INSERT INTO public.profiles (id, display_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Raduna Seed Data')
ON CONFLICT (id) DO NOTHING;

-- Seed graves
INSERT INTO public.graves (
  cemetery_id, location, person_name, person_name_ru,
  birth_year, birth_month, birth_day,
  death_year, death_month, death_day,
  inscription, plot_info, slug, is_public, created_by
) VALUES
  -- 1. Sani Shapiro (1860 – Feb 11 1931)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Sani Shapiro', 'Сани Шапиро',
    1860, NULL, NULL,
    1931, 2, 11,
    'Nataniel Dovid ben Avraham Yitzchak Baal Darshan',
    NULL,
    public.generate_grave_slug('Sani Shapiro', 1860, 1931),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 2. Sophie Shapiro (1873 – Oct 20 1952)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Sophie Shapiro', 'Софи Шапиро',
    1873, NULL, NULL,
    1952, 10, 20,
    'Sara bas Avraham Mordechai',
    NULL,
    public.generate_grave_slug('Sophie Shapiro', 1873, 1952),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 3. Solomon Shapiro (Feb 23 1916 – Nov 24 1968)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Solomon Shapiro', 'Соломон Шапиро',
    1916, 2, 23,
    1968, 11, 24,
    NULL,
    '50-1-A-C-7-33 Congregation Puchowitzer',
    public.generate_grave_slug('Solomon Shapiro', 1916, 1968),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 4. Tillie Imergluck Shapiro (Nov 1 1888 – Aug 15 1941)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Tillie Imergluck Shapiro', 'Тилли Имерглюк Шапиро',
    1888, 11, 1,
    1941, 8, 15,
    NULL,
    'Block 29, Ref 18, Sec N, Line 3, Grave 1',
    public.generate_grave_slug('Tillie Imergluck Shapiro', 1888, 1941),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 5. Bella Katz (1865 – Nov 20 1928) — grave-specific GPS
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8334, 40.7309), 4326)::geography,
    'Bella Katz', 'Белла Кац',
    1865, NULL, NULL,
    1928, 11, 20,
    NULL,
    NULL,
    public.generate_grave_slug('Bella Katz', 1865, 1928),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 6. David Katz (? – Mar 23 1930) — grave-specific GPS
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8252, 40.7331), 4326)::geography,
    'David Katz', 'Давид Кац',
    NULL, NULL, NULL,
    1930, 3, 23,
    NULL,
    '36-1-A/B-PP1-2',
    public.generate_grave_slug('David Katz', NULL, 1930),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 7. Rivka Rabinowitz (? – Jan 2 1930)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Rivka Rabinowitz', 'Ривка Рабинович',
    NULL, NULL, NULL,
    1930, 1, 2,
    NULL,
    '41-1-AC-G-2',
    public.generate_grave_slug('Rivka Rabinowitz', NULL, 1930),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 8. Karl Rabinowitz (? – Nov 15 1951)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Karl Rabinowitz', 'Карл Рабинович',
    NULL, NULL, NULL,
    1951, 11, 15,
    NULL,
    NULL,
    public.generate_grave_slug('Karl Rabinowitz', NULL, 1951),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 9. Meyer "Meir" Berkowitz (1869 – Jul 5 1939)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Meyer Berkowitz', 'Мейер Берковиц',
    1869, NULL, NULL,
    1939, 7, 5,
    NULL,
    '57-1-A-C-P-6 Jacob Lustgarten',
    public.generate_grave_slug('Meyer Berkowitz', 1869, 1939),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 10. Chaim Berkowitz (? – Dec 20 1931)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Chaim Berkowitz', 'Хаим Берковиц',
    NULL, NULL, NULL,
    1931, 12, 20,
    NULL,
    NULL,
    public.generate_grave_slug('Chaim Berkowitz', NULL, 1931),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 11. Samuel Friedman (Jul 1880 – Jun 21 1968)
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8317, 40.7356), 4326)::geography,
    'Samuel Friedman', 'Самуэль Фридман',
    1880, 7, NULL,
    1968, 6, 21,
    NULL,
    'Plot 73-E-48-1',
    public.generate_grave_slug('Samuel Friedman', 1880, 1968),
    true,
    '00000000-0000-0000-0000-000000000001'
  ),
  -- 12. Daniel Rosenberg (? – Nov 12 1956) — grave-specific GPS
  (
    (SELECT id FROM public.cemeteries WHERE name = 'Mount Hebron Cemetery'),
    ST_SetSRID(ST_MakePoint(-73.8304, 40.7370), 4326)::geography,
    'Daniel Rosenberg', 'Даниэль Розенберг',
    NULL, NULL, NULL,
    1956, 11, 12,
    NULL,
    'Block 12, Ref 26, Sec G, Line 2, Grave 2',
    public.generate_grave_slug('Daniel Rosenberg', NULL, 1956),
    true,
    '00000000-0000-0000-0000-000000000001'
  );

-- Re-enable triggers and FK constraints
SET session_replication_role = 'origin';
