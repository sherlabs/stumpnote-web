# 00 Overview: vision, goals, constraints, decisions

Part of the StumpNote website spec. Index: [docs/spec/README.md](./README.md). Status of execution: [STATUS.md](../../STATUS.md). Decision log: [decisions.md](./decisions.md). **Owner decisions in [USER-DECISIONS.md](./USER-DECISIONS.md) override any conflicting default below.**

Written 2026-10-04. Facts about third-party services were checked on that date; re-verify before relying on a limit or a version.

## 1. Vision

StumpNote is a voice-first cricket journal with an AI that remembers each player's game. The website has one job: make a visitor feel, in under a minute of scrolling, what it is like to have a memory of your own cricket that keeps learning, then move them to the right next step (join the beta, open the web app, or read how juniors are protected).

Working title for the creative concept: **"The innings that remembers."** One continuous scroll, where the StumpNote "M" brush stroke paints itself and each chapter drops a live component (not a video) into a sticky stage. Details in [02-design.md](./02-design.md).

The site also hosts a **Payload CMS** admin that carries website analytics and StumpNote AI-spend and product analytics for the founders. Details in [04-analytics-and-admin.md](./04-analytics-and-admin.md).

## 2. Goals

| # | Goal | Measure |
|---|---|---|
| G1 | Award-grade marketing site | Submission-ready against the checklist in section 5; Lighthouse mobile Performance >= 95, Accessibility >= 95, Best Practices >= 95, SEO >= 95 on every public route |
| G2 | Honest, legally safe content | Every claim traceable to [05-content-brief.md](./05-content-brief.md); legal pages render in notice mode until real values exist ([06-legal-pages.md](./06-legal-pages.md)); zero invented legal facts |
| G3 | CMS-driven content | Features, personas, pricing, FAQ, posts, changelog and legal text editable in Payload without a deploy ([03-cms-model.md](./03-cms-model.md)) |
| G4 | Founder analytics in the admin | Website traffic, AI spend and product usage visible at `/admin`, admin-role only, aggregate-only ([04-analytics-and-admin.md](./04-analytics-and-admin.md)) |
| G5 | Recoverable build | Any fresh agent can resume from `STATUS.md` + a stage brief with no other context ([docs/ops/RESUME.md](../ops/RESUME.md)) |
| G6 | Public-repo safe | No secrets, PII, raw cost numbers, internal issue links or non-marketing-safe private content ever committed ([CLAUDE.md](../../CLAUDE.md) section 1) |

## 3. Non-goals

- No e-commerce or web billing. Subscriptions are App Store only; the site shows indicative prices and never a buy button.
- No user accounts on the marketing site. The only form is the beta waitlist (email + persona + consent).
- No i18n. English only.
- No 3D cricket scene. One hero WebGL shader at most; everything else is SVG/CSS.
- No scheduled publishing in Payload (cron constraints, see decision D-09).
- No App Store badges or availability claims until an app is actually live.
- No testimonials, user counts, ratings or press logos until real, consented records exist.
- No changes to the private app repo from this project. Any app-repo change (analytics migration, legal redirects) is prepared as a separate, user-approved step.

## 4. Audiences

| Audience | What they need from the site | Primary route |
|---|---|---|
| Player (13+, club to academy) | Feel the voice-journal + memory promise; join the beta | `/`, `/players`, `/join` |
| Captain / vice-captain | Squad planning without everyone on the app; team plan pricing | `/captains`, `/pricing` |
| Coach | Voice notes to structured sessions; sees only what players share | `/coaches` |
| Parent / guardian | Junior safety, consent model, what they can and cannot see | `/parents`, `/security` |
| App Store reviewers and partners | Reachable privacy, terms, support and account-deletion pages | `/privacy`, `/terms`, `/support`, `/account-deletion` |
| Awards jurors | Craft, motion, usability, accessibility, performance | `/` and `/lab` (hidden demo route, noindex) |
| Founders (admin) | Analytics and content editing | `/admin` |

## 5. Success metrics and awards readiness

**Core Web Vitals and Lighthouse (mobile, throttled, every public route):** LCP < 2.0 s, CLS < 0.05, INP < 150 ms, Lighthouse Performance >= 95, Accessibility >= 95, Best Practices >= 95, SEO >= 95. Initial JS on `/` under ~170 KB gzipped (target, measured in S7). Budgets and how they are checked: [08-test-and-quality.md](./08-test-and-quality.md).

**Awards submission readiness checklist** (Awwwards weights Design 40%, Usability 30%, Creativity 20%, Content 10%; Developer Award needs > 7.0 developer score; Honorable Mention from 6.5). Submitting costs money (Awwwards and CSSDA charge per submission) and is the user's decision; this checklist only makes the site ready.

- [ ] One signature interaction that is unmistakably ours (the M paints itself; persona re-theming of the whole page).
- [ ] Two-colour discipline per view: canvas + one accent; navigation and tabs neutral.
- [ ] Scroll as narrative spine; every chapter a live component with real DOM text.
- [ ] Usability score defended: keyboard order = visual order, visible focus, 44 px primary targets, no scroll-jacking on touch, find-in-page works.
- [ ] Accessibility defended: WCAG 2.2 AA, reduced-motion renders final static states, every demo has a text alternative.
- [ ] Performance defended: budgets above met on a mid-range phone profile.
- [ ] Content defended: no lorem, no placeholder images, legal pages live (or in honest notice mode), copy per [05-content-brief.md](./05-content-brief.md).
- [ ] Works 320 to 2560 px with no horizontal scroll; print stylesheet for legal pages.
- [ ] OG images, favicon set, 404 page with the bails flourish, custom domain live on HTTPS.
- [ ] A 60 s screen recording and 5 stills prepared for the submission form (user submits).

## 6. Constraints

1. **Public repo hygiene.** See [CLAUDE.md](../../CLAUDE.md) section 1. In addition, never commit: GitHub issue or PR numbers from the private repo, branch names, the Supabase project ref, model names with per-token prices, raw spend figures, App Store Connect internals, or the reasons a claim was softened. The spec says "per internal review" where a reason exists; the reason stays with the user.
2. **Hosting cost.** The user asked for the Vercel free tier. Vercel's Hobby plan is non-commercial only and cannot Git-import an org-owned repo. The user already has a Vercel Pro team that hosts `app.stumpnote.com`, so the recommended path adds zero incremental cost. Decision D-01 below; it is the user's call.
3. **No paid services, no terms acceptance by the agent.** Any provider flow that needs terms acceptance, payment or a new paid resource is recorded as BLOCKED in `STATUS.md` with the exact click-path.
4. **No secrets in the agent's hands beyond env.** All credentials live in Vercel env (and a local `.env` that is never committed).
5. **Private app repo is read-only.** Mine it with `git -C /Users/nilesh93/Projects/personal/stumpnote show origin/main:<path>`. Never edit its working tree. Any change it needs (analytics views migration, legal redirects) is a separate user-approved deliverable.
6. **Availability claims.** Web app is live at `https://app.stumpnote.com`. All three iOS apps are TestFlight only; nothing is on the App Store. CTAs read "Join the beta" / "Coming soon to the App Store". App ids (Player 6760209167, Coach 6797363821, Parent 6797363870) are used only to prepare future links, never shown as live.
7. **Disk and tooling.** Disk is tight on the dev Mac: use the pnpm store, delete `node_modules` and `.next` after verification. Never broad-`pkill`. Truncate noisy output.

## 7. Key decisions

Each row is recorded as an ADR entry in [decisions.md](./decisions.md). "Default" means what the agent builds unless the user says otherwise. "Decides" names who must confirm.

| ID | Topic | Decision (default) | Rationale | Alternatives rejected | Decides |
|---|---|---|---|---|---|
| D-01 | Hosting plan | Deploy to the user's **existing Vercel Pro team** (the one hosting `app.stumpnote.com`), project name `stumpnote-site`. Fallback: Hobby via GitHub Actions + `vercel deploy --prebuilt`, with the non-commercial-use risk accepted in writing. | Pro already paid for; only path that Git-imports an org repo and satisfies Vercel's fair-use rule for a commercial site; Spend Management available. | Hobby Git import (not allowed for org repos); Cloudflare Workers (Payload needs the paid Workers plan); Netlify (free-tier commercial permission is forum-only). | **User** |
| D-02 | Framework and CMS versions | Next.js App Router, version inside `@payloadcms/next`'s peer range (16.3.x at time of writing); **Payload >= 3.90.2** with all `@payloadcms/*` pinned to the same exact version; React 19.3; Node `24.x`; pnpm 10; TypeScript 5/6 as the template ships; Tailwind CSS 4. Start from Payload's `with-vercel-website` template, then bump. | 3.90.0 carried security fixes; Node 20 is deprecated on Vercel; template gives Live Preview, drafts, SEO, redirects, search plugins. | Payload 4 canary (not stable); Astro + separate Payload (two deploys, more cost). | Agent |
| D-03 | Database | **Neon Postgres free plan** via Vercel Marketplace, adapter `@payloadcms/db-postgres` (node-postgres) with `pool.max = 1`; runtime uses the pooled URL, migrations use the direct URL. Env names: `DATABASE_URI`, `DATABASE_URI_UNPOOLED`. Provisioning is a BLOCKED gate (terms). | Only free Postgres in the Marketplace; Payload needs Postgres on Vercel (SQLite is not viable on an ephemeral filesystem). | Supabase free project (pauses after a week; must not share the app's prod project); `@payloadcms/db-vercel-postgres` (depends on `@vercel/postgres`, status unclear). | Agent proposes, **user** accepts Neon terms |
| D-04 | Local dev DB | **Docker `postgres:17-alpine`** via `docker-compose.yml`. Same engine as prod so migrations are identical. Docker is already on the Mac for `supabase start`. | Push-mode (dev) and migrations (prod) must never mix engines; SQLite/pglite would diverge from Postgres SQL. | pglite (no verified official Payload 3 adapter); Neon dev branch as the only local DB (works offline poorly; burns compute hours). | Agent |
| D-05 | Media storage | **Vercel Blob** via `@payloadcms/storage-vercel-blob`, `clientUploads: true`, at most 3 `imageSizes`. Brand assets (SVG mark, fonts) live in the repo, not Blob. | Simplest on Vercel; small media library. | Supabase Storage via S3 adapter (mixes with app project); Cloudflare R2 (extra account). | Agent |
| D-06 | Website analytics | **Owner decision ([USER-DECISIONS.md](./USER-DECISIONS.md) D-ANALYTICS): use the NouanceLabs `payload-dashboard-analytics` plugin**, verified for Payload 3 compatibility in S6 before wiring, with its best-supported privacy-friendly provider (cookieless where possible). Pre-check on 2026-10-04 (npm registry): latest 0.3.0, published 2023-05-25, peer `payload ^1.6.16`, so it is expected to be **incompatible** with Payload 3.90. If S6 confirms that, the agent documents the reason in `STATUS.md` and falls back to a **custom Payload admin view for the same provider class** (cookieless, aggregate-only, server-side read); it never switches plugins silently. Provider for the fallback is an open user choice: Plausible (the plugin's privacy-friendly provider; paid, so BLOCKED on billing) or PostHog Cloud EU free tier (cookieless mode). The spec is written so either plugs into the same view. | Owner chose the plugin; the technical pre-check says it is dead on Payload 3, so the fallback must be ready. GA4 needs a consent banner and conflicts with the juniors/privacy story. | Community PostHog plugin for Payload 3 (its data endpoint is unauthenticated); Umami Cloud (API not on free tier); Vercel Web Analytics (no custom events on Hobby); GA4 plugins (cookies, consent). | **User**: confirm fallback provider (Plausible paid vs PostHog free) when S6 reports the compatibility result |
| D-07 | StumpNote data access for admin views | Dedicated **read-only Postgres role** over the Supabase pooler, granted SELECT only on an `analytics` schema of aggregate views (k-anonymity k >= 5). SQL draft: [supabase-analytics-views.sql](./supabase-analytics-views.sql). Applying it to prod is a user-approved S6 step. Until then the admin runs on `ANALYTICS_MODE=fixtures` (synthetic data). | Service-role key must never reach the site; PostgREST custom roles need the JWT secret; management API tokens are account-wide. | Service-role key in env; Edge Function gateway (phase 2 upgrade); nightly snapshot into Payload DB (optional later). | **User** approves migration + creates role password |
| D-08 | Admin roles | `users.roles`: `admin`, `editor`, `viewer`. Analytics views and SiteSettings gated to `admin`. Open registration off after first user. MFA via `payload-totp` (optional, S6). | Task asked for these three; least privilege. | `analyst` role (collapsed into `admin` for now). | Agent |
| D-09 | Scheduled publishing / jobs | Off. Payload `schedulePublish` and the jobs queue are not used. | Vercel cron on Hobby is once a day; on Pro it is fine but not needed. Keep the site cron-free. | GitHub Actions cron (needs secrets; forbidden by CLAUDE.md). | Agent |
| D-10 | Domain plan | Canonical host **`stumpnote.com`** (apex), `www` 308-redirects to apex. DNS stays at Namecheap: add `A @ 76.76.21.21` and `CNAME www <vercel value>`; keep MX, SPF and the `app` CNAME untouched. Do not move nameservers. Cutover is a user-approved S7 step. | Nothing is live on apex or www today, so the change is additive; moving nameservers would risk email. | Vercel nameservers (email migration risk); `www` canonical (fine but apex is already registered in the team). | **User** approves DNS edit |
| D-11 | Repo and project naming | GitHub `sherlabs/stumpnote-web` (public). Local clone `/Users/nilesh93/Projects/personal/stumpnote-site`. Vercel project **`stumpnote-site`**. | The Vercel project named `stumpnote-web` is the Flutter web app and must not be touched. | Renaming the GitHub repo (breaks links already shared). | Done |
| D-12 | Motion stack | GSAP 3.15 + ScrollTrigger + SplitText (free since 2025), Lenis 1.3 (fine pointers only), CSS scroll-driven animations as progressive enhancement, one OGL hero shader behind capability gates. No Framer Motion / Motion. | Smallest stack that covers pinned scrubs, kinetic type and smooth scroll; GSAP is the award-site standard. | Motion v14 (two days old at time of writing); React Three Fiber (JS budget). | Agent |
| D-13 | Legal pages | Rendered from the app repo's markdown sources with the same `{{PLACEHOLDER}}` + `{{LEGAL_REVIEW: ...}}` + **notice mode** mechanism, stored in Payload as versioned `LegalPages` + a `LegalValues` global. `stumpnote.com` becomes the canonical legal host; `app.stumpnote.com/{privacy,terms,support}` later 308-redirect to it (app-repo change, user-approved). | Never invent legal facts; App Store Connect URLs must never break. | Copying the diverged HTML pages; hosting legal only on the app subdomain. | Agent builds; **user** supplies values |
| D-14 | Pricing display | Show "Plans" with indicative USD prices (Free, Player, Pro Player, Team, Coach add-on, Team/Academy Coach) and an "Indicative; final prices in the app" line, no buy button. CMS toggle to hide the whole page. | Prices exist in the product docs; honesty label protects against drift. | Hide pricing entirely (user may still choose this). | **User** (show or hide) |
| D-15 | Beta CTA | `betaAccess` global with state `waitlist | testflight | appstore` + URL. Ships as `waitlist` (form stored in Payload). | No public TestFlight link exists yet; flipping state later needs no deploy. | Hard-coded TestFlight link (does not exist). | Agent; **user** supplies link later |

## 8. Decisions needed from the user

Listed with the recommended default. The agent builds the default; the user can override any time by editing `STATUS.md` or telling the next session.

1. **Hosting plan (D-01).** Default: existing Vercel Pro team, project `stumpnote-site`. Alternative: Hobby via GitHub Actions with the fair-use risk accepted.
2. **Website analytics fallback provider (D-06).** You chose the NouanceLabs plugin; its registry metadata says Payload 1 only, so S6 will almost certainly report "incompatible" and fall back to a custom view. Choose the provider for that view: Plausible (the plugin's privacy-friendly option; paid plan, billing is yours) or PostHog Cloud EU (free tier, cookieless). Default if unanswered: PostHog, because no paid services may be created by the agent.
2b. **Legal values source (D-LEGAL).** Per your decision, S5 reads your existing public policy pages on sherlabs.com, extracts only the facts stated there (entity, address, contact mailboxes, governing law if present) and lists them in `STATUS.md` as a proposal for your approval before anything is published. Retention, backup and usage-log periods stay placeholders until you approve values.
3. **Show pricing before App Store launch (D-14).** Default: show, labelled indicative.
4. **Legal values** (all 16 keys in [06-legal-pages.md](./06-legal-pages.md) section 4). Default: pages stay in notice mode.
5. **Copyright holder in `NOTICE`** (currently "Sherlabs"). Default: unchanged until the legal entity is confirmed.
6. **Apply the analytics views migration to the StumpNote prod DB (D-07)** and set the read-only role password. Default: admin runs on fixtures.
7. **Approve the Namecheap DNS edit (D-10).** Default: site stays on the `*.vercel.app` URL.
8. **TestFlight public link (D-15).** Default: waitlist form.
9. **Gemini billing tier confirmation**, to decide whether a "not used to train" claim is allowed. Default: hedged wording from the content brief.
10. **Whether to publish `/data-safety`** before the App Store privacy label is corrected. Default: publish only as a plain-language summary of the policy appendix.
11. **Waitlist mailbox ownership**: who monitors it, where unsubscribe requests go. Default: stored in Payload only; no email sending.
12. **Redirect plan for the legacy `sherlabs.com` pages** and the app-repo change that turns `app.stumpnote.com/{privacy,terms,support}` into 308 redirects. Default: not done by this project; listed as follow-up.

## 9. Stage map

| Stage | Name | Spec sections it executes | Brief |
|---|---|---|---|
| S0 | Bootstrap + plan spec | this directory | done |
| S1 | Scaffold: Next + Payload + Tailwind, DB adapter, collections skeleton, quality scripts, local Docker Postgres, first DB-free skeleton deploy | 01, 03 (skeleton), 07 (project link) | [S1-scaffold.md](../ops/stages/S1-scaffold.md) |
| S2 | Design system + motion foundation, `/lab` demo route | 02 | [S2-design-system.md](../ops/stages/S2-design-system.md) |
| S3 | Home page: hero + storytelling chapters | 02 (home), 05 | [S3-home.md](../ops/stages/S3-home.md) |
| S4 | Features, personas, pricing, security, join, support pages from CMS + seed | 03, 05 | [S4-cms-pages.md](../ops/stages/S4-cms-pages.md) |
| S5 | Legal pages (notice mode) + SEO/OG/sitemap/JSON-LD + a11y/perf pass | 06, 02 (a11y/perf), 08 | [S5-legal-seo-quality.md](../ops/stages/S5-legal-seo-quality.md) |
| S6 | Admin: website analytics + AI-spend and product analytics views | 04, SQL draft | [S6-admin-analytics.md](../ops/stages/S6-admin-analytics.md) |
| S7 | Launch: domain cutover, awards polish, Lighthouse pass, repo hardening, handoff | 07, 08 | [S7-launch.md](../ops/stages/S7-launch.md) |
