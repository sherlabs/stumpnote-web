# 04 Analytics and admin: website analytics, AI spend, product analytics

Index: [README.md](./README.md). Decisions D-06, D-07, D-08 in [00-overview.md](./00-overview.md). Access design in [01-architecture.md](./01-architecture.md) sections 8 and 9. SQL: [supabase-analytics-views.sql](./supabase-analytics-views.sql). Executed in S6 ([brief](../ops/stages/S6-admin-analytics.md)).

Hard rules: admin role only; server components only; aggregate-only; k-anonymity k >= 5 on any subject breakdown; no real numbers, ids or screenshots of live data committed to this repo; fixtures are synthetic and labelled.

## 1. Website analytics (D-06; owner decision D-ANALYTICS in [USER-DECISIONS.md](./USER-DECISIONS.md))

**Step zero in S6: verify the owner's chosen plugin.** The owner chose the NouanceLabs `payload-dashboard-analytics` plugin. Registry metadata on 2026-10-04 (latest 0.3.0, 2023-05-25, peer `payload ^1.6.16`) says it will not install against Payload 3.90. S6 proves it one way or the other in a scratch branch and records the result in `STATUS.md`. If it works: wire it with its privacy-friendly provider (Plausible) and skip the custom view for web analytics (keep sections 2 and 3). If it does not: build the custom view below for the provider the owner picks; never switch plugins silently.

**Provider abstraction:** `src/analytics/web-provider.ts` exposes `getWebPanels(range)`; adapters `plausible.ts` (Stats API v2, server key) and `posthog.ts` (HogQL). Panels and event names below are provider-neutral.

**Fixtures-mode default (build only): PostHog adapter wired but inactive.** The agent never goes live on a provider the owner has not chosen; going live requires the owner's answer plus the account gate. If the owner picks PostHog Cloud (EU region, free tier), the site snippet `posthog-js` is initialised after idle with:
```ts
posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: NEXT_PUBLIC_POSTHOG_HOST,   // https://eu.i.posthog.com
  cookieless_mode: 'always',
  person_profiles: 'never',
  capture_pageview: true, capture_pageleave: true,
  autocapture: false, disable_session_recording: true,
  respect_dnt: true,
})
```
Project setting required in PostHog: Web analytics, "Cookieless server hash mode" enabled (user step). The admin session cookie set by Payload is strictly necessary and is the only cookie on the site.

**If Plausible is chosen instead:** script `https://plausible.io/js/script.js` (cookieless by design), Stats API v2 with a server-side key (`PLAUSIBLE_API_KEY`, `PLAUSIBLE_SITE_ID`, `PLAUSIBLE_API_HOST`); custom events via `plausible('cta_click_beta', {props})`. Plausible has no free plan, so the account is a BLOCKED billing step for the owner.

**Plugins not used and why:** the Payload 3 community PostHog plugin exposes its data endpoint without an authentication check; GA4 plugins require a consent banner (only if the owner explicitly chooses GA4).

**Consent/cookie stance:** cookieless, aggregate-only, no cross-site tracking, no advertising tags. `/cookies` states this and names the admin session cookie. Child-account analytics in the app are off; the marketing site does not know who is a child and collects nothing identifying.

**Custom events (site-defined, no PII):** `cta_view_hero`, `cta_click_beta`, `beta_form_submit` (persona only), `outbound_app_link`, `persona_switch` (persona), `motion_toggle` (state), `pricing_view`, `legal_view` (slug).

**Admin view `/admin/analytics/web`** (server component, admin only, 5 min cache):

| Panel | Query (HogQL, parameterised by range) | Chart |
|---|---|---|
| Visitors and pageviews per day | `select toDate(timestamp) d, count() pv, count(distinct person_id) v from events where event='$pageview' and timestamp >= now() - interval {days} day group by d order by d` | Time series, two lines |
| Top pages | group by `properties.$pathname`, limit 15 | Bar list |
| Referrers | group by `properties.$referring_domain`, limit 10 | Bar list |
| Countries | group by `properties.$geoip_country_code`, limit 10 | Bar list |
| Devices | group by `properties.$device_type` | Stacked bar |
| Beta funnel | counts of `cta_view_hero` → `cta_click_beta` → `beta_form_submit` → `outbound_app_link` | Funnel bars with conversion % |
| Persona interest | `persona_switch` + `beta_form_submit` by persona | Bar list |
| Web vitals (if captured) | p75 of `$web_vitals_LCP_value`, `CLS`, `INP` (property names to verify against live data) | Stat tiles |

Filters: range 7d / 30d / 90d (default from `analytics-settings`). Refresh: on navigation, cached 5 min. Rate limits respected (240/min). Every query is a fixed string with only the range interpolated as an integer.

## 2. StumpNote AI-spend view `/admin/analytics/ai-spend`

Data source: `analytics.*` views via `STUMPNOTE_ANALYTICS_DATABASE_URL` (fixtures when `ANALYTICS_MODE=fixtures`). Cache 10 min. Access: admin. Every panel shows the source freshness from `analytics.data_freshness()`.

| Panel | Purpose | Query (view / function) | Chart | Filters |
|---|---|---|---|---|
| Month to date | Spend so far, projected end of month, days left | `ai_budget_month` | 3 stat tiles + progress vs budget (budget set in view, stored in `analytics-settings.monthlyBudgetUsd`) | none |
| Daily cost | Trend and spikes | `ai_daily` summed by day | Area chart | range, model, function, scope |
| Cost by function | Which features cost most | `ai_daily` grouped by `function_name` | Horizontal bars, top 12 | range |
| Cost by model | Model mix | `ai_daily` grouped by `model` | Stacked bars per day | range |
| Cache savings | Value of caching | `ai_cache_layer_daily` | Stacked area by `cache_layer` + "saved vs spent" ratio tile | range |
| Waste | Cost of failed / timed-out calls | `ai_daily.wasted_cost_usd`, `errors`, `timeouts`, `retries` | Small multiples | range |
| Latency | p50 / p95 per function | `ai_latency_daily` | Dot plot per function | range, function |
| Voice flow cost | Cost of a full voice-entry chain | `ai_voice_flow_daily` | Line (p50, p90, mean) | range |
| Per-subject distribution | Spread of spend per player, no ids | `ai_subject_cost_dist(days)` | Box-like tile row (p50, p90, p99, max, mean, n) | range |
| Top spenders | Concentration, ranks only | `ai_top_spenders(days, 5)` | Bar list "Rank 1..5" with % of subject spend | range |
| Token volume (30d) | Inputs to price scenarios | `ai_token_volume_30d` | Table | none |
| Price scenarios | What-if re-pricing of current volume | `ai_token_volume_30d` × `price-scenarios` global | Table: scenario, projected 30d cost, delta % | scenario |
| Data quality | Trust the numbers | `ai_data_quality_daily` | Stat tiles (rows without subject, unknown pricing, zero-token rows) | range |

Scenario rates live only in the admin-editable `price-scenarios` global (never seeded in the repo). The view computes `cost = Σ(tokens/1e6 × rate)` per modality and compares to `logged_cost_usd`.

## 3. Product analytics view `/admin/analytics/product`

Cache 15 min. Admin only. Every breakdown that could identify a small group is k-suppressed in SQL.

| Panel | Purpose | Query | Chart | Filters |
|---|---|---|---|---|
| Active users | DAU / WAU / MAU (activity proxy) | `active_users_daily` | 3 lines, 120 days | none |
| Signups | Accounts and onboarding completion by persona | `signups_daily` | Stacked bars by persona + onboarding % | range |
| Feature adoption | Events and users per feature | `feature_adoption_daily` | Heat table (feature × week) | range |
| Adoption by persona (30d) | Which persona uses what | `feature_adoption_by_persona_30d` | Grouped bars; cells < k hidden with a note | none |
| Retention | Weekly cohorts | `retention_weekly` | Cohort triangle, % of cohort | none |
| Funnel | Signup → onboarded → first entry → first entry in 7d → 3+ entries → trial → store subscribed | `funnel_weekly` | Funnel per cohort + persona | cohort range, persona |
| Subscriptions | Tier / provider / trial mix | `subscription_status` | Treemap or stacked bar | none |
| RevenueCat (phase 2) | MRR, trials, active subs | RevenueCat v2 metrics overview (server, 30 min cache) | Stat tiles | none |

Caveats shown in the UI: "Activity is a proxy built from product actions, not app opens." "Cells with fewer than k users are hidden."

## 4. Dashboard widgets (home of `/admin`)

Payload's modular dashboard widgets are experimental; use them only for three small tiles that link to the full views: visitors (7d), AI spend MTD, MAU. Implement via `admin.components.beforeDashboard` if widgets prove unstable. Also add `afterNavLinks` with an "Analytics" group (Web, AI spend, Product) visible to admins only.

## 5. Alerts and budgets

No cron (D-09), so alerts are "on view" and in the providers:
- AI spend: `analytics-settings.monthlyBudgetUsd` (admin-entered; not seeded). The MTD tile turns to the "attention" state (neutral colour + word "Over pace") when `projected_eom_usd > budget`. The audit log records when an admin saw an over-pace state.
- Vercel: Spend Management notifications at 50/75/100% (dashboard, user step; never "pause production").
- Neon: free-plan compute usage checked weekly from the Neon console (user).
- Web analytics provider: PostHog free-tier event cap (the web view shows the month's event count against the cap) or Plausible plan pageview limit, whichever is configured.

## 6. Privacy rules (enforced)

1. Aggregate-only: no view returns an id, email, name, free text, or a row describing one person.
2. k-anonymity: `analytics.config.k_min = 5`; any cell below is suppressed in SQL, not in the UI. Changing k is a reviewed private-repo change.
3. Excluded accounts: founder and test accounts are listed in `analytics.excluded_subject` (SQL editor only) and removed from activity, retention and distributions.
4. Server-only: `src/analytics/*` import `server-only`; browsers receive rendered aggregates only.
5. Role gate: `admin` role required; a Playwright test asserts 404 for anonymous and `viewer`/`editor`.
6. Fixtures: `src/analytics/fixtures/*.json` are synthetic; a banner says "Sample data" whenever `ANALYTICS_MODE=fixtures`.
7. No real numbers in the repo: no screenshots of live dashboards, no seeded budgets or rates.
8. Audit: every view render writes an `audit-log` row; throttle above 30 views/min per user.

## 7. Charting

Recharts 3 in client components that receive already-fetched props. Palette: Payload `--theme-*` for axes and text; persona accents (`--accent-player`, `--accent-coach`, `--accent-parent`, `--accent-team`) as the four categorical colours, `--muted` for "other". Sequential scales use `color-mix` from `--surface` to `--accent-player`. Values use tabular numerals. Every chart has a `<table>` fallback (visually hidden) and a text summary line.

## 8. Tests to add in the private repo with the migration

- Role privileges: `payload_analytics_ro` cannot read `public.*`, cannot write, is not a member of `authenticator`, `anon` or `authenticated`, has `rolbypassrls = false`.
- Grants: exactly the 14 views + 4 functions in section 9 are readable/executable; the two internal views and both tables are not.
- k-suppression: with fewer than k subjects, `feature_adoption_by_persona_30d`, `retention_weekly`, `ai_subject_cost_dist`, `ai_top_spenders` return no rows.
- Existing `schema_contract_test` stays green.
- Open risk to check: any `SECURITY DEFINER` function in `public` that PUBLIC can execute would be executable by the new role too. List them and revoke from PUBLIC with explicit grants to `anon`, `authenticated`, `service_role` before applying.

## 9. Full SQL object list (must match the GRANT block in the SQL file)

Views readable by `payload_analytics_ro` (14):
1. `analytics.ai_daily`
2. `analytics.ai_cache_layer_daily`
3. `analytics.ai_latency_daily`
4. `analytics.ai_voice_flow_daily`
5. `analytics.ai_budget_month`
6. `analytics.ai_token_volume_30d`
7. `analytics.ai_data_quality_daily`
8. `analytics.active_users_daily`
9. `analytics.signups_daily`
10. `analytics.feature_adoption_daily`
11. `analytics.feature_adoption_by_persona_30d`
12. `analytics.retention_weekly`
13. `analytics.funnel_weekly`
14. `analytics.subscription_status`

Functions executable by the role (4):
1. `analytics.ai_subject_cost_dist(int)`
2. `analytics.ai_top_spenders(int, int)`
3. `analytics.data_freshness()`
4. `analytics.k_min()`

Internal, not granted: views `analytics._activity_user_day`, `analytics._feature_events`; tables `analytics.config`, `analytics.excluded_subject`.

## 10. Fixture shapes

One JSON file per object above under `src/analytics/fixtures/`, each an array of rows with the exact column names and plausible synthetic values (small, invented numbers; 120 days for daily views). A `generate-fixtures.ts` script produces them deterministically from a seed so they can be regenerated without hand-editing.
