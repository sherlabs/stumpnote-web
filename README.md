# stumpnote-web

Marketing website for **StumpNote** (the cricket performance journal for players, coaches and parents), plus a **Payload CMS** admin panel that carries website analytics and StumpNote AI-spend / product analytics views.

> Status: site built (S0 to S6 done, S7 launch hardening in progress). Full spec in [docs/spec/](./docs/spec/README.md); live stage table in [STATUS.md](./STATUS.md); run-it-yourself guide in [docs/ops/HANDOFF.md](./docs/ops/HANDOFF.md).

|        |                                                                                                                                                                       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI     | [![ci](https://github.com/sherlabs/stumpnote-web/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sherlabs/stumpnote-web/actions/workflows/ci.yml) |
| Deploy | [![vercel](https://img.shields.io/badge/vercel-stumpnote--site.vercel.app-black?logo=vercel)](https://stumpnote-site.vercel.app)                                      |

## What this repo is

- Public marketing site for StumpNote (home, features, personas, pricing/beta, support, legal).
- Payload CMS admin (`/admin`) for content, plus analytics dashboards:
  - website analytics (provider decision D-06 in `docs/spec/00-overview.md`; built in stage S6)
  - StumpNote AI spend and product analytics (read-only aggregate views; designed in `docs/spec/04-analytics-and-admin.md`; built in stage S6)
- Deployed to Vercel (plan decision D-01 in `docs/spec/00-overview.md`).

The StumpNote app itself lives in a separate **private** repo. The Flutter web app is at <https://app.stumpnote.com>; this site links to it.

## Public repo notice

This repository is public for transparency. It is **not** open source. See [NOTICE](./NOTICE). Never commit secrets, keys, tokens, `.env` files, player ids or emails, or non-marketing-safe content from the private app repo. All secrets live in Vercel / Payload environment settings only. `.env.example` lists variable names only.

## Run locally

Prerequisites (until stage S1 lands, there is no app code yet): Node 24.x, pnpm 10, Docker (for the local Postgres).

```sh
pnpm install
cp .env.example .env     # fill in values locally; never commit .env
pnpm db:up               # local Postgres 17 in Docker
pnpm dev                 # site + Payload admin on http://localhost:3000
```

Disk is tight on the dev Mac: after verifying, delete `node_modules` and `.next`, and rely on the shared pnpm store.

## How to RESUME work (any fresh Claude session or human)

1. Read [STATUS.md](./STATUS.md): which stage is current, what is blocked, which decisions need the user.
2. Read [TASKS.md](./TASKS.md): the task list and IDs.
3. Open the next stage brief in `docs/ops/stages/` and continue.
4. Follow [docs/ops/RESUME.md](./docs/ops/RESUME.md) for the exact prompt to paste and the list of logins and tools needed.

Rules for contributors (human or agent) are in [CLAUDE.md](./CLAUDE.md).

## Repo map

| Path                 | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `STATUS.md`          | Live stage table, blockers, decisions needed                                  |
| `TASKS.md`           | Task backlog and ID scheme                                                    |
| `CLAUDE.md`          | Working rules for agents                                                      |
| `NOTICE`             | Proprietary / all rights reserved                                             |
| `docs/ops/RESUME.md` | Recovery protocol                                                             |
| `docs/ops/stages/`   | One brief per stage (S0..S7)                                                  |
| `docs/spec/`         | Complete plan spec (00-overview .. 08-test-and-quality, SQL draft, decisions) |

## Local development

```bash
nvm use                      # Node 24 (.nvmrc); corepack provides pnpm 10
pnpm install
cp .env.example .env         # then set PAYLOAD_SECRET (openssl rand -hex 32) and
                             # DATABASE_URI=postgres://postgres:postgres@127.0.0.1:5433/stumpnote_cms
pnpm db:up && pnpm payload migrate
pnpm dev                     # http://localhost:3000 (site), /admin (Payload)
pnpm check                   # lint + typecheck + unit tests + secrets scan + audit
pnpm build && pnpm test:e2e  # production build, then Playwright smoke on a local `next start`
```

The production build must succeed with `DATABASE_URI` unset (skeleton and static pages do not read the CMS).
