# 07 Deploy runbook: Vercel, env, DB provisioning, domain cutover, rollback, quotas, GitHub hardening

Index: [README.md](./README.md). Decisions D-01, D-03, D-05, D-10, D-11 in [00-overview.md](./00-overview.md). Env names: [01-architecture.md](./01-architecture.md) section 5 (the only list). Executed in S1 (project link, skeleton deploy) and S7 (domain, hardening).

Facts about Vercel, Neon and Namecheap were checked 2026-10-04 with the Vercel CLI, `gh` and `dig`; re-verify anything marked (re-check) before acting.

Hard rules: the agent never accepts terms, picks a paid plan, enters payment details or types a password. Those steps are BLOCKED gates recorded in `STATUS.md` with the click-path given here. Browser steps use the already logged-in Chrome session (Claude in Chrome tools), in the agent's own tab, closed afterwards.

## 1. Accounts and names

| Thing | Value |
|---|---|
| GitHub repo | `sherlabs/stumpnote-web` (public, default `main`) |
| Local clone | `/Users/nilesh93/Projects/personal/stumpnote-site` |
| Vercel team | the user's existing **Pro** team that hosts `app.stumpnote.com` (D-01; its slug is visible in `vercel teams ls`; not recorded here). Fallback (user accepts fair-use risk in writing): the Hobby team, direct Git import. |
| Vercel project | **`stumpnote-site`**. Do not touch the existing project `stumpnote-web` (the Flutter web app). |
| Domain | `stumpnote.com` (already registered in the Pro team; apex and `www` unused today; `app` CNAME serves the Flutter app) |
| Registrar / DNS | Namecheap BasicDNS (nameservers `dns1/dns2.registrar-servers.com`); email forwarding MX + SPF present and must be kept |

## 2. Vercel project (S1)

```bash
cd /Users/nilesh93/Projects/personal/stumpnote-site
npx vercel@latest whoami                       # confirm logged in
npx vercel@latest teams ls                     # pick the Pro team slug -> $SCOPE (do not commit it)
npx vercel@latest link --yes --project stumpnote-site --scope "$SCOPE"
npx vercel@latest git connect https://github.com/sherlabs/stumpnote-web --scope "$SCOPE"
# fallback: dashboard, Add New, Project, Import Git Repository, sherlabs/stumpnote-web, name stumpnote-site
```
Settings: Framework preset Next.js; root `.`; install `pnpm install --frozen-lockfile`; build command `pnpm build` until the DB exists, then `pnpm ci`; Node 24.x; production branch `main`; previews on all pushes/PRs; Git Fork Protection on; Vercel Authentication on for previews.

`vercel.json` (committed):
```json
{ "ignoreCommand": "git diff --quiet ${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} HEAD -- . ':!docs' ':!*.md'" }
```

Env vars: `npx vercel env add <NAME> production` (value via stdin, pasted by the agent only when the user has provided it; never echoed to logs); mark Sensitive. Preview scope gets separate non-production values. `.env.example` lists names only.

Skeleton deploy (S1, DB-free): push to `main` and confirm `https://stumpnote-site-<hash>.vercel.app` (or the project's `*.vercel.app` alias) serves the skeleton. If Git connect fails for the chosen team, record BLOCKED and use `npx vercel deploy --prod` from the CLI for the skeleton only.

## 3. Database and storage provisioning (BLOCKED gates)

**Neon (D-03).** `vercel integration discover` lists Neon. Install: dashboard, team, Storage, Create Database, Neon. This prompts for integration terms and a plan: the user must click through.
- Click-path for the user: Vercel, team, **Storage**, **Create Database**, **Neon**, accept terms, plan **Free**, name `stumpnote-cms`, region closest to the user (Sydney or Singapore), connect to project `stumpnote-site` for **Production** and **Preview**.
- After install, Neon writes env vars into the project. Map them: set `DATABASE_URI` = pooled URL, `DATABASE_URI_UNPOOLED` = direct URL (Neon names them `DATABASE_URL`/`POSTGRES_URL` and `DATABASE_URL_UNPOOLED`; create the two names the app expects or rename in the project settings).
- Preview environment: create a Neon branch `preview` and point the Preview-scoped `DATABASE_URI*` at it. Previews never use the main branch.
- Then switch the build command to `pnpm ci`, redeploy, and watch `payload migrate` in the build log.
- Free-plan behaviour (verified 2026-10-04 on neon.com/docs): scale-to-zero after 5 minutes (cannot be disabled), 100 CU-hours per project per month, 1 GB storage per project, point-in-time restore window 6 hours. Builds wake it.

**Vercel Blob (D-05).** Dashboard, project `stumpnote-site`, Storage, Create, Blob (may prompt for terms: user step). Creates `BLOB_READ_WRITE_TOKEN` in the project env. Keep image sizes to three.

**First Payload admin user.** After the first deploy with a DB, the user opens `/admin` on the production URL and creates the first account (the agent never types passwords). Until then `/admin` shows the create-first-user screen; do not leave production in that state longer than necessary.

**Email (optional).** Resend free tier for password resets. Requires account + domain DNS records: user step; otherwise leave `RESEND_API_KEY` unset (Payload logs a warning).

## 4. Domain cutover (S7, user-approved)

Order: verify the production deployment on its `*.vercel.app` URL first; then add domains in Vercel; then edit DNS. Nothing is live on apex or `www` today, so the change is additive.

1. **Add domains to the project** (CLI or dashboard; `stumpnote.com` is already in the team so no TXT verification is expected):
   ```bash
   npx vercel@latest domains add stumpnote.com stumpnote-site --scope "$SCOPE"
   npx vercel@latest domains add www.stumpnote.com stumpnote-site --scope "$SCOPE"
   ```
   Dashboard, project, Settings, Domains: set `www.stumpnote.com` to **Redirect to `stumpnote.com` (308)**. Note the CNAME target Vercel shows for `www` (project-specific `*.vercel-dns-*.com` value). Do not touch `app.stumpnote.com`.
2. **Namecheap** (user's session; the agent may drive the browser but the user approves first): Domain List, Manage `stumpnote.com`, Advanced DNS.
   - Screenshot the current records before changing anything (keep the screenshot out of the repo).
   - Delete only if present: `CNAME www -> parkingpage.namecheap.com`; `URL Redirect @`. (Public DNS showed neither on 2026-10-04; the Namecheap UI may still list them.)
   - Add: `A Record | @ | 76.76.21.21 | Automatic` and `CNAME Record | www | <value from Vercel> | Automatic`.
   - **Keep exactly as they are:** all MX records (eforward1..5), the SPF TXT `v=spf1 include:spf.efwd.registrar-servers.com ~all`, Mail Settings = Email Forwarding, and the `app` CNAME.
   - Do **not** change nameservers to Vercel.
3. **Verify:**
   ```bash
   dig +short A stumpnote.com                  # 76.76.21.21
   dig +short CNAME www.stumpnote.com          # Vercel value
   dig +short MX stumpnote.com; dig +short TXT stumpnote.com   # unchanged
   npx vercel@latest domains inspect stumpnote.com --scope "$SCOPE"
   curl -sI https://stumpnote.com | head -5    # 200
   curl -sI https://www.stumpnote.com | head -5 # 308 -> https://stumpnote.com/
   ```
   TLS is issued automatically once DNS validates (minutes, re-check). Set `NEXT_PUBLIC_SERVER_URL=https://stumpnote.com` and redeploy so canonicals, sitemap and OG URLs use the apex.
4. Later (user-owned follow-ups, not this project): app-repo 308 redirects for `app.stumpnote.com/{privacy,terms,support}`; App Store Connect Support/Marketing/Privacy URLs; legacy `sherlabs.com` pages.

## 5. Rollback

| What broke | Action |
|---|---|
| Bad deployment | Dashboard, Deployments, previous production deployment, **Promote** (Instant Rollback); or `npx vercel rollback`; or `git revert` on `main` |
| Bad migration | Neon console, Restore (point-in-time, 6 hours on the Free plan, so act the same day) or restore a branch; `pg_dump` taken before destructive migrations (`scripts/db-dump.sh`, output gitignored) |
| DNS | Delete the new `A @` and `CNAME www` records; the domain returns to its previous state (no web record). Re-add old records only if the pre-change screenshot shows them |
| Admin lockout | Reset via Resend email if configured; otherwise an admin runs a one-off local script against the production DB with the unpooled URL exported for that shell only |

## 6. Quotas and monitoring

| Resource | Watch | Where |
|---|---|---|
| Vercel usage (functions, data transfer, image transformations, builds) | weekly | Team, Usage. Spend Management: set a budget with notifications at 50/75/100%; **never** enable "Pause production deployments" (it would pause the app project too) |
| Neon compute hours / storage | weekly | Neon console |
| Blob storage and operations | monthly | Project, Storage |
| Web analytics usage (PostHog events vs free cap, or Plausible pageviews vs plan) | monthly | provider billing page |
| Vercel WAF | after launch | Project, Firewall: rate-limit `/api/users/login` and the waitlist route; optional IP allow-list on `/admin` |
| Function logs | ad hoc | Project, Logs (short retention; export if needed) |

Hobby-plan figures, if the fallback is used (Vercel docs, 2026-09): 100 GB fast data transfer, 1,000,000 function invocations, 5,000 image transformations, 100 deployments/day, 3 WAF custom rules (Pro: 40), 1 hour of runtime logs (Pro: 1 day), no Spend Management, non-commercial use only; cron is limited (see the cron docs before relying on it, the spec uses none).

## 7. GitHub repo hardening (S7)

```bash
R=sherlabs/stumpnote-web
gh api -X PATCH repos/$R --input - <<'J'
{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}
J
gh api -X PUT repos/$R/vulnerability-alerts
gh api -X PUT repos/$R/automated-security-fixes
```
Also add: `.github/dependabot.yml` (npm + github-actions, weekly), `.github/CODEOWNERS` (`* @nilesh93 @srsharon`), a secret-free `ci.yml` running `pnpm check` and `pnpm build` with `DATABASE_URI` unset. Branch ruleset on `main` after the first stable deploy: require PR + CI check, block force-push and deletion, bypass for the owner. Never commit `.env*`, DB URLs, app keys, player ids or emails; never link private issue numbers in README or commits.

## 8. Checklist summary per stage

- S1: link project, skeleton deploy DB-free, record Neon/Blob/first-user gates as BLOCKED.
- After user clears gates: map env names, switch build to `pnpm ci`, first migration, first admin user created by the user, seed.
- S7: domains, DNS (user-approved), verify, canonical env, WAF rules, Spend Management notifications, GitHub hardening, update `STATUS.md`.
