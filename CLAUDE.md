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
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`

Rules:
- One logical change per commit. Don't mix features with refactors.
- Commit message describes WHY, not WHAT (the diff shows what).
- Keep subject line under 72 characters.
- Reference the user story if applicable: `feat: add grave wizard step 1 [S-3]`

### Pull Requests
- **Every work item (issue) gets its own branch and PR.** No exceptions.
- Open a draft PR immediately when starting work on an issue.
- PR title: `<type>: <description> (#<issue>)` (e.g., `feat: add grave wizard (#12)`)
- PR body must include `Closes #<issue>` so the issue auto-closes on merge.
- Fill out the PR template — summary, user story, changes, testing checklist.
- PR stays in draft until validated (QA + user testing pass).
- Mark ready for review → PO accepts → squash merge → branch deleted → issue closed.
- If PO rejects: fix on same branch, push, re-validate. Do not open a new PR.

### GitHub Issues
All work items are tracked as GitHub Issues. Three templates:
- **Story** — user-facing feature with acceptance criteria
- **Task** — technical/chore work with definition of done
- **Bug** — broken behavior with repro steps

Labels: `story`, `task`, `bug`, `size/S`, `size/M`, `size/L`, `sprint`, `blocked`, `needs-review`, `accepted`

### Branch Lifecycle
```
PO creates issue #12
  → branch: feat/12-add-grave-wizard
    → open draft PR (Closes #12)
      → commits on branch
        → launch app locally → Oleg tests on simulator/device
          → bugs fixed on same branch → re-test until clean
            → QA + user-tester validate
              → PO accepts → mark PR ready → squash merge → branch deleted → issue closed
```

Every branch references its issue number. Every PR closes its issue on merge. One issue = one branch = one PR.
**No PR merges without a local test pass.** Code that hasn't been run is not done.

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
