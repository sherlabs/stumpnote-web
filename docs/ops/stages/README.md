# Stage briefs

One brief per stage, named `S<n>-<slug>.md`. Each brief is self-contained: a fresh agent with only this repo must be able to execute it. Every brief has: goal, prerequisites, step list with checkboxes, files to create, commands, acceptance criteria, verification, STATUS.md/TASKS.md updates, commit instructions, rollback.

| Stage | Name | Brief | Depends on |
|---|---|---|---|
| S0 | Bootstrap + plan spec | done; the spec is [docs/spec/](../../spec/README.md) | - |
| S1 | Scaffold: Next + Payload + Tailwind, DB adapter, collections skeleton, quality scripts, local Docker Postgres, first DB-free skeleton deploy | [S1-scaffold.md](./S1-scaffold.md) | S0 |
| S2 | Design system + motion foundation + `/lab` | [S2-design-system.md](./S2-design-system.md) | S1 |
| S3 | Home page: hero + storytelling chapters | [S3-home.md](./S3-home.md) | S2 |
| S4 | Features, personas, pricing, security, join, support pages from CMS + seed | [S4-cms-pages.md](./S4-cms-pages.md) | S2 (S3 for shared chapter components) |
| S5 | Legal pages (notice mode) + SEO/OG/sitemap/JSON-LD + a11y/perf pass | [S5-legal-seo-quality.md](./S5-legal-seo-quality.md) | S3, S4 |
| S6 | Admin: website analytics + AI-spend and product analytics views | [S6-admin-analytics.md](./S6-admin-analytics.md) | S1 (can run in parallel with S3..S5) |
| S7 | Launch: domain cutover, awards polish, Lighthouse pass, repo hardening, handoff | [S7-launch.md](./S7-launch.md) | S3..S6 |

If a brief is missing or contradicts `docs/spec/`, the spec wins: fix the brief, commit, then execute.

Common rules for every stage are in [CLAUDE.md](../../../CLAUDE.md). Every stage ends with: update `STATUS.md` + `TASKS.md`; commit; push.
