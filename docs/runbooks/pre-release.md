# Pre-Release Checklist

Run before every version tag push.

## Supabase Migrations
- [ ] Check unapplied migrations: `supabase migration list --db-url $PROD_DB_URL`
- [ ] If unapplied: `supabase db push --db-url $PROD_DB_URL`
- [ ] If `db push` fails mid-migration: check which migrations applied (`migration list`), fix the failing migration SQL locally, create a new migration, and re-run `db push`. Do NOT manually edit prod schema.

## Edge Functions
- [ ] Deploy all edge functions:
  ```bash
  supabase functions deploy accept-invite --project-ref $PROD_REF
  supabase functions deploy delete-user --project-ref $PROD_REF
  ```

## RLS Smoke Test
- [ ] Verify RLS policies work against prod: call a protected endpoint (e.g., fetch graves as anon — should return empty, not error)

## Release
- [ ] Push version tag: `git tag v1.x.x && git push origin v1.x.x`
- [ ] Monitor EAS build logs for errors
- [ ] Verify TestFlight submission succeeds
