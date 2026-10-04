# Spec index

The complete plan for the StumpNote website and admin. Written in S0 (2026-10-04) so that any later stage can be executed from this directory alone. Execution state lives in [STATUS.md](../../STATUS.md); stage briefs in [docs/ops/stages/](../ops/stages/).

| File | What it holds | Executed in |
|---|---|---|
| [00-overview.md](./00-overview.md) | Vision, goals, non-goals, success metrics, awards checklist, audiences, constraints, key decisions table, decisions needed from the user, stage map | all |
| [01-architecture.md](./01-architecture.md) | Next.js + Payload layout, folder structure, environments, env var catalogue (names only), DB and migrations, media, caching, security model, read-only Supabase analytics access design | S1, S6 |
| [supabase-analytics-views.sql](./supabase-analytics-views.sql) | DRAFT migration for the PRIVATE app repo: `analytics` schema, aggregate views, read-only role. Not applied; user-approved S6 step | S6 |
| [02-design.md](./02-design.md) | Creative concept, tokens, type scale, grid, components, motion spec, signature interactions, wireframes for every page, a11y and performance budgets | S2, S3, S4, S5 |
| [03-cms-model.md](./03-cms-model.md) | Payload collections, globals, blocks, fields, access, Live Preview, drafts, seed plan | S1, S4, S5 |
| [04-analytics-and-admin.md](./04-analytics-and-admin.md) | Website analytics provider and admin view, AI-spend and product analytics views, alerts, privacy rules, full SQL view list | S6 |
| [05-content-brief.md](./05-content-brief.md) | Positioning, copy per feature and persona, FAQ, pricing copy, claims policy, SEO | S3, S4 |
| [06-legal-pages.md](./06-legal-pages.md) | Legal pages plan, placeholder mechanism, notice mode, version sync, placeholder list | S5 |
| [07-deploy-runbook.md](./07-deploy-runbook.md) | Vercel project, env vars, DB provisioning gates, domain cutover, rollback, quotas, GitHub hardening | S1, S7 |
| [08-test-and-quality.md](./08-test-and-quality.md) | Playwright, Lighthouse CI (local), axe, link checker, seed/restore scripts, content QA checklist | S2..S7 |
| [decisions.md](./decisions.md) | ADR-style decision log (D-01..) | all |

Rules that apply to every file here: no secrets, no PII, no private-repo issue or PR numbers, no raw cost numbers, no invented legal facts ([CLAUDE.md](../../CLAUDE.md)).

Source material was the private app repo at `origin/main` (read-only): `docs/features/*`, `docs/design/set-a/*`, `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/SUPPORT.md`, `docs/legal/*`, `scripts/legal/render.sh`, `docs/SUBSCRIPTION_MODEL.md`, `docs/AI_COST.md`, `docs/web/*`, `assets/images/stumpnote_mark.svg`. Re-read those if a spec statement needs checking: `git -C /Users/nilesh93/Projects/personal/stumpnote show origin/main:<path>`.
