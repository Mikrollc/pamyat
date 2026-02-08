# Pamyat — Codebase Rules

Grave care registry app. React Native (Expo SDK 54) + Supabase + Mapbox.

---

## Git Workflow

### Branches
- `main` — production-ready. Never push directly. All changes via PR.
- Feature branches: `feat/<short-description>` (e.g., `feat/add-grave-wizard`)
- Bug fixes: `fix/<short-description>` (e.g., `fix/otp-timeout`)
- Chores: `chore/<short-description>` (e.g., `chore/update-deps`)

### Commits
Follow Conventional Commits:
```
<type>: <short description>

[optional body]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`

Rules:
- One logical change per commit. Don't mix features with refactors.
- Commit message describes WHY, not WHAT (the diff shows what).
- Keep subject line under 72 characters.
- Reference the user story if applicable: `feat: add grave wizard step 1 [S-3]`

### Pull Requests
- Every feature branch gets a PR against `main`.
- PR title follows same conventional commit format.
- Fill out the PR template — summary, user story, changes, testing checklist.
- Squash merge to keep main history clean.

### Branch Lifecycle
```
main → feat/my-feature → commit → commit → PR → squash merge → delete branch
```

---

## Code Standards

### File Organization
```
app/                  # Expo Router screens (route = file)
components/           # Reusable UI components
components/add-grave/ # AddGrave wizard step components
constants/            # Design tokens, config values
hooks/                # React Query hooks (useGraves, useAuth, etc.)
lib/                  # Supabase client, API functions
lib/api/              # Pure Supabase query functions
stores/               # Zustand stores
types/                # TypeScript types
i18n/                 # Translation files
supabase/             # Migrations, config, seed data
```

### Naming
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` (e.g., `ScreenShell`, `GraveCard`)
- Hooks: `useCamelCase` (e.g., `useGraves`, `useAuth`)
- Stores: `camelCaseStore` (e.g., `addGraveStore`)
- Constants: `UPPER_SNAKE_CASE` for values, `camelCase` for objects

### Imports
- Use `@/` path alias for all imports from project root
- Group: React/RN → Expo → third-party → project (`@/`)
- No circular imports

### Components
- One component per file
- Props interface defined at top of file
- No inline styles longer than 3 properties — extract to StyleSheet
- Always handle: loading, error, empty states
- All user-facing strings via `t()` from i18next — never hardcoded

### Data Layer
- Supabase queries live in `lib/api/` — never import Supabase client in components
- React Query hooks in `hooks/` wrap `lib/api/` functions
- Query key factories for consistent cache management
- Mutations invalidate relevant queries

### No-Go List
- No `any` types. Use `unknown` + type guards if needed.
- No console.log in committed code (use a logger utility if needed).
- No hardcoded colors/spacing — use design tokens from `constants/tokens`.
- No platform-specific code without `Platform.OS` guard.
- No secrets in code — all secrets via environment variables.
