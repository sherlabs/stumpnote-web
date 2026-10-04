# stumpnote-web: working rules

Marketing site + Payload CMS admin for StumpNote. This repo is **PUBLIC**. Read this file, then `STATUS.md`, before doing anything.

## 1. Public repo hygiene (non-negotiable)
- NEVER commit secrets, API keys, tokens, `.env*` files (only `.env.example` with variable NAMES), service-role keys, DB URLs, or cookies.
- NEVER commit player ids, emails, or any PII; internal issue links with sensitive detail; security findings; raw cost numbers beyond what the user approved; private app-repo content that is not marketing-safe.
- Legal pages: use the `{{PLACEHOLDER}}` / notice mechanism from the app repo docs. NEVER invent legal details (entity name, address, registration numbers, jurisdiction, dates, contact emails). Unknown values stay as visible placeholders and are listed in STATUS.md under "Decisions needed from the user".
- App Store claims: only the Player app (id 6760209167) is on the App Store flow; Coach (6797363821) and Parent (6797363870) are TestFlight only. Do not claim availability for unpublished apps; use "Coming soon / join the beta" CTAs until published.
- The private app repo (`/Users/nilesh93/Projects/personal/stumpnote`) is READ-ONLY. Use `git -C <path> fetch -q origin` then `git -C <path> show origin/main:<file>`. Never edit its working tree.
- Admin / AI-spend data stays behind Payload auth. Never expose cost data on public routes or in client bundles.

## 2. Recovery protocol (so any session can resume)
- At the END of every work unit: update `STATUS.md` (stage row: status, last commit, next action) and `TASKS.md`, then commit and push. No exceptions, even for partial work (mark it `in progress` with a precise next action).
- Stages S0..S7 are defined in `docs/ops/stages/*.md`. Do the stage brief, not what you remember.
- Resume order: `STATUS.md` -> `TASKS.md` -> next stage brief. See `docs/ops/RESUME.md`.
- Record decisions in `docs/spec/decisions.md` (create on first decision; ADR style, one short entry each). Questions for the user go in STATUS.md "Decisions needed from the user".
- Anything needing a user action (login, terms acceptance, payment, paid resource, DNS) is recorded as BLOCKED in STATUS.md with the exact next click-path. Do not accept legal terms, billing, or paid upgrades on the user's behalf.

## 3. Git rules
- Default branch `main`. Never leave `main` broken (build + lint + typecheck pass before pushing code changes).
- Small commits, Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`, `ci:`).
- Planning docs may be committed straight to `main`. Code changes: commit to `main` only when green; use a branch + PR for risky or large work.
- Commit trailers (end of every commit message):
  ```
  Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01URuczWXTLJnxG8w96dsTan
  ```
- No GitHub Actions workflows that require secrets.

## 4. Deploy
- Deploy only via the documented path (defined in stage S7 brief; Vercel free tier, project linked to this GitHub repo). Do not invent alternative hosting.
- All secrets live in Vercel / Payload environment settings only.

## 5. Quality budgets
- Accessibility: WCAG 2.2 AA minimum; keyboard navigable; visible focus; `prefers-reduced-motion` respected; sufficient contrast on the dark canvas; semantic landmarks; alt text.
- Performance (mobile, Lighthouse): Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 95; LCP < 2.5s, CLS < 0.1, INP < 200ms. Fonts self-hosted/subset; images optimized (`next/image`); minimal client JS.
- Design: follow the StumpNote brand (dark canvas #0B1114, text #F2F5F4, muted #96A1AB; persona accents teal #00B9AE player, #FD9423 coach, #CC5572 parent, #89C012 team; Archivo 900 display + Hanken Grotesk body; Lucide icons; the "M" brush-stroke mark). Tokens in one place; no one-off hardcoded colors.

## 6. Tooling notes
- Disk is tight on this Mac: use the pnpm store; delete `node_modules` and `.next` after verification.
- Never broad-`pkill`; stop only processes you started (by PID).
- Truncate noisy output (`| tail -50`, `grep`).
- Browser automation (GitHub, Vercel) uses the already-logged-in Chrome session via Claude in Chrome tools; use your own tab and close it after. Never type passwords.

## 7. Where things go
| Thing | Location |
|---|---|
| Live status, blockers, user decisions | `STATUS.md` |
| Task backlog | `TASKS.md` |
| Stage briefs | `docs/ops/stages/*.md` |
| Resume instructions | `docs/ops/RESUME.md` |
| Spec (product, design, technical) | `docs/spec/` |
| Decisions (ADR style) | `docs/spec/decisions.md` |
