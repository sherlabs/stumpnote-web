# RESUME: how a fresh session picks this project up

This project was planned to survive running out of usage limits mid-build. All state lives in git, not in anyone's head.

## 1. Resume in 4 steps
1. `cd /Users/nilesh93/Projects/personal/stumpnote-site && git pull --ff-only` (if the clone is missing: `gh repo clone sherlabs/stumpnote-web /Users/nilesh93/Projects/personal/stumpnote-site`).
2. Read `STATUS.md`: find the first stage that is not `done`; read "Blocked" and "Decisions needed from the user".
3. Read `TASKS.md`: find the first open task for that stage.
4. Open the matching brief `docs/ops/stages/S<n>-*.md` and continue. If the brief does not exist yet, the stage is "brief missing": write it first (from `docs/spec/`), commit, then proceed.

At the end of every work unit: update `STATUS.md` + `TASKS.md`, commit, push. See `CLAUDE.md` section 2.

## 2. Prompt to paste into a fresh Claude Code session

```
Resume the StumpNote website project. Repo: /Users/nilesh93/Projects/personal/stumpnote-site
(GitHub: sherlabs/stumpnote-web, public). Read CLAUDE.md, then STATUS.md, then TASKS.md, then the
next stage brief in docs/ops/stages/. Continue from the "next action" of the first stage that is not
done. Follow the recovery protocol: update STATUS.md and TASKS.md and commit + push at the end of
every work unit. The private app repo at /Users/nilesh93/Projects/personal/stumpnote is READ-ONLY
(use git -C ... fetch -q origin, then git -C ... show origin/main:<path>). Never commit secrets or PII.
Do not accept legal terms, billing, or paid resources on my behalf: record BLOCKED in STATUS.md with
the exact click-path instead. Be terse; truncate command output; delete node_modules/.next when done
(disk is tight).
```

## 3. Re-running the workflow (if a workflow tool is available)
If the session has a Workflow tool, re-run the stage-driven workflow with the same task text as the original run: "Execute stage S<n> of docs/ops/stages per STATUS.md; update STATUS.md/TASKS.md; commit and push". Stages are idempotent by design: each brief lists its own done-criteria, so re-running a half-finished stage should verify what exists and finish the rest. If no workflow tool is available, do the stage inline.

Efficiency rules for agents (from the owner's CLAUDE.md): iterate with targeted checks and run the full suite once at the end; prefer one agent doing several tasks that share a pattern over many parallel agents re-deriving it; truncate big outputs.

## 4. External dependencies and logins
| Dependency | Needed for | Notes |
|---|---|---|
| GitHub (`gh` CLI, account `nilesh93`, org `sherlabs`) | repo, pushes | already authenticated in keyring |
| Chrome with logged-in Vercel + GitHub sessions (Claude in Chrome tools) | Vercel project setup/deploy UI steps | load tools via ToolSearch `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__find,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__javascript_tool`; own tab, close after; never type passwords |
| Vercel (plan per decision D-01, default existing Pro team) | hosting | deploy via `docs/spec/07-deploy-runbook.md`; project `stumpnote-site` |
| Payload CMS database | Payload storage | Neon free via Vercel Marketplace (D-03); local dev uses Docker Postgres (D-04). Accepting provider terms is BLOCKED for the user |
| PostHog Cloud (D-06) | website analytics in admin (S6) | custom admin view, no third-party Payload plugin; account creation is a user step |
| Private app repo (read-only clone) | docs to mine: `docs/features/*`, `docs/design/set-a/*`, `docs/privacy`, `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/terms`, `docs/support`, `docs/release/APP_STORE_READINESS.md`, `docs/AI_COST.md`, `scripts/ai-cost/report.sh`, `docs/web/*`, `assets/images/stumpnote_mark.svg` | `git -C /Users/nilesh93/Projects/personal/stumpnote fetch -q origin` then `git -C ... show origin/main:<path>` |
| Supabase (StumpNote prod) | AI-spend and product analytics views (S6) | read-only access via env secrets stored only in Vercel/Payload env; never committed; if keys are not available, record BLOCKED |

## 5. Hard rules (repeat of the dangerous ones)
- Public repo: no secrets, env files, PII, player ids/emails, sensitive internal links, security findings, unapproved raw cost numbers.
- Legal pages: placeholders only, never invented legal facts.
- Do not claim Coach or Parent apps are on the App Store; use "Coming soon / join the beta".
- Never leave `main` broken. Never broad-pkill.
