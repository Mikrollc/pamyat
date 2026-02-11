# Stack Notes — Pamyat

Tech gotchas, version-specific issues, things that don't work as expected.
Each entry tagged with `[verified: YYYY-MM-DD]` — if older than 30 days, re-verify before relying on it.

---

## Expo / React Native

- **Expo SDK 54 + New Architecture enabled** — Tamagui's compiler has compatibility issues. Don't use Tamagui. Roll own design tokens instead. [verified: 2026-02-08]
- **Cannot use Expo Go** — Mapbox and other native modules require a dev build. Always use `npx expo run:ios` (not `npx expo start --ios`). Expo Go will crash with "native code not available". [verified: 2026-02-10]
- **expo-image-picker plugin required in app.config.ts** — Without it, iOS permission descriptions (NSCameraUsageDescription, NSPhotoLibraryUsageDescription) are missing. App Store will reject. Added in PR #83. [verified: 2026-02-10]
- **expo-image-manipulator** — Use `manipulateAsync` (legacy API, still works in SDK 54). New context API exists but `manipulateAsync` is simpler. Used for photo compression (<2MB guarantee). [verified: 2026-02-10]
- **react-native-mmkv v4.1.2** — Used for Zustand persistence (add-grave-store draft). [verified: 2026-02-10]

## @rnmapbox/maps

- **Requires EAS build** — won't work in Expo Go. Must run `npx expo prebuild` then native build. [verified: 2026-02-08]
- **`RNMapboxMapsDownloadToken` is DEPRECATED** in plugin config. Remove it from app.config.ts — the plugin reads `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` environment variable directly. Passing it explicitly produces noisy warnings. [verified: 2026-02-10]
- **MapView.getCenter() is UNRELIABLE** — returns stale/default coordinates, not the current visible center. DO NOT USE for zoom. Instead, track center via `onRegionDidChange` callback in a ref (`centerRef.current = [lng, lat]`) and use that ref when calling `setCamera`. Fixed in PR #85. [verified: 2026-02-10]
- **v10.2.10 requires `$RNMapboxMaps.post_install(installer)` in Podfile.** Without it, the `RNMBX_11` Swift flag is not set and MapboxMaps v11 `Style→StyleManager` rename causes 100+ build errors. [verified: 2026-02-08]
- **Camera declarative props vs imperative** — imperative `ref.setCamera()` works but must include `centerCoordinate` (won't preserve current center if omitted). [verified: 2026-02-10]

## Supabase

- **Local dev on port 54321** — `.env.local` has `EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`. No Twilio configured locally. [verified: 2026-02-10]
- **Cloud Supabase URL:** `https://fjldxmrwemdyjbvjynpo.supabase.co` — has Twilio Verify configured for phone OTP. [verified: 2026-02-10]
- **Dev auth bypass** — `lib/dev-auth.ts` signs in with `dev@pamyat.local` / `devpassword123`. Enabled via `EXPO_PUBLIC_DEV_AUTH_BYPASS=true` in `.env.local`. Use for local testing instead of phone OTP. [verified: 2026-02-10]
- **Phone auth: Twilio Verify** — configured on cloud Supabase. Account SID: `ACdcbb34eb35d8eadd3fcfb7020d75596f`, Service SID: `VA8f3376884a7f844268ebe4307ba456de`. No dedicated phone number needed — uses Twilio Verify shared short codes. [verified: 2026-02-10]
- **`phone_provider_disabled` error** — When phone auth provider isn't configured (e.g., local Supabase without Twilio), Supabase returns this error. The app differentiates this from network errors in `phone.tsx`. [verified: 2026-02-10]
- **RLS policies written** — all 8 tables have row-level security. [verified: 2026-02-09]
- **RLS + soft delete gotcha** — UPDATE with `WITH CHECK` fails when updated row becomes invisible to SELECT policies. Fix: `SECURITY DEFINER` RPC (`soft_delete_grave`). [verified: 2026-02-09]
- **RLS UPDATE policies must exist explicitly** — enabling RLS without UPDATE policy blocks ALL updates. [verified: 2026-02-09]
- **`spatial_ref_sys` RLS advisory** — PostGIS system table, can't ALTER (not owner). Fix: `REVOKE ALL ON public.spatial_ref_sys FROM anon, authenticated;` [verified: 2026-02-10]
- **Hosted Supabase: extensions schema** — `uuid_generate_v4()` etc. not on default search path. Use `gen_random_uuid()` instead. [verified: 2026-02-10]
- **PostgREST returns PostGIS geography as EWKB hex** — parse coords with DataView: lng at byte 9, lat at byte 17 (little-endian). [verified: 2026-02-09]

## EAS / CI/CD

- **Builds are MANUAL now** — no auto-deploy on push to main. Trigger via `git tag v1.0.x && git push origin v1.0.x` or GitHub Actions "Run workflow" button. Changed in PR #86 to conserve EAS build credits. [verified: 2026-02-10]
- **`changelogs` is NOT a valid eas.json field** — EAS validation rejects `submit.production.ios.changelogs`. Use GitHub Releases for changelogs instead. [verified: 2026-02-10]
- **GitHub Actions needs `permissions: contents: write`** — required for pushing tags and creating releases. Without it, git push fails with 403. [verified: 2026-02-10]
- **EAS CLI `eas secret:create` is deprecated** — use `eas env:create` instead. [verified: 2026-02-10]
- **EAS env var visibility** — "secret" vars may not be available as `process.env` during prebuild. Use "sensitive" for tokens needed in `app.config.ts`. [verified: 2026-02-10]

## CocoaPods

- **Must be 1.15+** for visionOS support in react-native-safe-area-context. RVM's old Ruby 2.6.3 had pod 1.11.3. Fix: `gem install cocoapods` under RVM ruby. [verified: 2026-02-08]

## i18n

- **~130 translation keys** in en.json + ru.json. Both languages complete. [verified: 2026-02-10]
- **Device locale auto-detection** via expo-localization. Fallback to English. [verified: 2026-02-08]

## Dependencies Status

- **In use:** expo-image-picker, expo-image-manipulator, @rnmapbox/maps, react-native-reanimated, react-native-mmkv, expo-location, expo-linking [verified: 2026-02-10]
- **Installed but NOT wired up:** expo-camera, expo-notifications [verified: 2026-02-10]
