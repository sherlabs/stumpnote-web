# STATUS

Single source of truth for progress. Update at the end of every work unit, then commit and push.

Last updated: 2026-10-04 (S0 done: full plan spec, stage briefs S1..S7, TASKS expanded, RESUME prompts. Next action: execute S1 per `docs/ops/stages/S1-scaffold.md`)

## Stage table

Status values: `not started`, `in progress`, `blocked`, `done`. Stage numbering changed on 2026-10-04: planning is part of S0; S1..S7 are the build stages.

| Stage | Name | Depends on | Status | Blocked | Last commit | Next action |
|---|---|---|---|---|---|---|
| S0 | Bootstrap + plan spec (`docs/spec/*`, stage briefs S1..S7, TASKS, RESUME) | - | done | no | see git log (S0 final) | none |
| S1 | Scaffold: Next + Payload + Tailwind, DB adapter, collections skeleton, quality scripts, Docker Postgres, first DB-free skeleton deploy | S0 | not started | no | - | Execute `docs/ops/stages/S1-scaffold.md` from S1-01 |
| S2 | Design system + motion foundation + `/lab` | S1 | not started | no | - | Execute `docs/ops/stages/S2-design-system.md` |
| S3 | Home page: hero + storytelling | S2 | not started | no | - | Execute `docs/ops/stages/S3-home.md` |
| S4 | CMS pages: features, personas, pricing, security, join, support + seed | S2 (S3 renderers) | not started | no | - | Execute `docs/ops/stages/S4-cms-pages.md` |
| S5 | Legal pages (notice mode) + SEO/OG/sitemap/JSON-LD + a11y/perf pass | S3, S4 | not started | no | - | Execute `docs/ops/stages/S5-legal-seo-quality.md` |
| S6 | Admin: website analytics + AI-spend and product analytics views | S1 (parallel with S3..S5) | not started | no | - | Execute `docs/ops/stages/S6-admin-analytics.md` on fixtures; live only after user gates |
| S7 | Launch: domain cutover, awards polish, Lighthouse, repo hardening, handoff | S3..S6 | not started | no | - | Execute `docs/ops/stages/S7-launch.md` |

## Decisions needed from the user

Recommended defaults are in [docs/spec/00-overview.md](docs/spec/00-overview.md) section 8 and the decision log [docs/spec/decisions.md](docs/spec/decisions.md). The agent builds the default unless told otherwise; tell the next session or edit this list to override.

- [ ] D-01 Hosting: existing Vercel **Pro** team (the one hosting app.stumpnote.com), project `stumpnote-site` (default) vs Hobby via GitHub Actions with the fair-use risk accepted. Hobby cannot Git-import an org repo and is non-commercial only.
- [ ] D-06 Website analytics: PostHog Cloud EU, cookieless, custom admin view (default). The Payload analytics plugin you remember is Payload 1 only; there is no maintained Payload 3 plugin for a privacy-friendly provider, and the community PostHog plugin has an unauthenticated data endpoint, so none is installed.
- [ ] D-14 Show indicative pricing before the App Store launch (default: show, labelled indicative, no buy button).
- [ ] Legal values: all 16 keys in `docs/spec/06-legal-pages.md` section 4 (default: pages ship in notice mode, noindex).
- [ ] Copyright holder wording in `NOTICE` (currently "Sherlabs"; confirm legal entity).
- [ ] D-07 Approve applying `docs/spec/supabase-analytics-views.sql` (as a private-repo migration PR, prepared only when you say so) and set the read-only role password (default: admin runs on synthetic fixtures).
- [ ] D-10 Approve the Namecheap DNS edit for `stumpnote.com` apex + `www` (default: site stays on the `*.vercel.app` URL).
- [ ] D-15 TestFlight public link once an external group exists (default: waitlist form).
- [ ] Gemini billing tier confirmation (decides whether a "not used to train" claim is allowed; default: hedged wording).
- [ ] Publish `/data-safety` before the App Store privacy label is corrected? (default: plain-language summary only).
- [ ] Waitlist mailbox ownership and unsubscribe route (default: rows stored in Payload only; no emails sent).
- [ ] Follow-ups outside this repo: app-repo 308 redirects for `app.stumpnote.com/{privacy,terms,support}`, App Store Connect URL updates, legacy `sherlabs.com` redirects (default: listed in HANDOFF, not done here).

## Blocked

Format: `- [Sn] what | why | exact next click-path for the user | date`. Nothing blocks S1 from starting. Gates that will be hit (recorded here now so no session is surprised):

- [S1] Neon database provisioning | Marketplace install requires accepting Neon terms and choosing a plan | Vercel dashboard, the Pro team, Storage, Create Database, Neon, accept terms, plan Free, name `stumpnote-cms`, region nearest you, connect to project `stumpnote-site` for Production and Preview | pending
- [S1] Vercel Blob store | may prompt for terms | Vercel dashboard, project `stumpnote-site`, Storage, Create, Blob | pending
- [S1] First Payload admin user | needs a typed password; the agent never types passwords | after the first deploy with a DB, open `https://<deployment>/admin`, create the first user, then tell the next session it exists | pending
- [S6] PostHog account | terms acceptance | posthog.com, sign up, EU region, create project, Project settings, Web analytics, enable "Cookieless server hash mode"; Personal API keys, create with Query Read scope; add the 5 env names from `docs/spec/01-architecture.md` section 5 to Vercel Production | pending
- [S6] Analytics views migration + read-only role password | production DB change in the private repo | say "prepare the analytics migration PR" to a session; review and merge it; apply; in the Supabase SQL editor run the `alter role ... login password` line; add `STUMPNOTE_ANALYTICS_DATABASE_URL` to Vercel Production; set `ANALYTICS_MODE=live` | pending
- [S7] Namecheap DNS edit | your logged-in session; production DNS | `docs/spec/07-deploy-runbook.md` section 4 (A @ 76.76.21.21; CNAME www; keep MX/SPF/app) | pending
- [S7] Vercel WAF rules and Spend Management notifications | dashboard settings on your team | `docs/spec/07-deploy-runbook.md` section 6 | pending
- [S7] Awards submissions | paid | submit using `docs/ops/awards-pack.md` when ready | pending

## Log

- 2026-10-04: S0 bootstrap done. Public repo `sherlabs/stumpnote-web` created, recovery scaffolding committed to `main`.
- 2026-10-04: S0 plan spec written: `docs/spec/00..08`, `supabase-analytics-views.sql` (draft), `decisions.md`; stage briefs `docs/ops/stages/S1..S7`; `TASKS.md` expanded; `docs/ops/RESUME.md` prompts. Stage numbering changed (planning folded into S0). S0 done. Next: S1.
