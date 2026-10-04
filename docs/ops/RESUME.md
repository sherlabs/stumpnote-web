# RESUME: how a fresh session picks this project up

This project is built to survive running out of usage limits mid-build. All state lives in git, not in anyone's head. The complete plan is in `docs/spec/`; the step-by-step briefs are in `docs/ops/stages/`; live progress is in `STATUS.md`.

## 1. Resume in 4 steps
1. `cd /Users/nilesh93/Projects/personal/stumpnote-site && git pull --ff-only` (if the clone is missing: `gh repo clone sherlabs/stumpnote-web /Users/nilesh93/Projects/personal/stumpnote-site`).
2. Read `STATUS.md`: the first stage that is not `done`, its "Next action", the "Blocked" list and "Decisions needed from the user".
3. Read `TASKS.md`: the first open task of that stage.
4. Open `docs/ops/stages/S<n>-*.md` and continue from that step. The brief is self-contained; the spec in `docs/spec/` is the authority if anything conflicts.

At the end of every work unit: update `STATUS.md` + `TASKS.md`, commit, push (`CLAUDE.md` section 2). Partial work is fine if the next action is precise.

## 2. Copy-paste prompts

### (a) Resume the build from STATUS
```
Resume the StumpNote website project. Repo: /Users/nilesh93/Projects/personal/stumpnote-site
(GitHub: sherlabs/stumpnote-web, PUBLIC). First: git pull --ff-only. Read CLAUDE.md, then STATUS.md, then
TASKS.md, then the brief in docs/ops/stages/ for the first stage that is not done, and continue from its
"Next action" and the first open task id. The spec in docs/spec/ is the authority. Rules: never commit
secrets, env files, PII, private-repo issue numbers, raw cost numbers or invented legal facts; the private
app repo at /Users/nilesh93/Projects/personal/stumpnote is READ-ONLY (git -C ... fetch -q origin; git -C ...
show origin/main:<path>); never accept terms, billing or paid resources for me: record BLOCKED in STATUS.md
with the exact click-path. Build the recommended defaults from docs/spec/00-overview.md section 8 unless
STATUS.md says otherwise. Iterate with targeted checks; run full suites once per stage. Truncate command
output. Delete node_modules and .next when done (disk is tight). At the end of every work unit update
STATUS.md and TASKS.md, commit with the trailers in CLAUDE.md, and push.
```

### (b) Run a single stage
```
Execute stage S<n> of the StumpNote website. Repo: /Users/nilesh93/Projects/personal/stumpnote-site
(sherlabs/stumpnote-web, PUBLIC). git pull --ff-only, read CLAUDE.md and STATUS.md, then follow
docs/ops/stages/S<n>-*.md step by step, ticking the checkboxes in the brief and TASKS.md as you go. Verify
prerequisites first; if a prerequisite stage is not done, stop and say so. Treat anything needing my login,
terms acceptance, payment or DNS changes as BLOCKED (record in STATUS.md with the click-path) and continue
with what does not depend on it. Same hard rules as CLAUDE.md. Finish with: STATUS.md + TASKS.md updated,
commit, push, and a short summary of what is done, what is blocked, and the exact next action.
```

### (c) Recover after a limit cutoff
Run these first; they tell you exactly where the previous session stopped:
```bash
cd /Users/nilesh93/Projects/personal/stumpnote-site
git status --short                 # uncommitted work from the cut-off session?
git stash list                     # anything stashed?
git log --oneline -15              # last commits; STATUS.md is updated in each
git diff --stat HEAD               # size of uncommitted changes
sed -n '1,40p' STATUS.md           # stage table + last updated line
grep -n '\[~\]' TASKS.md           # tasks marked in progress
ls node_modules >/dev/null 2>&1 && echo "node_modules present (run pnpm install only if missing)"
docker ps --filter name=stumpnote  # local DB running?
```
Then decide:
- Uncommitted changes that build (`pnpm check` passes): commit them with a `wip(S<n>): …` message, push, then resume with prompt (a).
- Uncommitted changes that do not build: `git stash push -m "cutoff-<date>"`, push nothing, resume with prompt (a); re-apply the stash only once the brief step is understood.
- Clean tree: resume with prompt (a).

Prompt to paste:
```
Recover the StumpNote website build after a session cutoff. Repo:
/Users/nilesh93/Projects/personal/stumpnote-site (sherlabs/stumpnote-web, PUBLIC). Run: git status --short;
git stash list; git log --oneline -15; git diff --stat HEAD; sed -n '1,40p' STATUS.md; grep -n '\[~\]'
TASKS.md. If there are uncommitted changes and pnpm check passes, commit them as "wip(S<n>): <what>" with the
CLAUDE.md trailers and push; if they do not build, stash them with a dated message. Then read CLAUDE.md,
STATUS.md, TASKS.md and the current stage brief in docs/ops/stages/, and continue from the first open task.
Same hard rules as CLAUDE.md (public repo hygiene, read-only private repo, BLOCKED for any terms/billing/DNS).
End every work unit by updating STATUS.md and TASKS.md, committing and pushing.
```

## 3. Re-running the workflow (if a workflow tool is available)
Re-run the stage-driven workflow with: "Execute stage S<n> of docs/ops/stages per STATUS.md; update STATUS.md/TASKS.md; commit and push". Stages are idempotent: every brief has acceptance criteria, so re-running a half-finished stage verifies what exists and finishes the rest. If no workflow tool is available, do the stage inline.

Efficiency rules for agents (from the owner's CLAUDE.md): iterate with targeted checks and run the full suite once at the end; prefer one agent doing several tasks that share a pattern over many parallel agents re-deriving it; truncate big outputs.

## 4. External dependencies and logins
| Dependency | Needed for | Notes |
|---|---|---|
| GitHub (`gh` CLI, account `nilesh93`, org `sherlabs`) | repo, pushes | already authenticated |
| Chrome with logged-in Vercel + GitHub + Namecheap sessions (Claude in Chrome tools) | dashboard steps | load tools via ToolSearch `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__find,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__javascript_tool`; own tab, close after; never type passwords |
| Vercel CLI (`npx vercel@latest`, logged in) | project `stumpnote-site` (decision D-01: existing Pro team by default) | runbook `docs/spec/07-deploy-runbook.md` |
| Neon (via Vercel Marketplace) | Payload DB (D-03) | terms + plan choice are the user's (BLOCKED gate) |
| Docker | local Postgres 17 (D-04) | `pnpm db:up` |
| Web analytics provider (D-06; owner chose the NouanceLabs plugin, verified in S6; fallback custom view on Plausible or PostHog) | website analytics in admin (S6) | account creation or billing is a user step; see `docs/spec/USER-DECISIONS.md` |
| StumpNote Supabase (prod) | AI-spend / product views (D-07, S6) | read-only role created by a user-approved private-repo migration; URL only in Vercel env; fixtures until then |
| Private app repo (read-only clone at `/Users/nilesh93/Projects/personal/stumpnote`) | source docs listed in `docs/spec/README.md` | `git -C <path> fetch -q origin && git -C <path> show origin/main:<file>` |
| Namecheap | DNS cutover (D-10, S7) | user approval required; runbook section 4 |

## 5. Hard rules (repeat of the dangerous ones)
- Public repo: no secrets, env files, PII, player ids/emails, private-repo issue or PR numbers, branch names, project refs, model price tables, raw cost numbers, security findings.
- Legal pages: placeholders + notice mode only; never invent legal facts.
- Never claim any iOS app is on the App Store; use "Join the beta" / "Coming soon to the App Store".
- Never touch the Vercel project `stumpnote-web` (that is the Flutter app) or `app.stumpnote.com` DNS.
- Never leave `main` broken. Never broad-pkill. Never type passwords. Never accept terms or billing.
