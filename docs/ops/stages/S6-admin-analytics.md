# S6 Admin: website analytics + StumpNote AI-spend and product analytics views

Read first: [CLAUDE.md](../../../CLAUDE.md), [STATUS.md](../../../STATUS.md), spec [04-analytics-and-admin.md](../../spec/04-analytics-and-admin.md) (all), [01-architecture.md](../../spec/01-architecture.md) sections 5, 8, 9, [supabase-analytics-views.sql](../../spec/supabase-analytics-views.sql), [03-cms-model.md](../../spec/03-cms-model.md) globals `analytics-settings`, `price-scenarios`, collection `audit-log`.

## Goal
Three admin-only analytics views (`/admin/analytics/web`, `/admin/analytics/ai-spend`, `/admin/analytics/product`), dashboard tiles and nav links, PostHog cookieless tracking on the site, an audit log, and the whole thing working on synthetic fixtures (`ANALYTICS_MODE=fixtures`) before any credential exists. Live adapters are wired behind env checks and switched on only when the user has cleared the gates.

This stage can run in parallel with S3..S5 once S1 is done.

## Prerequisites
- S1 done (`users.roles`, access helpers). S2 helps (tokens) but is not required.
- PostHog account and keys: user step (BLOCKED gate). Supabase analytics migration applied + role password: user step (BLOCKED gate). Both can remain blocked; the stage completes on fixtures.

## Steps
- [ ] S6-00 Verify the owner's chosen plugin (D-ANALYTICS in `docs/spec/USER-DECISIONS.md`): in a scratch branch run `pnpm view @nouance/payload-dashboard-analytics version time peerDependencies` and `gh api repos/NouanceLabs/payload-dashboard-analytics --jq '.pushed_at'`; try `pnpm add @nouance/payload-dashboard-analytics` and boot the admin. Record the exact result in `STATUS.md` (versions, peer range, install/boot outcome). If compatible: wire it with its privacy-friendly provider and skip the custom web view (S6-03 builds only ai-spend and product). If incompatible (expected: peer `payload ^1.6.16`): write the reason in `STATUS.md`, record in `decisions.md`, and build the custom web view through `src/analytics/web-provider.ts` for the provider the owner picked (Plausible or PostHog; default PostHog if unanswered). Never switch plugins silently. Delete the scratch branch.
- [ ] S6-01 `src/analytics/` with `import 'server-only'` everywhere: `types.ts` (zod schemas for every object in [04-analytics-and-admin.md](../../spec/04-analytics-and-admin.md) section 9 and the PostHog panels), `fixtures/` + `generate-fixtures.ts` (deterministic synthetic data, 120 days), `cache.ts` (`unstable_cache` TTLs 5/10/15/30 min), `posthog.ts` (HogQL client, fixed query strings, 10 s timeout, 429 handling), `stumpnote-db.ts` (`pg` Pool max 2, ssl, statement timeout, fixed SQL per view/function, clamped params), `revenuecat.ts` (stub returning fixtures; live call only when keys present), `scenarios.ts` (price-scenario calculator over `ai_token_volume_30d`), `index.ts` (`getWeb()`, `getAiSpend()`, `getProduct()` switching on `ANALYTICS_MODE` and key presence).
- [ ] S6-02 Access: `requireAdmin(initPageResult)` helper returning `notFound()` for anonymous or non-admin. Audit write + throttle (30/min) in the same helper.
- [ ] S6-03 Admin views (server components) registered under `admin.components.views` with paths `/analytics/web`, `/analytics/ai-spend`, `/analytics/product`, wrapped in `DefaultTemplate`; `RangePicker` via `searchParams`; `SampleDataBanner` when fixtures; charts in `src/admin/components/charts/*` (Recharts 3 client components, tokens per [04-analytics-and-admin.md](../../spec/04-analytics-and-admin.md) section 7; hidden `<table>` fallback). Panels exactly as the three tables in sections 1 to 3.
- [ ] S6-04 Dashboard: `beforeDashboard` with three link tiles (visitors 7d, AI spend MTD, MAU) and `afterNavLinks` "Analytics" group, both admin-only. Regenerate importmap; commit.
- [ ] S6-05 Globals `analytics-settings` (incl. `monthlyBudgetUsd`, admin-entered, not seeded) and `price-scenarios` (ships empty); `audit-log` collection; migration + types.
- [ ] S6-06 Site tracking: `src/lib/track.ts` initialises `posthog-js` after idle only when `NEXT_PUBLIC_POSTHOG_KEY` is set, with the cookieless options from [04-analytics-and-admin.md](../../spec/04-analytics-and-admin.md) section 1; custom events named there; `connect-src` in CSP updated. No cookie banner.
- [ ] S6-07 Optional MFA: evaluate `payload-totp` compatibility with the pinned Payload version; if clean, add behind `ENABLE_TOTP=1` (env name added to the catalogue in `01-architecture.md` section 5 via a doc commit); record in `decisions.md`.
- [ ] S6-08 Tests: `admin.spec.ts` (anon/viewer/editor → 404; admin → renders with banner), `analytics/queries.test.ts`, fixtures schema test, `size-limit` confirms Recharts is not in `(site)` chunks.
- [ ] S6-09 Prepare the private-repo deliverable WITHOUT applying it: `docs/ops/private-repo/analytics-migration-PR.md` containing the exact steps for a fresh clone (`gh repo clone sherlabs/stumpnote <tmp>`; branch `feat/analytics-admin-views`; copy the SQL into `supabase/migrations/<ts>_analytics_admin_views.sql`; add role-privilege and k-suppression SQL tests; run `supabase start` + the repo test suite; open a PR). Do this ONLY when the user explicitly says so, and never from the read-only local clone. Until then the doc is the deliverable.
- [ ] S6-10 User-approved steps, recorded as BLOCKED with click-paths in `STATUS.md`:
  1. PostHog: sign up (EU), create project, enable cookieless server hash mode, create personal API key (Query Read), add `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_API_HOST` to Vercel Production env.
  2. Supabase: review and merge the private-repo PR; apply the migration to production; in the SQL editor `alter role payload_analytics_ro login password '<generated>'`; add `STUMPNOTE_ANALYTICS_DATABASE_URL` (pooler, port 6543, `sslmode=require`) to Vercel Production env; confirm the pooler accepts the `payload_analytics_ro.<project-ref>` username form.
  3. Set `ANALYTICS_MODE=live` in Production; redeploy; verify the three views show live aggregates and the freshness timestamp.
  4. Optional: RevenueCat v2 secret key (metrics overview read only) → `REVENUECAT_SECRET_API_KEY`, `REVENUECAT_PROJECT_ID`.
- [ ] S6-11 `rm -rf node_modules .next`; update `STATUS.md` + `TASKS.md`; commit; push.

## Files created
`src/analytics/**`, `src/admin/views/analytics/{web,ai-spend,product}.tsx`, `src/admin/components/{charts/*,RangePicker,SampleDataBanner,DashboardTiles,AnalyticsNavLinks}.tsx`, `src/collections/AuditLog.ts` (completed), `src/globals/{AnalyticsSettings,PriceScenarios}.ts` (completed), `src/lib/track.ts` (completed), `tests/unit/analytics/*.test.ts`, `tests/playwright/admin.spec.ts`, `docs/ops/private-repo/analytics-migration-PR.md`, migrations, importmap.

## Acceptance criteria
- All three views render for an admin on fixtures with the "Sample data" banner; 404 for everyone else (tested).
- Every panel listed in [04-analytics-and-admin.md](../../spec/04-analytics-and-admin.md) sections 1 to 3 exists; k-suppressed cells show "hidden (< k)".
- No analytics code in site bundles; no provider key in the client except `NEXT_PUBLIC_POSTHOG_*`.
- Repo contains no real numbers, ids, screenshots of live data, or price rates (`price-scenarios` empty; fixtures synthetic).
- Audit rows written on view; throttle works (unit test).
- The private-repo PR instructions exist; nothing was applied.

## Verification
```bash
pnpm test:unit && pnpm test:e2e tests/playwright/admin.spec.ts | tail -20
ANALYTICS_MODE=fixtures pnpm build | tail -20
grep -rn "recharts" .next/static/chunks/app/\(site\) | head   # expect none
```

## Rollback
Views are additive; set `ANALYTICS_MODE=fixtures` to disconnect live sources instantly; revert commits. Private DB: migration is reversible by dropping schema `analytics` and the role (documented in the PR doc).

## Finish
Update STATUS.md + TASKS.md; commit; push.
