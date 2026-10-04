# Handoff: running the StumpNote website without an agent

Everything here is a plain procedure. Names of environment variables are listed in `docs/spec/01-architecture.md` section 5 (the only list; values live in Vercel and never in git). If a step needs a login, terms acceptance, payment or DNS, it is yours to click; the click-paths below are exact.

## 1. What runs where

| Thing | Where | Notes |
|---|---|---|
| Public site | Vercel project `stumpnote-site` (production alias https://stumpnote-site.vercel.app, target https://stumpnote.com) | Deploys on every push to `main`. A docs-only push is skipped on purpose (`vercel.json` `ignoreCommand`). |
| CMS and admin | `/admin` on the same deployment | Payload 3. Needs the database (section 2). |
| Database | Neon Postgres via the Vercel Marketplace (not yet installed, gate S1-U1) | Until then every page renders from the identical copy in code and `/admin` returns an error by design. |
| Media | Vercel Blob (not yet created, gate S1-U2) | Unset locally means files on disk. |
| Repo | https://github.com/sherlabs/stumpnote-web (public) | Secret scanning, push protection and Dependabot are on. CI is `.github/workflows/ci.yml`. |
| Flutter web app | https://app.stumpnote.com (separate Vercel project `stumpnote-web`) | Never touch it from this repo. |

## 2. One-time gates the owner still has to clear (in this order)

1. Neon database: Vercel, the Pro team, **Storage**, **Create Database**, **Neon**, accept the terms, plan **Free**, name `stumpnote-cms`, nearest region (Sydney or Singapore), connect to project `stumpnote-site` for **Production** and **Preview**. Then set `DATABASE_URI` (pooled URL) and `DATABASE_URI_UNPOOLED` (direct URL) from the variables Neon wrote, make a Neon branch `preview` for the Preview scope, switch the project build command to `pnpm ci` (runs `payload migrate` then the build), redeploy.
2. Blob: Vercel, project `stumpnote-site`, **Storage**, **Create**, **Blob** (adds `BLOB_READ_WRITE_TOKEN`).
3. First admin: open `/admin` on the production URL and create the account yourself (the first account is forced to the admin role by a hook). Do this immediately after step 1: until the first user exists anyone could register. Optional: set `RESEND_API_KEY` and `EMAIL_FROM` for password reset email.
4. Seed production content (an agent session with you present, or yourself): `DATABASE_URI=<unpooled url> SEED_ALLOW_REMOTE=1 pnpm seed` for the pages, features, FAQs, personas, globals and the first changelog entry ("Website launched"), then `SEED_ONLY=legal` for the legal drafts. Run `pnpm seed:dry` first. Export the URL for that one command only; never save it to a file. The seed is idempotent and never overwrites what an editor changed (`SEED_FORCE=1` does).

Local development: `nvm use && pnpm install`, `pnpm db:up` (Docker Postgres), copy `.env.example` to `.env` and fill names, `pnpm payload migrate`, `pnpm seed`, `pnpm dev`. `pnpm check` is the pre-push gate; `pnpm test:e2e` runs Playwright; `pnpm test:lh` runs Lighthouse (add `--base=https://stumpnote-site.vercel.app` for a deployed origin).

## 3. Editing content (`/admin`)

Roles: **admin** (everything), **editor** (content), **viewer** (read). Create staff in Users (admin only); keep the list short.

- Pages: Home and the content pages are block based. Edit text and blocks in Pages; the editor has Live Preview and autosaves drafts; **Publish** makes it live within seconds (revalidation hooks).
- Features (22), Personas, FAQs, Posts, Changelog entries: each is a collection with the status vocabulary fixed to four labels (Available now (web), In the beta, Preview, Coming soon). Do not invent a fifth. Never write "available" for an iPhone app until it is on the App Store.
- Globals: Site settings, Navigation, Beta access, Price scenarios, Legal values.
- Changelog: Changelog entries, **Create New**, title, date, app(s), kind, a short summary (never reference internal issue numbers), **Publish**. `/changelog` and `/blog` are intentionally not linked from the nav until there is content (decision D-41); link them in Navigation when you want to.
- Images: upload to Media with alt text. Real photos only; screenshots must be synthetic and labelled "Sample data".

### Flip the beta call to action (Beta access global)
`state` drives every beta button on the site:
- **Waitlist** (today): the Join page shows the waitlist form only if `waitlistEnabled` is ticked. Keep it off until `/privacy` is out of notice mode and you have a monitored deletion/unsubscribe contact (S5-U4), and review the consent sentence with your lawyer.
- **TestFlight link**: set `state` to TestFlight and paste `testflightUrl` once an external TestFlight group exists (D-15).
- **App Store**: set `state` to App Store and fill `appStoreUrl` for **each** app that is actually live. Coach (6797363821) and Parent (6797363870) are TestFlight only until Apple approves them; only Player (6760209167) is on the App Store flow. The site must never claim availability early.

## 4. Legal pages: publishing when the values arrive

Today every legal route shows an honest "being finalised" notice and is `noindex`. Real legal values were not supplied, so nothing is invented. To go live:

1. Admin, Globals, **Legal values**: fill the 16 keys (list and meaning in `docs/spec/06-legal-pages.md` section 4). Proposed values read from sherlabs.com are in `STATUS.md` under "D-LEGAL"; nothing is entered until you approve them. Set `LEGAL_REVIEW_DONE` to Reviewed only after the lawyer signs off. `LEGAL_STRICT=1` (already in Production) blocks publishing a page that still contains an unfilled placeholder.
2. Admin, Legal pages: open each page (Privacy, Terms, Cookies, Account deletion, Data safety, Support text) and **Publish**. Privacy and Terms need a `policyVersion` and an `effectiveDate`; the version must differ from the previous published one.
3. **Order for any material change** (guardian re-consent in the Parent app depends on it): lawyer approves, create a draft with the new `policyVersion` and `effectiveDate`, publish the web page, and only then insert the matching row in the app database `policy_versions` table (an app-repo migration you approve). Never bump the database row first. The previous version stays reachable at `/privacy/v/<version>`; history at `/privacy/history`.
4. Afterwards: the App Store Connect Privacy Policy, Support and Marketing URLs should point at the live pages; the app repo should 308 `app.stumpnote.com/{privacy,terms,support}` to the site (section 8).

## 5. Reading the analytics (admin sidebar group "Analytics")

- Web analytics (`/admin/analytics/web`): site traffic. It stays on clearly labelled synthetic fixtures until a provider is chosen. The owner's plugin `@nouance/payload-dashboard-analytics` was proven incompatible with Payload 3 (D-55), so these are custom views. Umami (recommended, open source; `UMAMI_*` names in `.env.example`, owner steps under D-06 in `STATUS.md`), PostHog or Plausible plug in through `WEB_ANALYTICS_PROVIDER` (PostHog: EU project, enable cookieless server hash mode, create a key with Query Read scope; Plausible: add the site and a Stats API key). Site tracking is cookieless, off until a provider is configured, and its hosts are added to the CSP only then (`src/lib/analytics-config.ts`).
- AI spend (`/admin/analytics/ai-spend`) and Product (`/admin/analytics/product`): aggregate views of StumpNote itself, read-only, k-anonymised, never per named player. They show synthetic fixtures until live mode is set up: an agent prepares the private-repo migration PR on request (`docs/ops/private-repo/analytics-migration-PR.md`); you review and merge it, set the read-only role password in the Supabase SQL editor, add `STUMPNOTE_ANALYTICS_DATABASE_URL` (and only if needed `STUMPNOTE_ANALYTICS_CA_CERT`) to Vercel Production, add founder and test accounts to `analytics.excluded_subject`, set `ANALYTICS_MODE=live`, redeploy.
- These views are admin-only (a non-admin sees a 404), throttled to 30 views a minute and audit-logged. Cost data never appears on a public route or in a client bundle.

## 6. Security and secret rotation

- Secrets live only in Vercel (Production and Preview scopes, marked Sensitive) and your local `.env` (gitignored). `.env.example` has names only. CI has no secrets and must never get any.
- Rotate `PAYLOAD_SECRET` (logs everyone out): Vercel, Settings, Environment Variables, edit, redeploy. Rotate the Neon password in the Neon console and update both `DATABASE_URI*` names, then redeploy. Rotate the analytics role by re-running the `alter role ... password` line in the Supabase SQL editor and updating `STUMPNOTE_ANALYTICS_DATABASE_URL`. Rotate `BLOB_READ_WRITE_TOKEN` by regenerating the Blob token in the project Storage tab.
- Headers: a Content Security Policy is enforced on the public site and the admin (`next.config.ts`); if you add a third-party script or image host, add it there and in `decisions.md`.
- Never commit `.env*`, DB URLs, tokens, player ids or emails, or links to private-repo issues. `pnpm secrets` and GitHub push protection are the safety nets, not a licence.

## 7. Weekly and monthly checks

| When | What | Where |
|---|---|---|
| Weekly | Vercel usage (functions, data transfer, builds) against the plan; Neon compute hours and storage (Free: 100 CU-hours a month, 1 GB) | Vercel Team, Usage; Neon console |
| Weekly | Dependabot pull requests (Payload packages are grouped; read the release notes before merging Payload or Next majors) | GitHub, Pull requests |
| Monthly | Blob storage and operations; web analytics event or pageview quota; CI run history | Project, Storage; the analytics provider billing page |
| After launch | Vercel WAF: rate-limit rule on `POST /api/users/login`, and on `POST /join` and `POST /` (the waitlist is a Next server action posted to the page URL, not an `/api` route); optional IP allow-list on `/admin` | Project, Firewall |
| Always | Spend Management: budget with notifications at 50, 75 and 100 percent. **Never enable "Pause production deployments"**: the team also hosts the Flutter app. | Team, Settings, Billing, Spend Management |

Rollback: Vercel, Deployments, previous production deployment, **Promote** (or `npx vercel rollback`); DNS rollback is deleting the new `A @` and `CNAME www` records; a bad migration is restored from Neon point-in-time (6 hours on Free, so act the same day). Full table in `docs/spec/07-deploy-runbook.md` section 5.

## 8. Custom domain (needs your approval)

Not done yet (S7-U1). Exact steps: `docs/spec/07-deploy-runbook.md` section 4. In short: add `stumpnote.com` and `www.stumpnote.com` to `stumpnote-site`; set `www` to redirect 308 to the apex; in Namecheap, Advanced DNS, add `A @ 76.76.21.21` and `CNAME www <value Vercel shows>`; keep every MX record, the SPF TXT and the `app` CNAME exactly as they are; do not change nameservers; set `NEXT_PUBLIC_SERVER_URL=https://stumpnote.com` and redeploy so canonicals, the sitemap and OG images use the apex. Verify with `dig` and `curl -I` as in the runbook.

## 9. Owner-owned follow-ups outside this repo

- App repo: 308 redirects from `app.stumpnote.com/privacy`, `/terms` and `/support` to the site's pages once they are live.
- App Store Connect: set Support, Marketing and Privacy Policy URLs to the site; correct the App Privacy label if the data-safety summary differs.
- Legacy `sherlabs.com` pages: redirect or link to the new pages.
- Gemini billing tier: confirm whether prompts are excluded from training; until then the site uses hedged wording.
- Decide whether to publish `/data-safety` before the label is corrected (default: plain-language summary only).
- TestFlight public link (decision D-15) once an external group exists.
- Awards submissions (paid, optional): `docs/ops/awards-pack.md`.
- Open product questions are listed under "Decisions needed from the user" in `STATUS.md`.

## 10. If something breaks

| Symptom | First look |
|---|---|
| A page shows the code fallback instead of an edit | The database is not attached or the page was not published; check `/admin` and Vercel function logs |
| Deploy fails on build | Vercel build log; run `pnpm check && pnpm build` locally; with a DB attached, `payload migrate` runs first (check the migration name in the log) |
| `/admin` 500 | No `DATABASE_URI`, or Neon asleep (first request after idle wakes it; retry) |
| A push produced no deployment | It only touched `docs/` or `*.md` (intended); push any code change or redeploy from the dashboard |
| Locked out of admin | Five wrong passwords lock for 15 minutes; otherwise reset via email if Resend is configured, or an admin runs a one-off local script against the unpooled URL |
| Resuming an agent session | `docs/ops/RESUME.md` has copy-paste prompts; `STATUS.md` is the single source of truth |
