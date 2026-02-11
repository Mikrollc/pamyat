# Decisions Log — Pamyat

Product and technical decisions with dates and reasoning. Newest first.

---

## 2026-02-10 — Switch EAS builds to manual trigger
- **Decision:** Removed auto-deploy on push to main. Builds now trigger only on version tag push (`v*`) or manual workflow_dispatch.
- **Rationale:** Multiple PRs per session were burning EAS build credits fast. Manual control lets us batch changes into fewer builds.
- **Usage:** `git tag v1.0.2 && git push origin v1.0.2` or GitHub Actions "Run workflow" button.

## 2026-02-10 — Photo compression pipeline
- **Decision:** Added `expo-image-manipulator` for post-pick compression. Photos resized to max 1920px wide at 0.7 JPEG quality. Crop aspect changed from 4:3 to 3:2 (matches memorial hero layout).
- **Rationale:** Acceptance criteria requires <2MB guarantee. Quality 0.8 from image picker alone can exceed 2MB with high-res cameras.

## 2026-02-10 — Notifications: Orthodox calendar computation
- **Decision:** Implemented Pascha algorithm (Julian computus + Gregorian conversion) to derive all orthodox memorial dates dynamically. No hardcoded dates.
- **Dates derived:** Universal Parental Saturday, 3 Lent Parental Saturdays, Radonitsa, Trinity Saturday, Dmitrievskaya Saturday. Plus US Memorial Day and death anniversaries from user's graves.
- **Verified:** 2024 (May 5), 2025 (Apr 20), 2026 (Apr 12) Pascha dates all correct.

## 2026-02-10 — Family tree / genealogy: linked memorials, not a full tree
- **Decision:** Phase 2: linked memorials (simple parent/child/spouse connections between graves). Phase 3: visual tree if data supports. Full genealogy social network: never.
- **Rationale:** Full tree is a scope trap. Linked memorials add value with minimal schema changes.

## 2026-02-10 — Phone auth: Twilio Verify on cloud Supabase
- **Decision:** Twilio Verify (shared short codes, no dedicated phone number). Configured on cloud Supabase only. Local dev uses email/password bypass.
- **Rationale:** Twilio Verify is free tier friendly and doesn't require buying a phone number.

## 2026-02-10 — CI/CD: GitHub Actions + EAS Build → TestFlight
- **Decision:** No staging environment — local Supabase is staging. Single Supabase production project (Free → Pro at launch).
- **Rationale:** Solo dev pre-revenue. Staging project adds cost and complexity with no benefit. Cemetery seed data already in a migration. One Mapbox token sufficient at MVP scale.
- **Infrastructure:** `eas.json` (development + production profiles), `.github/workflows/ci.yml` (PR checks), `.github/workflows/deploy.yml` (manual build + TestFlight).

## 2026-02-09 — ManageGrave: RLS fixes for soft delete and grave_members UPDATE (#43)
- **Decision:** Soft delete uses a `SECURITY DEFINER` RPC (`soft_delete_grave`) instead of a direct `UPDATE` on `graves`. Added missing `"Members: self update"` RLS policy on `grave_members`.
- **Rationale:** Direct `UPDATE` to set `deleted_at` failed with error 42501 — the RLS `WITH CHECK` clause couldn't validate the new row because both SELECT policies require `deleted_at IS NULL`, making the row invisible after the update. A `SECURITY DEFINER` function bypasses RLS after verifying ownership in SQL. The missing `grave_members` UPDATE policy blocked any `UPDATE` on that table (including setting `relationship` during publish). This was a pre-existing bug that went unnoticed because it only triggered when a relationship chip was selected.
- **Migration:** `20260210200000_allow_soft_delete.sql` — creates `soft_delete_grave` RPC + `"Members: self update"` policy.

## 2026-02-09 — Re-added ManageGrave and InviteFamily to MVP
- **Decision:** ManageGrave (#43) and InviteFamily (#44) back in MVP scope. Previously cut on Feb 8.
- **Rationale:** Without ManageGrave, published memorials can't be edited — any wizard mistake is permanent. Native share (current substitute for InviteFamily) only gives view access, not co-management. High velocity in first 2 days (7 screens built) gives confidence there's enough runway before Mar 14.
- **InviteFamily infra:** Needs `grave_invites` table, Supabase Edge Function (Resend for email, Twilio for SMS), deep link token flow. Depends on #10 (universal links).

## 2026-02-09 — Add Grave wizard redesign (4-step flow)
- **Decision:** Split 3-step wizard into 4 steps: Location & Person → Dates → Photo & Notes → Review. Added plot/section/row and relationship fields with DB migration. Removed "Unknown date" toggle.
- **Rationale:** Step 1 had 6+ fields crammed together. New flow distributes fields across steps. Plot info helps families locate graves; relationship chips add emotional context. Unknown toggle was unnecessary — empty fields serve the same purpose with less UI. UX designer confirmed sentence case labels over uppercase for bilingual readability.
- **UI changes:** Static "Add a Grave" header (no per-step titles), left-aligned title + right-aligned gray circle close button, full-width flat progress bar, two-area photo selector, pre-filled teal cemetery card, asymmetric Back/Next buttons, map zoom controls (+/−).
- **DB migration:** `graves.plot_info text`, `grave_members.relationship text`.

## 2026-02-09 — Cemetery discovery layer on map (#40)
- **Decision:** Map shows only the current user's graves (not all public graves). Cemetery markers provide the discovery layer instead.
- **Rationale:** Privacy-first for a grief product in a tight-knit community. Other users' test data appearing on the map is a bad experience. Pre-seeded cemeteries make the map useful from day one without exposing others' data.
- **`all_cemeteries` RPC is intentionally public** — cemetery locations are not private data. No auth required.
- **`map_graves` filtered by `auth.uid()`** via `grave_members` JOIN. Removed `is_public = true` filter — users see their own graves regardless of public status.
- **Unique constraint on `cemeteries.name`** — added for idempotent seed data (`ON CONFLICT (name) DO NOTHING`).
- **50 NYC/NJ cemeteries seeded** with web-verified coordinates (Find a Grave, Google Maps, Wikipedia).

## 2026-02-09 — Photo step buttons stacked vertically
- **Decision:** Photo action buttons ("Take Photo" / "Choose from Gallery") stacked vertically instead of side-by-side.
- **Rationale:** At half-width, "Choose from Gallery" wraps to 2 lines (even worse in Russian). Full-width vertical stack fits both languages on single lines. UX designer confirmed this is the cleanest solution.

## 2026-02-09 — "Publish" button label shortened
- **Decision:** Changed "Publish Memorial" → "Publish" on Step 3 CTA.
- **Rationale:** "Publish Memorial" wraps to 2 lines in the half-width footer button. The review card above provides full context. Russian "Опубликовать" also fits on one line.

## 2026-02-09 — Agent config audit & cleanup
- **Decision:** Keep subagent model (Task tool) as default orchestration. Agent teams (TeamCreate/SendMessage) reserved for Story Execution when FE+BE need to coordinate on same branch.
- **Changes applied:** Updated 12 agent .md files from 800→600 token cap. Added 6 missing bash permissions (git add/diff/log/stash/status, expo start). Updated stack-notes.md phone auth entry (now enabled). `teammateMode` not a valid settings.json field — use `--teammate-mode in-process` CLI flag if needed.

## 2026-02-09 — E2E framework: Maestro
- **Decision:** Use Maestro for E2E testing, not Detox or Appium.
- **Rationale:** Expo officially documents Maestro. Black-box YAML flows match solo-dev speed (30 min/flow vs 3+ hours). EAS Workflows has native CI support. No native build config changes needed. Detox has no official Expo support and conflicts with New Architecture.

## 2026-02-09 — Story #4 bug fix sprint
- **Decision:** Ship #26 (cemetery name), #28 (default coords), #29 (date validation), #30 (a11y labels) before Feb 14.
- **Rationale:** Data integrity and accessibility fixes. All size S, parallelizable, ~1 session combined.

---

## 2026-02-08 — UX design decisions for Week 1 stories
- **Inscription:** Inline on Step 3 (Review screen), not a separate step. Keeps wizard at 3 steps.
- **Date format:** Locale-based. RU: DD.MM.YYYY, EN: Mon DD, YYYY.
- **Share message tone:** Warm — "In memory of Name, YYYY–YYYY" (not factual/clinical).
- **Web fallback for shared links:** Teaser page with "Open in App" button. No full SSR memorial. Saves engineering time.
- **OG image when no photo:** Server-generated text image (name + dates on brand background). Every link preview looks unique.
- **Anonymous sticky bar:** Appears after 3 seconds of scrolling, not immediately. Memorial makes the first impression.
- **Draft persistence:** Close mid-wizard → "Continue draft?" prompt next time user taps "+".

## 2026-02-08 — MVP backlog approved (20 stories)
- **Scope cuts confirmed:** CemeterySearch, ManageGrave, NotificationSettings, LanguageToggle, AccountSettings dropped. AddGrave is 3 steps. InviteFamily replaced by native share.
- **Manual pin in AddGrave:** User places a draggable pin on the map, not auto GPS capture.
- **Target launch: March 14** (second Parental Saturday). Not March 7. Radonitsa (Apr 21) is the big day.
- **iOS first.** Android Play Store submission follows after iOS App Store.

## 2026-02-08 — Codebase state assessment
- **Decision:** Current MVP scope of 20 screens is too large for 5-week timeline. Team consensus is to cut to ~10 functional screens.
- **Rationale:** 14 of 20 screens are unbuilt, components/ is empty, no shared UI components exist. 20 screens in 5 weeks is unrealistic for a solo dev + AI agents workflow.
- **Status:** Pending Oleg's confirmation on exact cut list.

## 2026-02-08 — No UI library
- **Decision:** No Tamagui or external UI library. Use custom design tokens in `constants/tokens.ts`.
- **Rationale:** Tamagui has compatibility issues with Expo SDK 54 + New Architecture. Custom tokens give 80% of the polish for 30 minutes of setup.

## 2026-02-08 — AddGrave wizard architecture
- **Decision:** Single route (`app/add-grave/index.tsx`) with internal step counter. Step components live in `components/add-grave/`. Zustand + MMKV for form state.
- **Rationale:** 6 separate Expo Router routes cause Android back-navigation chaos. Single route with internal state is simpler and more reliable.

## 2026-02-08 — Agent communication protocol tightened
- **Decision:** Reduced agent output cap from 800 to 600 tokens. Added task IDs, mandatory handoff summaries (150 tokens max), post-parallel synthesis requirement.
- **Rationale:** Sarah Kabakoff's recommendation — heavily index on agent communication contracts to prevent context drift. Prior agent runs were exceeding 800 tokens regularly.
