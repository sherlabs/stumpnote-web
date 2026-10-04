# STATUS

Single source of truth for progress. Update at the end of every work unit, then commit and push.

Last updated: 2026-10-04 (S0 bootstrap)

## Stage table

Status values: `not started`, `in progress`, `blocked`, `done`.

| Stage | Name | Status | Blocked | Last commit | Next action |
|---|---|---|---|---|---|
| S0 | Bootstrap: repo, recovery scaffolding | done | no | see `git log` (initial scaffold commit) | none |
| S1 | Plan and spec: product, IA, design system, technical architecture, stage briefs for S2..S7 | not started | no | - | Mine private-repo docs (features, design/set-a, legal, AI_COST, web) and write `docs/spec/*` + `docs/ops/stages/S2..S7-*.md`; fill TASKS.md |
| S2 | Foundation: Next.js + Payload CMS scaffold, tokens, fonts, layout, CI-free checks, DB choice | not started | no | - | Blocked on S1 briefs |
| S3 | Marketing site: home, features, personas, beta CTAs, award-grade design and motion | not started | no | - | Blocked on S2 |
| S4 | Legal and support pages: privacy, terms, support with placeholder/notice mechanism | not started | no | - | Blocked on S2 |
| S5 | Admin website analytics (Payload analytics plugin) | not started | no | - | Blocked on S2 |
| S6 | Admin StumpNote AI spend and product analytics views (read-only, behind auth) | not started | no | - | Blocked on S2; needs Supabase read access via env (user-provided) |
| S7 | Deploy to Vercel free tier, QA (a11y/perf budgets), launch checklist | not started | no | - | Blocked on S3..S6 |

Stage briefs live in `docs/ops/stages/` (S0..S7 briefs are written during S1; this table is authoritative until then).

## Decisions needed from the user

Nothing blocking yet. Expected to surface (do not guess; ask):
- [ ] Legal entity name, registered address, contact/support email, governing jurisdiction, effective dates for privacy policy and terms (legal pages stay `{{PLACEHOLDER}}` until supplied).
- [ ] Copyright holder wording in `NOTICE` (currently "Sherlabs"; confirm the exact legal name).
- [ ] Custom domain for the marketing site (e.g. root `stumpnote.com`; app is at `app.stumpnote.com`) and DNS changes (user action).
- [ ] How much AI cost data may be shown, and where (admin only is the default).
- [ ] Payload database provider on a free tier (decided in S2; any paid resource or terms acceptance is user action).

## Blocked

None.

(Format for entries: `- [Sn] what is blocked | why | exact next click-path for the user | date`.)

## Log

- 2026-10-04: S0 done. Public repo `sherlabs/stumpnote-web` created, recovery scaffolding committed to `main`.
