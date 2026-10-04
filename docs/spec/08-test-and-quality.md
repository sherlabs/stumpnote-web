# 08 Test and quality: e2e, visual, Lighthouse, a11y, links, seed/restore, content QA

Index: [README.md](./README.md). Budgets: [02-design.md](./02-design.md) sections 10 and 11. Scripts: [01-architecture.md](./01-architecture.md) section 10. Applied from S2 onward; full pass in S5 and S7.

Principle: everything runs locally with no secrets (`ANALYTICS_MODE=fixtures`, local Docker Postgres). A secret-free GitHub Actions workflow may run the same `pnpm check` + DB-free build on PRs (added in S7). Iterate with targeted runs; run the full suite once at the end of a stage.

## 1. Tooling

| Tool | Version policy | Used for |
|---|---|---|
| Playwright (`@playwright/test`) | latest stable at S2 | e2e, a11y (axe), visual snapshots, layout-shift probe |
| `@axe-core/playwright` | latest | WCAG 2.2 AA rules |
| Lighthouse CI (`@lhci/cli`) | latest | budgets per route, mobile profile |
| `linkinator` (or a 60-line fetch script) | latest | internal link + anchor checker |
| `size-limit` | latest | initial JS budget on `/` |
| Vitest | latest | unit tests: legal renderer, access helpers, analytics query builders, fixtures shape |
| ESLint + Prettier + `tsc` | template versions | `pnpm check` |
| gitleaks (optional) or `scripts/check-secrets.sh` regex | | secret scan before push |

## 2. Playwright e2e (`tests/playwright/`)

Projects: `chromium-desktop` (1440x900), `chromium-mobile` (Pixel 7 emulation), `webkit-mobile` (iPhone 14) for a smoke subset, `reduced-motion` (chromium with `reducedMotion: 'reduce'`).

| Spec | Asserts |
|---|---|
| `smoke.spec.ts` | every public route in `routes.json` returns 200, has one `h1`, has `<title>` and meta description, no console errors |
| `nav.spec.ts` | header links, mobile sheet open/close with keyboard, skip link focuses `main`, CTA state follows `beta-access` (fixture) |
| `home.spec.ts` | hero headline is visible before any canvas mounts; persona tabs change `data-persona`; features carousel keyboard navigation; waitlist form validation + success state; no horizontal overflow at 320, 375, 768, 1024, 1440 |
| `motion.spec.ts` | with reduced motion: no `transform` animation on pinned sections, transcript fully visible, charts fully drawn, WebGL canvas absent; with motion: Lenis not active on touch project |
| `legal.spec.ts` | notice mode when placeholders exist (`noindex` meta, no `{{` in DOM); full render when fixture values complete; version route renders; print stylesheet present |
| `features.spec.ts` | index renders all seeded features with status badges from the allowed vocabulary only; feature page demo component mounts; "Illustrative scenario" label present when scenario exists |
| `pricing.spec.ts` | indicative line present on every card; no button text matching /buy|subscribe|purchase/i; page hidden when `showPricing=false` |
| `admin.spec.ts` | `/admin/analytics/*` returns 404 or redirects for anonymous; as `viewer` and `editor` test users: 404; as `admin`: renders with "Sample data" banner in fixtures mode; `/admin` noindex header |
| `seo.spec.ts` | `sitemap.xml` lists all published routes and no `/admin`, `/api`, `/lab`; `robots.txt` disallows them; JSON-LD parses and contains no `aggregateRating`; canonical uses `NEXT_PUBLIC_SERVER_URL` |
| `a11y.spec.ts` | axe on every route in both colour themes: zero `serious`/`critical` violations; focus visible on first Tab |
| `visual.spec.ts` | screenshots of `/lab` component states (persona × theme × motion) and of each home chapter in its final state; `maxDiffPixelRatio 0.01`; snapshots committed for chromium-desktop only |
| `layout-shift.spec.ts` | `PerformanceObserver` layout-shift sum < 0.05 while scrolling home at 1440 and 375 |

Test users for `admin.spec.ts` are created by `scripts/seed.ts --test-users` against the local DB only (never production); credentials are random per run and printed to the test log only.

## 3. Lighthouse CI (`tests/lighthouse/lighthouserc.json`, local only)

Run against `next build && next start` on `http://localhost:3000` with `ANALYTICS_MODE=fixtures`. Mobile preset, 3 runs, median.

Routes: `/`, `/features`, `/features/journal`, `/players`, `/parents`, `/pricing`, `/security`, `/join`, `/support`, `/privacy` (notice mode), `/blog`.

Assertions (error level): `categories:performance >= 0.95`, `accessibility >= 0.95`, `best-practices >= 0.95`, `seo >= 0.95`, `largest-contentful-paint <= 2000`, `cumulative-layout-shift <= 0.05`, `total-blocking-time <= 150`, `interactive <= 3500`, `uses-responsive-images`, `font-display`. Report HTML goes to `.lighthouseci/` (gitignored); the summary numbers are copied into `STATUS.md` at S5 and S7.

`size-limit` config: `/` first-load JS < 170 KB gzip (measured from `.next` build manifest); GSAP, Lenis, OGL and Recharts must appear only in async chunks.

## 4. Accessibility checks beyond axe

Manual checklist per stage (recorded as checked in the stage brief):
- Keyboard-only pass on Home, Join, Pricing, a feature page, a legal page.
- Screen reader pass (VoiceOver, Safari) on Home and Join: landmarks announced, demo text alternatives read, form errors announced.
- Zoom 200% and 400% at 1280 wide: no clipped content, no horizontal scroll.
- Colour contrast of every token pair used for text computed and recorded in `02-design.md` section 2 (S2).
- Reduced motion on a real device.

## 5. Link checker

`pnpm test:links` crawls `http://localhost:3000` (internal only, plus a HEAD on `https://app.stumpnote.com` and the Apple EULA URL), fails on 4xx/5xx or broken `#anchors`. Runs in S5 and S7.

## 6. Unit tests (Vitest)

- `legal/render.test.ts`: substitution, empty value stays placeholder, review markers stripped only when done, notice mode trigger, HTML escaping, importer strips the review block above the first `---`.
- `access/*.test.ts`: role helpers for anon/viewer/editor/admin.
- `analytics/queries.test.ts`: every HogQL and SQL string is a fixed template; range and limit are clamped integers; fixtures match the column names in `04-analytics-and-admin.md` section 9 (schema test with zod).
- `seo/jsonld.test.ts`: no `aggregateRating`, `offers`, `installUrl` keys until `beta-access.state === 'appstore'`.
- `content/claims.test.ts`: scans seed JSON for banned phrases from the claims policy ([05-content-brief.md](./05-content-brief.md) section 5) and for `#\d{2,4}` issue-number patterns.

## 7. Seed and restore scripts

| Script | Purpose |
|---|---|
| `pnpm db:up` / `db:down` | Docker Postgres lifecycle |
| `pnpm db:reset` | drop volume, migrate, seed (local only; refuses if `DATABASE_URI` host is not `localhost`) |
| `pnpm seed [--dry-run] [--only=features,faqs] [--test-users]` | idempotent upsert by slug from `src/seed/*.json` |
| `scripts/db-dump.sh` | `pg_dump` to `backups/` (gitignored); prompts for the URL, never reads production env from a file |
| `scripts/db-restore.sh <file>` | restore into local Docker only |
| `pnpm payload migrate:create <name>` | new migration from a fresh local DB (never from a pushed schema) |
| `pnpm payload generate:types && generate:importmap` | after any config change; both outputs committed |

## 8. Pre-push and stage gates

`pnpm check` (lint, typecheck, secrets scan, audit) before every push of code. Stage gates:

| Stage | Required green |
|---|---|
| S1 | `pnpm check`, DB-free `pnpm build`, `smoke.spec.ts` on skeleton routes |
| S2 | + `visual.spec.ts` for `/lab`, `motion.spec.ts`, contrast table recorded |
| S3 | + `home.spec.ts`, `layout-shift.spec.ts`, Lighthouse on `/` |
| S4 | + `features`, `pricing`, `nav` specs; `claims.test.ts` on seed |
| S5 | + `legal`, `seo`, `a11y` specs; link checker; full Lighthouse set |
| S6 | + `admin.spec.ts`, analytics unit tests, fixtures schema test |
| S7 | everything once; production URLs re-checked with Lighthouse from the user's machine; results in `STATUS.md` |

## 9. Content QA checklist (S4, S5, S7)

- [ ] Every status badge uses one of the four allowed labels.
- [ ] No banned phrase from the claims policy anywhere (unit test + manual read).
- [ ] No App Store badge; CTAs read "Join the beta" / "Coming soon to the App Store".
- [ ] No user counts, ratings, press logos, testimonials (slot empty).
- [ ] All screenshots are synthetic and labelled "Sample data"; no real names, emails or ids.
- [ ] Fictional personas appear only in "Illustrative scenario" blocks.
- [ ] Every AI surface shows "AI can make mistakes. Not medical or psychological advice."; footer disclosure present.
- [ ] Pricing cards carry the indicative line; "Pro Player" naming; no buy button.
- [ ] Legal pages in honest notice mode or complete; no `{{` rendered.
- [ ] Contact shows only configured mailboxes or the in-app route.
- [ ] No private-repo issue numbers, branch names, project refs or model price tables anywhere in the repo (`grep -rnE '#[0-9]{2,4}\b|feat/' --include=*.md --include=*.json --include=*.ts* src docs` ignoring hex colours).
- [ ] Copy within display line limits (3 lines desktop) checked visually at 1440 and 375.
