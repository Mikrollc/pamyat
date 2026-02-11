# Stack Notes — Pamyat

Tech gotchas, version-specific issues, things that don't work as expected.
Each entry tagged with `[verified: YYYY-MM-DD]` — if older than 30 days, re-verify before relying on it.

---

## Expo / React Native

- **Expo SDK 54 + New Architecture enabled** — Tamagui's compiler has compatibility issues. Don't use Tamagui. Roll own design tokens instead. [verified: 2026-02-08]
- **@rnmapbox/maps requires EAS build** — won't work in Expo Go. Must run `npx expo prebuild` then native build. Test early. [verified: 2026-02-08]
- **@rnmapbox/maps Camera** — imperative `ref.setCamera()` is unreliable. Use declarative props (`centerCoordinate`, `zoomLevel`, `animationMode="flyTo"`) driven by state. [verified: 2026-02-09]
- **@rnmapbox/maps v10.2.10 requires `$RNMapboxMaps.post_install(installer)` in Podfile.** Without it, the `RNMBX_11` Swift flag is not set and MapboxMaps v11 `Style→StyleManager` rename causes 100+ build errors. The fix is NOT version pinning — it's adding the post_install hook. [verified: 2026-02-08]
- **CocoaPods must be 1.15+** for visionOS support in react-native-safe-area-context. RVM's old Ruby 2.6.3 had pod 1.11.3. Fix: `gem install cocoapods` under RVM ruby. [verified: 2026-02-08]
- **react-native-mmkv v4.1.2 installed** — not yet used in codebase. Intended for offline cache / Zustand persistence. [verified: 2026-02-08]

## Supabase

- **Local dev running on port 54321** — config in `supabase/config.toml`. PostgreSQL 17, PostGIS enabled. [verified: 2026-02-08]
- **Phone auth (SMS OTP)** — enabled in config (`enable_signup = true` under SMS). Test OTP configured: `4152127777 = "123456"`. Twilio to be wired before launch. [verified: 2026-02-09]
- **RLS policies written** — all 8 tables have row-level security. Tested against actual queries. [verified: 2026-02-09]
- **RLS + soft delete gotcha** — UPDATE policies with `WITH CHECK` fail when the updated row becomes invisible to SELECT policies. Example: setting `deleted_at` on `graves` fails because both SELECT policies require `deleted_at IS NULL`, so the WITH CHECK subquery can't see the row post-update. Fix: use a `SECURITY DEFINER` RPC function that bypasses RLS after verifying ownership in SQL. See `soft_delete_grave()`. [verified: 2026-02-09]
- **RLS UPDATE policies must exist explicitly** — enabling RLS on a table without an UPDATE policy blocks ALL updates, even by row owners. This caused a silent bug on `grave_members` where relationship updates during publish were denied. Always add UPDATE policies for tables that need writes. [verified: 2026-02-09]
- **Hosted Supabase: extensions schema** — extensions like `pgcrypto` and `uuid-ossp` are installed in the `extensions` schema, not `public`. Functions like `uuid_generate_v4()` and `gen_random_bytes()` aren't on the default search path. Fix: use `gen_random_uuid()` (built-in PG13+) and add `set search_path to public, extensions;` for `gen_random_bytes()`. [verified: 2026-02-10]
- **PostgREST returns PostGIS geography as EWKB hex** (e.g. `0101000020E6...`), not GeoJSON or WKT. Parse coords with DataView: lng at byte offset 9, lat at byte offset 17 (little-endian). [verified: 2026-02-09]

## EAS / Expo

- **EAS CLI `eas secret:create` is deprecated** — use `eas env:create` instead. Same flags. [verified: 2026-02-10]
- **EAS env var visibility matters for prebuild** — "secret" vars may not be available as `process.env` during config evaluation (prebuild). Use "sensitive" for tokens needed in `app.config.ts` (e.g., `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`). [verified: 2026-02-10]

## Mapbox

- **Access token is placeholder** — `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here` in `.env.local`. Need real token from mapbox.com dashboard. [verified: 2026-02-08]

## i18n

- **80 translation keys** in en.json + ru.json. Both languages complete for current placeholder screens. [verified: 2026-02-08]
- **Device locale auto-detection works** via expo-localization. Fallback to English. [verified: 2026-02-08]

## Dependencies Installed But Unused

- expo-camera, expo-location, expo-notifications, react-native-mmkv — installed but not wired up yet. [verified: 2026-02-09]
- expo-image-picker, @rnmapbox/maps, react-native-reanimated — installed and in use. [verified: 2026-02-09]
