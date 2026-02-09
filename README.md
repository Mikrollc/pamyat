# Pamyat

Grave care registry app for the Russian-speaking community in NYC/NJ. Free memorial pages with waitlist for paid maintenance services.

## Tech Stack

- **React Native** (Expo SDK 54) — iOS + Android
- **Supabase** — Auth, PostgreSQL + PostGIS, Storage, RLS
- **Mapbox** — Cemetery maps, grave pins
- **i18next** — Russian + English bilingual support

## Prerequisites

- Node.js 18+
- [Xcode](https://developer.apple.com/xcode/) (for iOS simulator)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)
- [CocoaPods](https://cocoapods.org/) 1.15+ (`gem install cocoapods`)

## Setup

```bash
# Clone
git clone https://github.com/Mikrollc/pamyat.git
cd pamyat

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase and Mapbox keys in .env.local

# Start Supabase locally
supabase start

# Apply migrations and seed data
supabase db reset

# Generate native projects
npx expo prebuild

# Run on iOS simulator
npx expo run:ios
```

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase API URL (local: `http://127.0.0.1:54321`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox public token from mapbox.com |
| `EXPO_PUBLIC_DEV_AUTH_BYPASS` | Set to `true` to skip phone auth (local dev only) |

## Dev Auth Bypass

For local development, set `EXPO_PUBLIC_DEV_AUTH_BYPASS=true` in `.env.local`. This auto-signs in as a seeded dev user so you can build features without SMS verification. The seed user is created by `supabase/seed.sql` when you run `supabase db reset`.

## Project Structure

```
app/                  # Expo Router screens
components/           # Reusable UI components
constants/            # Design tokens, config
hooks/                # React Query hooks
lib/                  # Supabase client, API functions
lib/api/              # Pure Supabase query functions
stores/               # Zustand stores
types/                # TypeScript types
i18n/                 # EN + RU translation files
supabase/             # Migrations, config, seed data
```

## Git Workflow

See [CLAUDE.md](./CLAUDE.md) for branch naming, commit conventions, and PR process.

- **Branches:** `feat/<issue#>-<description>`, `fix/<issue#>-<description>`, `chore/<description>`
- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`)
- **PRs:** One issue = one branch = one PR. Squash merge to main.

## Known Issues

- `@rnmapbox/maps` requires `$RNMapboxMaps.post_install(installer)` in `ios/Podfile` `post_install` block. Without it, the `RNMBX_11` flag is not set and MapboxMaps v11 builds fail with 100+ errors.
- CocoaPods must be 1.15+ for visionOS support in `react-native-safe-area-context`.
