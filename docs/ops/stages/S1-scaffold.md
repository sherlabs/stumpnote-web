# S1 Scaffold: Next.js + Payload + Tailwind, DB adapter, collections skeleton, quality scripts, local Postgres, first DB-free deploy

Read first: [CLAUDE.md](../../../CLAUDE.md), [STATUS.md](../../../STATUS.md), spec [01-architecture.md](../../spec/01-architecture.md), [03-cms-model.md](../../spec/03-cms-model.md) (skeleton only), [07-deploy-runbook.md](../../spec/07-deploy-runbook.md) sections 1 to 3, [08-test-and-quality.md](../../spec/08-test-and-quality.md) section 8.

## Goal
A running Next.js + Payload app in this repo: local dev against Docker Postgres, all collections and globals present as skeletons, quality scripts in place, a DB-free production build that deploys to Vercel project `stumpnote-site` as a skeleton page. Database provisioning gates recorded as BLOCKED.

## Prerequisites
- Node 24.x (`node -v`), pnpm 10 (`corepack enable && corepack prepare pnpm@latest-10 --activate`), Docker running.
- `gh auth status` ok; Vercel CLI logged in (`npx vercel@latest whoami`).
- Disk check: `df -h /` (need ~3 GB free for `node_modules` + `.next`). Use the shared pnpm store (`pnpm config get store-dir`).
- Decision D-01 default (existing Pro team) unless `STATUS.md` says otherwise.

## Steps
- [ ] S1-01 Scaffold from the Payload website template into a temp dir, then copy into the repo root without overwriting `README.md`, `NOTICE`, `CLAUDE.md`, `STATUS.md`, `TASKS.md`, `docs/`, `.gitignore` (merge the template's gitignore lines into ours):
  ```bash
  cd "$(mktemp -d)" && pnpm dlx create-payload-app@latest stumpnote-site --template with-vercel-website --no-deps --use-pnpm
  rsync -a --exclude .git --exclude README.md --exclude .gitignore stumpnote-site/ /Users/nilesh93/Projects/personal/stumpnote-site/
  ```
  If `create-payload-app` cannot fetch the template, clone `payloadcms/payload` sparse (`templates/with-vercel-website`) and copy.
- [ ] S1-02 Pin versions per D-02: all `@payloadcms/*` and `payload` to the same latest 3.x (>= 3.90.2); `next` inside the peer range printed by `pnpm why @payloadcms/next` / registry; `engines.node = "24.x"`; `packageManager` pnpm 10. Replace `@payloadcms/db-vercel-postgres` with `@payloadcms/db-postgres`. `pnpm install`.
- [ ] S1-03 `payload.config.ts`: `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI, max: 1 }, push: process.env.PAYLOAD_PUSH === 'true', migrationDir: './migrations' })`; `serverURL` from `NEXT_PUBLIC_SERVER_URL`; `cors`/`csrf` = that origin; storage adapter `vercelBlobStorage` enabled only when `BLOB_READ_WRITE_TOKEN` is set; email adapter only when `RESEND_API_KEY` set; remove the template's `jobs`/`schedulePublish` config (D-09); `admin.user = 'users'`.
- [ ] S1-04 Collections and globals as skeletons with the exact slugs and the key fields from [03-cms-model.md](../../spec/03-cms-model.md) (title, slug, status/select enums, relationships, access functions). Full field sets come in S4/S5/S6. Files: `src/collections/{Pages,Features,Personas,Posts,ChangelogEntries,Faqs,Testimonials,LegalPages,Media,Users,WaitlistSignups,AuditLog}.ts`, `src/globals/{SiteSettings,Navigation,BetaAccess,LegalValues,AnalyticsSettings,PriceScenarios}.ts`, `src/access/{isAdmin,isEditor,isAdminOrSelf,publishedOnly}.ts`. Users auth options per [01-architecture.md](../../spec/01-architecture.md) 8.1; `roles` select [admin, editor, viewer].
- [ ] S1-05 Route groups: keep the template's `(payload)` group; create `(site)` with `layout.tsx` (html lang, `data-theme="dark"`, `data-persona="player"`, skip link, `main`), `page.tsx` (skeleton: wordmark text "StumpNote", one sentence, link to `https://app.stumpnote.com`), `not-found.tsx`, `robots.ts` (disallow `/admin`, `/api`, `/lab`), `sitemap.ts` (static routes only for now), `lab/page.tsx` (empty shell, `noindex`).
- [ ] S1-06 `src/styles/tokens.css` with the token block from [02-design.md](../../spec/02-design.md) section 2 verbatim, imported in `globals.css`; Tailwind 4 `@theme` mapping the CSS variables. No component styling yet.
- [ ] S1-07 `next.config.mjs`: `withPayload`, `images.unoptimized = true` for now, `headers()` with the security headers from [01-architecture.md](../../spec/01-architecture.md) 8.3 (CSP as Report-Only), `X-Robots-Tag` for `/admin`, `/api`, `/lab`. `vercel.json` with the `ignoreCommand`.
- [ ] S1-08 DB-free build guard: no Payload Local API calls at build time when `DATABASE_URI` is unset (`generateStaticParams` return `[]`; home page is static without CMS reads). Verify: `env -u DATABASE_URI pnpm build` succeeds.
- [ ] S1-09 Local DB: `docker-compose.yml` (`postgres:17-alpine`, db `stumpnote_cms`, port 5433 to avoid clashing with `supabase start`), scripts `db:up`, `db:down`, `db:reset`. `.env.example` with every name from [01-architecture.md](../../spec/01-architecture.md) section 5 and empty values. Local `.env` (gitignored) with `DATABASE_URI=postgres://postgres:postgres@localhost:5433/stumpnote_cms`, `PAYLOAD_SECRET` (random), `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`, `ANALYTICS_MODE=fixtures`.
- [ ] S1-10 First migration: `pnpm db:up && pnpm payload migrate:create initial && pnpm payload migrate`. Commit `migrations/`. `pnpm payload generate:types && pnpm payload generate:importmap`; commit outputs.
- [ ] S1-11 Quality scripts in `package.json` per [01-architecture.md](../../spec/01-architecture.md) section 10: `check`, `lint`, `typecheck`, `format`, `test:e2e` (Playwright installed, `tests/playwright/smoke.spec.ts` + `routes.json`), `scripts/check-secrets.sh` (regex for common key shapes + `.env` files). `pnpm check` green.
- [ ] S1-12 Local verification: `pnpm dev`; `/` renders; `/admin` shows create-first-user (create a local-only admin); create one Feature in the admin; `pnpm test:e2e --project=chromium-desktop tests/playwright/smoke.spec.ts` green.
- [ ] S1-13 Vercel: follow [07-deploy-runbook.md](../../spec/07-deploy-runbook.md) section 2 (`vercel link` to project `stumpnote-site` in the team per D-01; `git connect`). Build command `pnpm build`; add env `PAYLOAD_SECRET` (generate locally with `openssl rand -hex 32`, add via `vercel env add`), `NEXT_PUBLIC_SERVER_URL` (the `*.vercel.app` URL for now), `ANALYTICS_MODE=fixtures`. Do NOT add `DATABASE_URI` yet. Push `main`; confirm the skeleton deploys and `/` returns 200. `/admin` will error without a DB: acceptable for the skeleton; it must not break `/`.
- [ ] S1-14 Record BLOCKED gates in `STATUS.md` (Neon install, Blob store, first admin user) with the click-paths from the runbook section 3. Record the Vercel team choice as a D-01 note in `docs/spec/decisions.md` (accepted/proposed) without committing the team slug.
- [ ] S1-15 Clean up: `rm -rf node_modules .next` after verification (document in STATUS that a fresh session must `pnpm install`).
- [ ] S1-16 Update `STATUS.md` (S1 row: status, last commit, next action = "wait for gates; then S2"), `TASKS.md` (tick S1 ids), commit, push.

## Files created (summary)
`package.json`, `pnpm-lock.yaml`, `next.config.mjs`, `tsconfig.json`, `vercel.json`, `docker-compose.yml`, `.env.example`, `src/payload.config.ts`, `src/payload-types.ts`, `src/collections/*`, `src/globals/*`, `src/access/*`, `src/app/(site)/*`, `src/app/(payload)/*`, `src/styles/{tokens,globals}.css`, `migrations/*`, `tests/playwright/{smoke.spec.ts,routes.json,playwright.config.ts}`, `scripts/check-secrets.sh`, `.prettierrc`, `eslint.config.mjs`.

## Acceptance criteria
- `pnpm check` green; `env -u DATABASE_URI pnpm build` green; `pnpm dev` serves `/` and `/admin` locally with Docker Postgres.
- All 12 collections and 6 globals appear in the local admin with the specified slugs.
- `migrations/` committed; `payload-types.ts` committed; no `.env` committed (`git ls-files | grep -c '^\.env$'` is 0).
- Vercel project `stumpnote-site` exists, linked to `sherlabs/stumpnote-web`, production deployment of `main` serves `/` with 200.
- `STATUS.md` lists the three BLOCKED gates with click-paths.

## Verification commands
```bash
pnpm check && env -u DATABASE_URI pnpm build | tail -20
pnpm db:up && pnpm payload migrate | tail -5
pnpm test:e2e --project=chromium-desktop tests/playwright/smoke.spec.ts | tail -20
git ls-files | grep -E '^\.env($|\.)' | grep -v example   # expect no output
curl -sI https://<deployment>.vercel.app/ | head -3
```

## Rollback
Skeleton only: `git revert` the offending commit; Vercel auto-redeploys the previous state. Local DB: `pnpm db:reset`.

## Finish
Update STATUS.md + TASKS.md; commit; push.
