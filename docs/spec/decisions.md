# Decision log (ADR style)

One short entry per decision. IDs match the table in [00-overview.md](./00-overview.md) section 7. Status: `proposed` (agent default, awaiting user), `accepted`, `superseded`.

Add new entries at the bottom; never edit an accepted entry, add a superseding one instead.

---

## D-01 Hosting plan: existing Vercel Pro team (proposed, 2026-10-04)
Context: user asked for "Vercel free tier". Vercel Hobby is for non-commercial, personal use only (fair-use guidelines, checked 2026-10-04); the claim in the first draft that Hobby cannot Git-import org repos was not supported by current Vercel docs and was removed in the spec review. The user's account already has a Pro team hosting `app.stumpnote.com`.
Decision: deploy `stumpnote-site` into that Pro team. Fallback if the user insists on Hobby: direct Git import of the repo with the fair-use risk recorded in writing by the user. No GitHub Actions deploy path (it needs a `VERCEL_TOKEN` repo secret, forbidden by CLAUDE.md).
Consequences: zero incremental cost; Spend Management available; a "Pause production deployments" setting there would pause the app too, so budgets use notifications only.

## D-02 Payload >= 3.90.2 on Next 16 App Router, Node 24, pnpm 10, Tailwind 4 (accepted)
Context: Payload 3.90.0 shipped security fixes; `@payloadcms/next` has a strict Next peer range; Node 20 deprecated on Vercel.
Decision: start from Payload's `with-vercel-website` template, bump to the versions above, pin all `@payloadcms/*` to one exact version.
Consequences: run `payload generate:importmap` and `generate:types` after config changes; build with `payload build`.

## D-03 Database: Neon Postgres free via Vercel Marketplace, `@payloadcms/db-postgres` (proposed)
Decision: `DATABASE_URI` (pooled) at runtime with `pool.max = 1`; `DATABASE_URI_UNPOOLED` for `payload migrate`. Provisioning requires the user to accept Neon terms (BLOCKED gate).
Consequences: scale-to-zero cold starts on admin; public routes are static/ISR so visitors never hit the DB. Never mix dev push mode and migrations on the same database.

## D-04 Local dev database: Docker `postgres:17-alpine` (accepted)
Decision: `docker-compose.yml` with one service; `pnpm db:up` / `db:down`. Same engine as prod.
Consequences: Docker required locally (already present for `supabase start`).

## D-05 Media: Vercel Blob with client uploads, max 3 image sizes (accepted)
Consequences: brand assets stay in `/public`; Blob store creation may prompt for terms (BLOCKED gate if so).

## D-06 Website analytics: owner chose the NouanceLabs `payload-dashboard-analytics` plugin; verify in S6; fallback = custom admin view (accepted direction, provider pending)
Context: owner decision D-ANALYTICS in `USER-DECISIONS.md` (2026-10-04). Technical pre-check the same day: npm `@nouance/payload-dashboard-analytics` latest 0.3.0 (2023-05-25), peer `payload ^1.6.16`, React 16 to 18, repo last pushed 2023-08-28, providers Plausible and Google Analytics only; expected incompatible with Payload 3.90. The unscoped npm package `payload-dashboard-analytics` (2.2.0, peer `payload ^3.29`) is NOT the owner's plugin (different publisher, GA4-only, depends on `@payloadcms/db-mongodb`) and must not be installed as a substitute. The community PostHog plugin for Payload 3 was not evaluated (auth model unknown), so it is not an alternative. GA4 plugins need a consent banner.
Decision: S6 step S6-00 installs `@nouance/payload-dashboard-analytics` (scoped name only) in a scratch branch, records the result (`pnpm install` peer errors, admin boot) in `STATUS.md`. If incompatible: custom admin view at `/admin/analytics/web`, server-side read, cookieless provider, aggregate-only, same panels. Provider for the fallback is the owner's call: Plausible (plugin's privacy-friendly provider; paid) or PostHog Cloud EU (free, `cookieless_mode: "always"`, `person_profiles: "never"`). If the owner has not answered when S6 runs: ship on fixtures with the PostHog adapter wired but inactive (the agent may not create paid resources); live tracking waits for the owner's provider choice and account gate.
Consequences: `src/analytics/web-provider.ts` is an interface with `plausible.ts` and `posthog.ts` adapters; the site snippet is loaded only for the configured provider; `/cookies` describes whichever runs; account creation is a BLOCKED gate either way.

## D-LEGAL Legal values come from the owner's existing sherlabs.com policy pages (accepted, owner decision)
Context: `USER-DECISIONS.md` D-LEGAL. Decision: S5 step S5-00 reads `https://www.sherlabs.com/privacy` and related pages, extracts only facts stated there, and proposes them in `STATUS.md` for owner approval. Nothing is published until approved; retention/backup/usage-log values stay placeholders until the owner approves proposed values.

## D-07 StumpNote data: read-only Postgres role over an `analytics` schema of aggregate views (proposed)
Decision: SQL draft in `supabase-analytics-views.sql`; views owned by `postgres` (owner privileges, not `security_invoker`), functions `SECURITY DEFINER` with pinned `search_path`; role `payload_analytics_ro` with SELECT on the granted views only; k-anonymity k = 5; `analytics` schema never exposed through PostgREST. Password set out of band. Until applied, `ANALYTICS_MODE=fixtures`.
Consequences: the migration lives in the private repo and is applied only on explicit user approval (S6).

## D-08 Admin roles: admin / editor / viewer (accepted)
Decision: `users.roles` array; analytics and SiteSettings require `admin`; `editor` edits content; `viewer` reads admin only. First-user flow closed after first admin exists.

## D-09 No scheduled publishing, no Payload jobs (accepted)
Context: Vercel cron is daily-only on Hobby; jobs queue needs a cron hitting `/api/payload-jobs/run`.
Decision: do not configure `jobs` or `schedulePublish`. Publish manually.

## D-10 Domain: apex `stumpnote.com` canonical, `www` 308 to apex, DNS stays at Namecheap (proposed)
Decision: add `A @ 76.76.21.21` and `CNAME www <value from Vercel>`; keep MX, SPF TXT and `app` CNAME. Never change nameservers. Runbook in `07-deploy-runbook.md`.

## D-11 Naming: GitHub `sherlabs/stumpnote-web`, Vercel project `stumpnote-site` (accepted)
Context: a Vercel project named `stumpnote-web` already exists and is the Flutter web app.

## D-12 Motion stack: GSAP + ScrollTrigger + SplitText, Lenis, CSS scroll-driven as enhancement, OGL hero (accepted)
Decision: no Framer Motion / Motion package; no React Three Fiber.

## D-13 Legal pages: Payload-versioned, placeholder + notice mode, stumpnote.com canonical (accepted mechanism; values pending user)
Decision: port the three behaviours of the app repo's legal renderer (substitution, review markers, notice mode) plus a strict production gate. `POLICY_VERSION` sync order documented in `06-legal-pages.md`.

## D-14 Pricing: show indicative plans, no buy button, CMS toggle to hide (proposed)

## D-15 Beta CTA: `betaAccess` global, ships as waitlist (accepted; amended in spec review)
Amendment: the waitlist form itself ships disabled (`waitlistEnabled=false`) until the privacy page is live and a deletion/unsubscribe contact exists (06-legal-pages section 6). The state stays `waitlist`; only the form is gated.


---

## D-16 Scaffold: Payload `v3.90.2` template for the admin route group only; everything else hand-built (accepted, S1, 2026-10-04)
Context: the `main` branch of `payloadcms/payload` ships a `with-vercel-website` template that targets unreleased APIs (`generatePayloadViewport`) and fails to build against the published 3.90.2 packages. `create-payload-app@3.90.2` no longer lists that template.
Decision: take only `src/app/(payload)` from the `v3.90.2` tag of the template (minus its SCSS file); drop the template frontend, header/footer globals, search, form-builder, nested-docs, jobs and crons; build collections, globals, site routes and config by hand to the spec. Versions: Payload 3.90.2, Next 16.3.8, React 19.3.0, Tailwind 4.3, pnpm 10.34.6 (`packageManager`), Node 24 (`engines.node = "24.x"`, `.nvmrc`).
Consequences: no template baggage; the build script is `next build` (there is no `payload build` command in 3.90.2, the spec table in 01-architecture section 10 is corrected).

## D-17 Database pool: `max` defaults to 3, not 1 (accepted, S1)
Context: with `pool.max = 1`, `payload migrate` and any transactional request hang forever against Postgres (the adapter needs a second connection while the first is held). Verified locally against Postgres 17.
Decision: `pool.max = Number(DATABASE_POOL_MAX ?? 3)`. Neon's pooled endpoint (PgBouncer) tolerates this easily.
Consequences: revisit only if Neon free connection limits bite. Use `127.0.0.1`, not `localhost`, in local URLs (the Docker port is published on IPv4 only).

## D-18 Postgres enum collision: `features.status` needs `enumName` (accepted, S1)
Context: drafts create `_status` whose enum is `enum_features_status`, colliding with a select field named `status` (migration failed with "invalid input value for enum"). Same trap applies to any collection with drafts and a field called `status`.
Decision: `enumName: 'feature_release_status'` on that field; field name stays `status` so the spec and seeds are unchanged. Apply the same pattern to any future `status` field.

## D-19 `robots.ts` and `sitemap.ts` live at `src/app/`, not in `(site)` (accepted, S1)
Context: with two root layouts, Next 16.3.8 served `/sitemap.xml` from `(site)` but 404ed `/robots.txt`. Root-level files work for both.

## D-20 Next agent-rules block disabled (accepted, S1)
`next dev` 16.3 appends a block to `CLAUDE.md`. `agentRules: false` in `next.config.ts` stops it; this repo owns its `CLAUDE.md`.

## D-21 Dependency audit: overrides and one ignored advisory (accepted, S1)
`pnpm.overrides` raise `undici` (>=7.29.1), `esbuild` (>=0.25) and `dompurify` (>=3.4.16), all pulled in by Payload packages. One high advisory remains with no patched release (`braces` via `@payloadcms/next > sass > chokidar`, a dev-time file-watching glob dependency): ignored via `pnpm.auditConfig.ignoreGhsas`. Re-check on every Payload bump.

## D-22 Vercel project created in the Pro team; first skeleton deploy via CLI (proposed D-01 default applied, S1)
Project `stumpnote-site` was created in the existing Pro team (D-01 default; the owner's literal words were "free tier", still open). A project can be moved between teams later, so this is reversible. The first production deploy was a CLI `vercel deploy --prod` (git integration was connected by `vercel link`; the first git-triggered deploy and the `ignoreCommand` behaviour with `VERCEL_GIT_PREVIOUS_SHA` still have to be observed on the next code push and recorded here). Env set: `PAYLOAD_SECRET` (Production, Preview, sensitive, different values), `ANALYTICS_MODE=fixtures`, `NEXT_PUBLIC_SERVER_URL` (Production). No `DATABASE_URI`: `/admin` answers 500 on the skeleton by design; `/` is static and unaffected.

## D-23 First-user flow verified (accepted, S1)
Against a fresh local DB: `POST /api/users/first-register` creates the user with `roles=['admin']` even though `Users.access.create = isAdmin`; a second `first-register` and an anonymous `POST /api/users` both return 403. Hook covered by `tests/unit/first-user-roles.test.ts`.
