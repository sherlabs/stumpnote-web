# STATUS

Single source of truth for progress. Update at the end of every work unit, then commit and push.

Last updated: 2026-10-04 (S0: plan spec in progress; docs written: 00-overview, decisions, spec index, stage index; next doc: 01-architecture + SQL draft)

## Stage table

Status values: `not started`, `in progress`, `blocked`, `done`. Stage numbering changed on 2026-10-04: planning is part of S0; S1..S7 are the build stages.

| Stage | Name | Depends on | Status | Blocked | Last commit | Next action |
|---|---|---|---|---|---|---|
| S0 | Bootstrap + plan spec (`docs/spec/*`, stage briefs S1..S7, TASKS, RESUME) | - | in progress | no | see git log | Finish remaining spec docs in order 01, 02, 03+04, 05+06, 07+08, briefs, TASKS/RESUME |
| S1 | Scaffold: Next + Payload + Tailwind, DB adapter, collections skeleton, quality scripts, Docker Postgres, first DB-free skeleton deploy | S0 | not started | no | - | Execute `docs/ops/stages/S1-scaffold.md` |
| S2 | Design system + motion foundation + `/lab` | S1 | not started | no | - | Execute `docs/ops/stages/S2-design-system.md` |
| S3 | Home page: hero + storytelling | S2 | not started | no | - | Execute `docs/ops/stages/S3-home.md` |
| S4 | CMS pages: features, personas, pricing, security, join, support + seed | S2 | not started | no | - | Execute `docs/ops/stages/S4-cms-pages.md` |
| S5 | Legal pages (notice mode) + SEO/OG/sitemap/JSON-LD + a11y/perf pass | S3, S4 | not started | no | - | Execute `docs/ops/stages/S5-legal-seo-quality.md` |
| S6 | Admin: website analytics + AI-spend and product analytics views | S1 | not started | no | - | Execute `docs/ops/stages/S6-admin-analytics.md` (fixtures mode until user approves the migration) |
| S7 | Launch: domain cutover, awards polish, Lighthouse, repo hardening, handoff | S3..S6 | not started | no | - | Execute `docs/ops/stages/S7-launch.md` |

## Decisions needed from the user

Recommended defaults are in [docs/spec/00-overview.md](docs/spec/00-overview.md) section 8. The agent builds the default unless told otherwise.

- [ ] D-01 Hosting: existing Vercel Pro team (default) vs Hobby via GitHub Actions with fair-use risk. Note: Hobby cannot Git-import an org repo and is non-commercial only.
- [ ] D-06 Website analytics provider: PostHog Cloud EU cookieless + custom admin view (default). The Payload analytics plugin you remember is Payload 1 only; no maintained Payload 3 plugin exists for a privacy-friendly provider.
- [ ] D-14 Show indicative pricing before App Store launch (default: show).
- [ ] Legal values: all 16 keys listed in `docs/spec/06-legal-pages.md` section 4 (default: notice mode).
- [ ] Copyright holder wording in `NOTICE` (currently "Sherlabs").
- [ ] D-07 Approve applying `docs/spec/supabase-analytics-views.sql` to the StumpNote prod DB and set the read-only role password (default: fixtures mode).
- [ ] D-10 Approve the Namecheap DNS edit for `stumpnote.com` apex + `www` (default: `*.vercel.app` URL).
- [ ] D-15 TestFlight public link when an external group exists (default: waitlist form).
- [ ] Gemini billing tier confirmation (decides whether a no-training claim is allowed; default: hedged wording).
- [ ] Publish `/data-safety` before the App Store privacy label is corrected? (default: plain-language summary only).
- [ ] Waitlist mailbox ownership and unsubscribe route (default: stored in Payload only).
- [ ] Redirect plan for legacy `sherlabs.com` pages and the app-repo 308 redirects for `app.stumpnote.com/{privacy,terms,support}` (default: follow-up, not done here).

## Blocked

Format: `- [Sn] what | why | exact next click-path for the user | date`. Nothing is blocked in S0. Expected gates (recorded here when reached):

- [S1] Neon database provisioning | Marketplace install requires accepting Neon terms and choosing a plan | Vercel dashboard, team (the Pro team hosting app.stumpnote.com), Storage, Create Database, Neon, accept terms, plan Free, name `stumpnote-cms`, connect to project `stumpnote-site` for Production and Preview | pending
- [S1] Vercel Blob store creation | may prompt for terms | Vercel dashboard, project `stumpnote-site`, Storage, Create, Blob | pending
- [S1] First Payload admin user | needs a typed password; agent never types passwords | after first deploy with DB: open `https://<deployment>/admin`, create the first user, then tell the next session it exists | pending
- [S6] PostHog account | terms acceptance | posthog.com, sign up, EU region, create project, Settings, Web analytics, enable cookieless server hash mode; create personal API key with Query Read scope; put values in Vercel env (names in `docs/spec/01-architecture.md` section 5) | pending
- [S6] Analytics views migration + read-only role password | prod DB change | see `docs/ops/stages/S6-admin-analytics.md` section "User-approved steps" | pending
- [S7] Namecheap DNS edit | user's logged-in session; changes production DNS | see `docs/spec/07-deploy-runbook.md` section 4 | pending
- [S7] Awards submissions | paid | user submits using the readiness pack from S7 | pending

## Log

- 2026-10-04: S0 bootstrap done. Public repo `sherlabs/stumpnote-web` created, recovery scaffolding committed to `main`.
- 2026-10-04: S0 plan spec started. Stage numbering changed (planning folded into S0; S1..S7 = build stages). Research findings consolidated into `docs/spec/`.
