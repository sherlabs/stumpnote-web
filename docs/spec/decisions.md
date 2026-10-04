# Decision log (ADR style)

One short entry per decision. IDs match the table in [00-overview.md](./00-overview.md) section 7. Status: `proposed` (agent default, awaiting user), `accepted`, `superseded`.

Add new entries at the bottom; never edit an accepted entry, add a superseding one instead.

---

## D-01 Hosting plan: existing Vercel Pro team (proposed, 2026-10-04)
Context: user asked for "Vercel free tier". Vercel Hobby is non-commercial only and cannot Git-import org-owned repos. The user's account already has a Pro team hosting `app.stumpnote.com`.
Decision: deploy `stumpnote-site` into that Pro team. Fallback if the user insists on Hobby: GitHub Actions `vercel build` + `vercel deploy --prebuilt` with a `VERCEL_TOKEN` repo secret and the fair-use risk recorded.
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
Context: owner decision D-ANALYTICS in `USER-DECISIONS.md` (2026-10-04). Technical pre-check the same day: npm latest 0.3.0 (2023-05-25), peer `payload ^1.6.16`, React 16 to 18; expected incompatible with Payload 3.90. The community PostHog plugin for Payload 3 exposes its data endpoint without a `req.user` check, so it is not an alternative. GA4 plugins need a consent banner.
Decision: S6 step S6-00 installs the plugin in a scratch branch, records the result (`pnpm install` peer errors, admin boot) in `STATUS.md`. If incompatible: custom admin view at `/admin/analytics/web`, server-side read, cookieless provider, aggregate-only, same panels. Provider for the fallback is the owner's call: Plausible (plugin's privacy-friendly provider; paid) or PostHog Cloud EU (free, `cookieless_mode: "always"`, `person_profiles: "never"`). If the owner has not answered when S6 runs: ship on fixtures with the PostHog adapter wired but inactive (the agent may not create paid resources); live tracking waits for the owner's provider choice and account gate.
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

## D-15 Beta CTA: `betaAccess` global, ships as waitlist (accepted)
