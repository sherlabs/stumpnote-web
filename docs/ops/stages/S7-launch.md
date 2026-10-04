# S7 Launch: domain cutover, awards polish, Lighthouse pass, repo hardening, handoff

Read first: [CLAUDE.md](../../../CLAUDE.md), [STATUS.md](../../../STATUS.md), spec [07-deploy-runbook.md](../../spec/07-deploy-runbook.md) (all), [00-overview.md](../../spec/00-overview.md) section 5 (awards checklist), [08-test-and-quality.md](../../spec/08-test-and-quality.md) sections 3, 8, 9, [02-design.md](../../spec/02-design.md) sections 10, 11.

## Goal
Production on `stumpnote.com` (after user approval of DNS), CSP enforcing, WAF and spend notifications set, GitHub repo hardened with a secret-free CI, final Lighthouse and accessibility pass on production URLs, the awards-readiness pack prepared, and a handoff document so the user can run the site without an agent.

## Prerequisites
- S3..S6 done; DB gates cleared; first admin exists; production seeded; legal pages in notice mode or complete.
- User approvals for: DNS edit (D-10), WAF rules, Spend Management settings. Record approvals in `STATUS.md` log before acting.

## Steps
- [ ] S7-01 Pre-flight on the `*.vercel.app` production URL: full Playwright suite against production (`PLAYWRIGHT_BASE_URL`), Lighthouse from the local machine on the production URL, link checker, content QA checklist. Fix until green.
- [ ] S7-02 Awards polish pass using the checklist in [00-overview.md](../../spec/00-overview.md) section 5: review each chapter at 1440 and 375 for timing and restraint; ensure one filled accent per view; tune SplitText timings; confirm the M paint is the first motion a juror sees; 404 bails flourish; favicon and OG images final. Record a short list of tweaks and commit them.
- [ ] S7-03 CSP: switch both policies from Report-Only to enforcing after checking the console on every route and in the admin; keep `frame-ancestors 'self'` for `/admin` and preview. Record any required inline allowances in `decisions.md`.
- [ ] S7-04 Domain (user-approved): follow [07-deploy-runbook.md](../../spec/07-deploy-runbook.md) section 4 exactly: add domains to `stumpnote-site`, `www` 308 to apex, Namecheap `A @ 76.76.21.21` + `CNAME www <Vercel value>`, keep MX/SPF/`app`; verify with `dig`/`curl`; set `NEXT_PUBLIC_SERVER_URL=https://stumpnote.com`; redeploy; confirm canonicals, sitemap and OG use the apex. If the user has not approved, skip and record BLOCKED.
- [ ] S7-05 Vercel: Spend Management budget with notifications only (never pause production); WAF rate-limit rules on `/api/users/login` and the waitlist route; optional `/admin` IP allow-list if the user supplies IPs. Dashboard steps; record what was set.
- [ ] S7-06 GitHub hardening per runbook section 7: secret scanning + push protection, Dependabot alerts and updates, `.github/dependabot.yml`, `.github/CODEOWNERS`, secret-free `.github/workflows/ci.yml` (`pnpm check` + DB-free build on PRs and pushes), branch ruleset on `main` with owner bypass. Replace README badges with the real workflow and Vercel badges.
- [ ] S7-07 Final production Lighthouse (mobile) on all routes from the user's machine or the agent's; paste the table into `STATUS.md`; all >= 95 with CWV budgets met, or list the exact shortfall and fix.
- [ ] S7-08 Awards pack `docs/ops/awards-pack.md`: site URL, 60-second recording instructions (what to scroll), 5 still shots list, credits text, category suggestions, and the note that submission fees are the user's decision. Do not submit.
- [ ] S7-09 Handoff `docs/ops/HANDOFF.md`: how to edit content, publish legal pages when values arrive (and the `POLICY_VERSION` order), flip `beta-access` state, add a changelog entry, read the analytics views, rotate secrets, weekly quota checks, and the list of user-owned follow-ups (app-repo 308 redirects, App Store Connect URLs, legacy site redirects, Gemini tier confirmation, data-safety decision).
- [ ] S7-10 Changelog entry "Website launched" seeded; `STATUS.md` S7 row done; `TASKS.md` all ticked or moved to a "Post-launch" list; `rm -rf node_modules .next`; commit; push.

## Files created
`.github/{dependabot.yml,CODEOWNERS,workflows/ci.yml}`, `docs/ops/awards-pack.md`, `docs/ops/HANDOFF.md`, README badge updates, CSP changes in `next.config.mjs`.

## Acceptance criteria
- `https://stumpnote.com` serves the site with HTTPS; `www` redirects 308; MX and SPF unchanged (`dig`); `app.stumpnote.com` untouched. (Or BLOCKED recorded if not approved.)
- CSP enforcing with zero console violations on all routes and in the admin.
- Production Lighthouse table in `STATUS.md` meets budgets.
- GitHub: secret scanning and push protection on; CI green on `main`; ruleset active.
- Awards pack and handoff doc exist; every awards checklist item ticked or listed with a reason.
- `STATUS.md` shows S0..S7 done, remaining user-owned follow-ups listed under "Decisions needed" / "Blocked".

## Verification
```bash
dig +short A stumpnote.com; dig +short MX stumpnote.com; curl -sI https://www.stumpnote.com | head -3
PLAYWRIGHT_BASE_URL=https://stumpnote.com pnpm test:e2e | tail -30
gh api repos/sherlabs/stumpnote-web | jq '.security_and_analysis'
gh run list --repo sherlabs/stumpnote-web --limit 3
```

## Rollback
See [07-deploy-runbook.md](../../spec/07-deploy-runbook.md) section 5: promote a previous deployment; remove the new DNS records to return to the pre-cutover state; CSP back to Report-Only by one-line change.

## Finish
Update STATUS.md + TASKS.md; commit; push.
