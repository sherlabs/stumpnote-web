# Private-repo deliverable: analytics views migration (NOT applied)

Status: instructions only. Nothing here has been run. Do this ONLY when the owner says "prepare the analytics migration PR", and never from the read-only local clone at `/Users/nilesh93/Projects/personal/stumpnote`. The SQL source of truth is [../../spec/supabase-analytics-views.sql](../../spec/supabase-analytics-views.sql); the privacy rules and the grant list are in [../../spec/04-analytics-and-admin.md](../../spec/04-analytics-and-admin.md) sections 6, 8 and 9.

## 1. Prepare the PR (fresh clone, feature branch)
```bash
tmp=$(mktemp -d) && gh repo clone sherlabs/stumpnote "$tmp/stumpnote" && cd "$tmp/stumpnote"
git checkout -b feat/analytics-admin-views
ts=$(date -u +%Y%m%d%H%M%S)
cp <path-to-this-repo>/docs/spec/supabase-analytics-views.sql supabase/migrations/${ts}_analytics_admin_views.sql
```
Before committing, in the new migration:
1. Re-verify every column named in the views against the live migrations (`schema_contract_test.ts` covers edge functions, not these views): `ai_usage_log` v2 columns, `profiles.role` values, `user_subscriptions` columns. A wrong column fails `supabase start`.
2. Pre-apply step from spec 04 section 8: list the functions in `public` that PUBLIC can execute (default function privileges) and tighten their grants with explicit grants to the intended roles, because a new role inherits PUBLIC execute rights.
3. Confirm with the owner which `subscription_provider` values the store webhook writes (draft assumes `apple`, `google`).
4. Decide whether the draft's function and column names should stay public in the website repo (STATUS.md, "Spec review questions").

## 2. SQL tests to add (private repo test suite)
Role privileges: `payload_analytics_ro` cannot read `public.*`, cannot write, is not a member of `authenticator`, `anon` or `authenticated`, `rolbypassrls = false`. Grants: exactly the 14 views and 4 functions of spec 04 section 9 are readable or executable; the two internal views and both tables are not. k-suppression: with fewer than k subjects the six suppressed views and `ai_subject_cost_dist` return no rows, `ai_daily.subjects` is null, `ai_top_spenders` returns nothing below 4 x k subjects. Owner semantics: as the role, `select count(*) from analytics.ai_daily` works and any `public` table or RPC is denied. Keep `schema_contract_test` green.

## 3. Verify locally, then open the PR
```bash
supabase start            # applies ALL migrations to a local Postgres
<run the repo SQL tests and the full backend suite from the private repo CLAUDE.md>
supabase stop
gh pr create --repo sherlabs/stumpnote --title "feat: analytics schema, read-only role and aggregate views" --body-file <description>
```
The description must say: aggregate-only, k-anonymity k=5, role is NOLOGIN until the owner sets a password out of band, nothing is exposed through PostgREST, reversible (see rollback).

## 4. Owner steps after merge (also listed in STATUS.md, Blocked)
1. Apply the migration to production.
2. In the Supabase SQL editor, once, with a generated password the owner keeps in a password manager: `alter role payload_analytics_ro login password '<generated>';`
3. Compose the pooler URL: transaction mode, port 6543, username `payload_analytics_ro.<project-ref>`, `sslmode=require`; confirm the pooler accepts that username form.
4. Add it as `STUMPNOTE_ANALYTICS_DATABASE_URL` in Vercel Production (Sensitive). If the pooler chain does not verify against the system store, add its CA as `STUMPNOTE_ANALYTICS_CA_CERT`. TLS verification is never switched off.
5. Add founder and test accounts to `analytics.excluded_subject` in the SQL editor.
6. Set `ANALYTICS_MODE=live`, redeploy, open the three admin views and check the freshness line.

## 5. Rollback
Set `ANALYTICS_MODE=fixtures` in Vercel and redeploy: the admin disconnects from the database instantly. To remove the database side: `drop schema analytics cascade; drop role payload_analytics_ro;` (revoke the role's connect grant first if it was granted).
