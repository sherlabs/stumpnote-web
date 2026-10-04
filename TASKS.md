# TASKS

Backlog for the StumpNote website. Keep in sync with `STATUS.md`. Stage briefs with the full step detail: `docs/ops/stages/S<n>-*.md`.

## ID scheme

`S<stage>-<NN>`, matching the step ids in the stage briefs. IDs are never reused. Stage numbering changed 2026-10-04 (planning folded into S0; S1..S7 are build stages); no S1-xx ids existed before, so none were reused.

Status markers: `[ ]` open, `[~]` in progress, `[x]` done, `[!]` blocked (explain in STATUS.md).

Format: `- [ ] ID title (owner: agent|user) (deps) (est)`. Estimates are agent working time in hours, rough.

## S0 Bootstrap + plan spec

- [x] S0-01 Create public repo sherlabs/stumpnote-web and clone (owner: agent)
- [x] S0-02 Recovery scaffolding: README, NOTICE, .gitignore, CLAUDE.md, RESUME.md, STATUS.md, TASKS.md (owner: agent)
- [x] S0-03 Write docs/spec/00..08 + SQL draft + decisions.md (owner: agent)
- [x] S0-04 Write stage briefs S1..S7 (owner: agent)
- [x] S0-05 Expand TASKS.md, finalise STATUS.md, refine RESUME.md prompts (owner: agent)

## S1 Scaffold (brief: docs/ops/stages/S1-scaffold.md)

- [x] S1-01 Scaffold from Payload `with-vercel-website` template into repo (owner: agent) (S0) (1h)
- [x] S1-02 Pin versions per D-02; swap to `@payloadcms/db-postgres`; install (agent) (S1-01) (0.5h)
- [x] S1-03 `payload.config.ts`: adapter, serverURL, conditional storage/email, no jobs (agent) (S1-02) (1h)
- [x] S1-04 Collections + globals skeletons with exact slugs and access helpers (agent) (S1-03) (2h)
- [x] S1-04b Users first-user hook (empty collection forces `roles=['admin']`) + unit test; remove template `next-sitemap`/`form-builder` (agent) (S1-04) (0.5h)
- [x] S1-05 `(site)` route group: layout, skeleton home, 404, robots, sitemap, `/lab` shell (agent) (S1-03) (1h)
- [x] S1-06 `tokens.css` + Tailwind 4 theme mapping (agent) (S1-05) (0.5h)
- [x] S1-07 `next.config` headers (CSP report-only), `vercel.json` ignoreCommand (agent) (S1-05) (0.5h)
- [x] S1-08 DB-free build guard verified (`env -u DATABASE_URI pnpm build`) (agent) (S1-04, S1-05) (0.5h)
- [x] S1-09 Docker Postgres compose, db scripts, `.env.example` names (agent) (S1-03) (0.5h)
- [x] S1-10 First migration, generated types + importmap committed (agent) (S1-04, S1-09) (0.5h)
- [x] S1-11 Quality scripts: check, lint, typecheck, secrets scan, Playwright smoke (agent) (S1-05) (1h)
- [x] S1-12 Local verification: dev, admin first user (local), smoke test (agent) (S1-10, S1-11) (0.5h)
- [x] S1-13 Vercel link + git connect project `stumpnote-site`; env PAYLOAD_SECRET/SERVER_URL/ANALYTICS_MODE; skeleton deploy (agent) (S1-08) (1h)
- [x] S1-14 Record BLOCKED gates (Neon, Blob, first admin) + D-01 team note (agent) (S1-13) (0.25h)
- [x] S1-15 Clean node_modules/.next (agent) (0.1h)
- [x] S1-16 Update STATUS/TASKS, commit, push (agent) (0.25h)
- [ ] S1-U1 Accept Neon Marketplace terms, Free plan, name `stumpnote-cms`, connect Production + Preview (owner: user) (S1-13)
- [ ] S1-U2 Create Vercel Blob store for `stumpnote-site` (owner: user) (S1-13)
- [ ] S1-U3 Create first Payload admin user at `/admin` after first DB deploy (owner: user) (S1-U1)
- [ ] S1-17 After gates: map `DATABASE_URI`/`_UNPOOLED`, Neon preview branch, build command `pnpm ci`, first prod migration (agent) (S1-U1) (1h)

## S2 Design system + motion foundation (brief: S2-design-system.md)

- [ ] S2-01 Tokens finalised, lint rule for hex, contrast table measured (agent) (S1) (1h)
- [ ] S2-02 Self-hosted fonts via next/font/local with licence file (agent) (S1) (1h)
- [ ] S2-03 ui primitives: Button, TextLink, Overline, Badge, Card, Field, Checkbox, Notice (agent) (S2-01) (2h)
- [ ] S2-04 site shell: SkipLink, Nav, Footer, AmbientRings, PersonaProvider, ThemeToggle, Section, Chapter (agent) (S2-03) (3h)
- [ ] S2-05 Motion foundation: gsap registration, reduced-motion hook, Lenis gating, matchMedia helper, idle loader (agent) (S2-04) (2h)
- [ ] S2-06 Signature components: MStroke, BailsLoader, PitchHeatGrid, KineticTranscript, SeriesChart, HeroRings, EntryDots, QuickLogStrip, VoiceNoteTyper, SquadGrid (agent) (S2-05) (8h)
- [ ] S2-07 `/lab` demo route with controls (agent) (S2-06) (1.5h)
- [ ] S2-08 visual/motion/a11y Playwright specs + snapshots (agent) (S2-07) (2h)
- [ ] S2-09 Lenis sanity: anchors, find-in-page, keyboard, touch (agent) (S2-05) (0.5h)
- [ ] S2-10 Bundle check: async chunks, first-load JS recorded (agent) (S2-07) (0.5h)
- [ ] S2-11 Clean, STATUS/TASKS, commit, push (agent) (0.25h)

## S3 Home page (brief: S3-home.md)

- [ ] S3-01 Block renderers (hero-story, statement, chapter, persona-tabs, feature-carousel, cta-beta, principles, rich-text, testimonials) (agent) (S2) (3h)
- [ ] S3-02 `pages` full fields + blocks; migration; types (agent) (S3-01) (1h)
- [ ] S3-03 Home seed JSON from the content brief (agent) (S3-02) (1h)
- [ ] S3-04 `/` page with CMS fetch + code fallback (agent) (S3-03) (1h)
- [ ] S3-05 Hero composition; LCP = headline (agent) (S3-04) (2h)
- [ ] S3-06 Pinned "How it learns" chapter with stage swaps (agent) (S3-05) (3h)
- [ ] S3-07 Persona tabs with page re-theming (agent) (S3-04) (1h)
- [ ] S3-08 Features carousel (agent) (S3-04) (1.5h)
- [ ] S3-09 Game day, Mind, Body, Team, Privacy, CTA chapters + waitlist server action (form gated by `beta-access.waitlistEnabled`, default off; Local API with overrideAccess, collection create access denied) (agent) (S3-06) (4h)
- [ ] S3-10 Footer wiring + `track()` no-op events (agent) (S3-09) (0.5h)
- [ ] S3-11 home/layout-shift specs, Lighthouse on `/`, size-limit (agent) (S3-10) (2h)
- [ ] S3-12 Mobile pass 320/375/768 (agent) (S3-11) (1h)
- [ ] S3-13 Clean, STATUS (Lighthouse numbers)/TASKS, commit, push (agent) (0.25h)

## S4 CMS pages + seed (brief: S4-cms-pages.md)

- [ ] S4-01 Full fields for features, personas, faqs, posts, changelog, testimonials, waitlist, redirects, media; access matrix; migration (agent) (S2, S3-01) (3h)
- [ ] S4-02 Globals full fields + revalidation hooks (agent) (S4-01) (1h)
- [ ] S4-03 Live Preview + draft preview route (agent) (S4-02) (1h)
- [ ] S4-04 Routes: features index/page, 4 persona pages, pricing, security, join, support, blog, changelog, [slug] (agent) (S4-03) (6h)
- [ ] S4-05 Seed JSON (22 features, 5 personas, 20 FAQs, pages, globals) + idempotent `scripts/seed.ts` with --dry-run/--delete (agent) (S4-01) (3h)
- [ ] S4-06 `claims.test.ts` banned-phrase scan on seed (agent) (S4-05) (0.5h)
- [ ] S4-07 features/pricing/nav specs + a11y on new routes (agent) (S4-04) (2h)
- [ ] S4-08 Lighthouse on new routes (agent) (S4-07) (1h)
- [ ] S4-09 Production seed once gates cleared (agent, with user present) (S1-U3, S4-05) (0.5h)
- [ ] S4-10 Clean, STATUS/TASKS, commit, push (agent) (0.25h)
- [ ] S4-U1 Decide show/hide pricing (D-14) (owner: user)

## S5 Legal + SEO + quality pass (brief: S5-legal-seo-quality.md)

- [ ] S5-00 Read sherlabs.com policy pages; propose legal values in STATUS for owner approval, publish nothing (agent) (S4) (0.5h)
- [ ] S5-01 legal-pages full fields, versions, strict-gate and policyVersion hooks; legal-values global (agent) (S4) (2h)
- [ ] S5-02 `legal/render.ts` + unit tests (agent) (S5-01) (2h)
- [ ] S5-03 Importer from private repo sources; draft cookies/account-deletion/data-safety with review markers (agent) (S5-02) (2h)
- [ ] S5-04 Legal routes incl. history/version routes, notice mode, print CSS (agent) (S5-03) (2h)
- [ ] S5-05 Footer legal items + EULA link; /legal index (agent) (S5-04) (0.5h)
- [ ] S5-06 Metadata, canonical, sitemap from CMS, robots, OG images, favicons, manifest (agent) (S4) (3h)
- [ ] S5-07 JSON-LD with exclusions + unit test (agent) (S5-06) (1h)
- [ ] S5-08 Accessibility pass (axe all routes, keyboard, VoiceOver, zoom) (agent) (S5-04, S5-06) (3h)
- [ ] S5-09 Performance pass (full Lighthouse set, size-limit) (agent) (S5-08) (3h)
- [ ] S5-10 Link checker + legal/seo specs (agent) (S5-09) (1h)
- [ ] S5-11 Content QA checklist walked (agent) (S5-10) (1h)
- [ ] S5-12 Clean, STATUS (Lighthouse table)/TASKS, commit, push (agent) (0.25h)
- [ ] S5-U1 Supply the 16 legal values (owner: user) (see docs/spec/06-legal-pages.md section 4)
- [ ] S5-U2 Lawyer review; set LEGAL_REVIEW_DONE=yes (owner: user)
- [ ] S5-U3 Decide on publishing /data-safety now (owner: user)
- [ ] S5-U4 Provide a monitored deletion/unsubscribe contact and approve the website/waitlist privacy section; then set `waitlistEnabled=true` (owner: user)

## S6 Admin analytics (brief: S6-admin-analytics.md)

- [ ] S6-00 Verify the NouanceLabs `payload-dashboard-analytics` plugin against Payload 3 in a scratch branch; record result in STATUS; plugin or documented fallback (agent) (S1) (1h)
- [ ] S6-01 `src/analytics/*` server-only modules, zod types, fixtures generator, cache (agent) (S1) (4h)
- [ ] S6-02 `requireAdmin` + audit write + throttle (agent) (S6-01) (1h)
- [ ] S6-03 Three admin views with Recharts panels per spec (agent) (S6-02) (8h)
- [ ] S6-04 Dashboard tiles + nav group; importmap (agent) (S6-03) (1h)
- [ ] S6-05 analytics-settings, price-scenarios globals; audit-log collection; migration (agent) (S6-01) (1h)
- [ ] S6-06 Web-analytics snippet (provider per D-06, cookieless) + custom events + CSP connect-src (agent) (S3-10) (1h)
- [ ] S6-07 Optional TOTP evaluation (agent) (S6-02) (1h)
- [ ] S6-08 admin.spec, queries tests, fixtures schema test, chunk check (agent) (S6-04) (2h)
- [ ] S6-09 Private-repo PR instructions doc (no apply) (agent) (S6-01) (1h)
- [ ] S6-10 Record user-approved steps as BLOCKED with click-paths (agent) (S6-09) (0.25h)
- [ ] S6-11 Clean, STATUS/TASKS, commit, push (agent) (0.25h)
- [ ] S6-U1 Choose fallback provider (Plausible paid or PostHog free) and create the account; add its env vars + `WEB_ANALYTICS_PROVIDER` (owner: user)
- [ ] S6-U2 Approve + merge private-repo migration PR; apply to prod; set role password; add `STUMPNOTE_ANALYTICS_DATABASE_URL` (owner: user)
- [ ] S6-U3 Set `ANALYTICS_MODE=live`; verify live views (owner: user with agent)
- [ ] S6-U4 Optional RevenueCat key (owner: user)
- [ ] S6-12 When told: prepare the private-repo PR from a fresh clone per the instructions doc (agent) (S6-U2 pre-step) (2h)

## S7 Launch (brief: S7-launch.md)

- [ ] S7-01 Pre-flight: full suites against production URL (agent) (S3..S6) (2h)
- [ ] S7-02 Awards polish pass per checklist (agent) (S7-01) (4h)
- [ ] S7-03 CSP enforcing (agent) (S7-01) (1h)
- [ ] S7-04 Domain cutover per runbook (agent, after S7-U1) (1h)
- [ ] S7-05 Spend Management notifications + WAF rules (agent, dashboard, after S7-U2) (0.5h)
- [ ] S7-06 GitHub hardening: scanning, Dependabot, CODEOWNERS, ci.yml, ruleset, badges (agent) (S7-01) (1.5h)
- [ ] S7-07 Final production Lighthouse table in STATUS (agent) (S7-04) (1h)
- [ ] S7-08 Awards pack doc (agent) (S7-02) (1h)
- [ ] S7-09 HANDOFF.md (agent) (S7-07) (1.5h)
- [ ] S7-10 Changelog entry, STATUS all done, TASKS post-launch list, clean, commit, push (agent) (0.5h)
- [ ] S7-U1 Approve Namecheap DNS edit (D-10) (owner: user)
- [ ] S7-U2 Approve WAF rules and spend notification settings (owner: user)
- [ ] S7-U3 Submit to awards (paid; optional) (owner: user)
- [ ] S7-U4 Follow-ups outside this repo: app-repo 308 redirects for legal URLs, App Store Connect URLs, legacy sherlabs.com redirects, Gemini tier confirmation, TestFlight public link (owner: user)

## Estimate summary (agent hours, rough)

S1 ~12 · S2 ~22 · S3 ~22 · S4 ~22 · S5 ~22 · S6 ~22 · S7 ~14. Total about 135 agent hours across sessions; each stage is resumable at task granularity.
