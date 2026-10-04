# stumpnote-web

Marketing website for **StumpNote** (the cricket performance journal for players, coaches and parents), plus a **Payload CMS** admin panel that carries website analytics and StumpNote AI-spend / product analytics views.

> Status: bootstrapping. See [STATUS.md](./STATUS.md) for the live stage table.

| | |
|---|---|
| Build | ![build](https://img.shields.io/badge/build-pending-lightgrey) |
| Deploy | ![deploy](https://img.shields.io/badge/vercel-not%20deployed-lightgrey) |
| Stage | ![stage](https://img.shields.io/badge/stage-S0%20plan%20spec-blue) |

(Badges are placeholders; replace with real workflow/Vercel badges once those exist.)

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

| Path | Purpose |
|---|---|
| `STATUS.md` | Live stage table, blockers, decisions needed |
| `TASKS.md` | Task backlog and ID scheme |
| `CLAUDE.md` | Working rules for agents |
| `NOTICE` | Proprietary / all rights reserved |
| `docs/ops/RESUME.md` | Recovery protocol |
| `docs/ops/stages/` | One brief per stage (S0..S7) |
| `docs/spec/` | Complete plan spec (00-overview .. 08-test-and-quality, SQL draft, decisions) |
