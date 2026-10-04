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
Update 2026-10-04 (owner: "anything else? I'd like an open source plugin"): no Payload 3 compatible open-source analytics plugin met the admin-only rule, so the recommendation is the open-source product Umami (MIT) behind the existing custom view, adapter `src/analytics/umami.ts`, switch `WEB_ANALYTICS_PROVIDER=umami`. Details in STATUS.md D-06; the owner still has to confirm and create the account.
Consequences: `src/analytics/web-provider.ts` is an interface with `umami.ts`, `plausible.ts` and `posthog.ts` adapters; the site snippet is loaded only for the configured provider; `/cookies` describes whichever runs; account creation is a BLOCKED gate either way.

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
Project `stumpnote-site` was created in the existing Pro team (D-01 default; the owner's literal words were "free tier", still open). A project can be moved between teams later, so this is reversible. The first production deploy was a CLI `vercel deploy --prod` (git integration was connected by `vercel link`). Observed 2026-10-04: a push containing code triggered a production build (Ready in 20s); a following docs-only push produced no deployment, so the `ignoreCommand` with `VERCEL_GIT_PREVIOUS_SHA` behaves as intended. Env set: `PAYLOAD_SECRET` (Production, Preview, sensitive, different values), `ANALYTICS_MODE=fixtures`, `NEXT_PUBLIC_SERVER_URL` (Production). No `DATABASE_URI`: `/admin` answers 500 on the skeleton by design; `/` is static and unaffected.

## D-23 First-user flow verified (accepted, S1)
Against a fresh local DB: `POST /api/users/first-register` creates the user with `roles=['admin']` even though `Users.access.create = isAdmin`; a second `first-register` and an anonymous `POST /api/users` both return 403. Hook covered by `tests/unit/first-user-roles.test.ts`.

## D-24 Light theme: tokens and toggle exist, not shipped in the site chrome (accepted, S2)
02-design section 12 cuts the light theme first, and the brief says the spec wins. `[data-theme='light']` tokens and `ThemeToggle` exist and are exercised on `/lab` only (optional snapshots); the footer carries the Motion toggle only. Accent as small text fails AA on light, so shipping light needs the re-derived palette (see 02-design section 2). axe runs on the dark theme only.

## D-25 Display-1 steps down earlier than the spec minimum (accepted, S2)
The spec floor of 56px made "remembered." overflow at 320 to 390px. `.display-1` is `clamp(40px, 13vw, 83px)` below 640px and `83px + (100vw - 640px) * 0.054` (max 160px) above, which gives about 127px at 1440. Display lines stay at 2 lines on desktop and mobile. `word-spacing: 0.06em` keeps -0.05em tracking readable.

## D-26 `.overline` renamed `.eyebrow` (accepted, S2)
Tailwind owns a utility called `overline` (`text-decoration: overline`), which drew a line over every label. The spec's "overline" style is the `.eyebrow` class and the `Overline` component. `Chapter` takes an `eyebrow` prop.

## D-27 Motion architecture: CSS-first, `data-motion` gate, GSAP only for scrub (accepted, S2)
An inline head script sets `html[data-motion='on'|'off']` before first paint (OS setting or footer toggle, `localStorage` key `sn-motion`). SSR always renders the final state; hidden/initial states exist only under `html[data-motion='on']` (`[data-reveal]`, MStroke paint, bails, heat cells, transcript). Without JS the attribute is absent so everything is visible. A 5 s failsafe animation reveals content if hydration never flips `idle` to `in`. MStroke paint, shine, loop, heat fill, chart draw-on and bails are pure CSS (no GSAP, nothing waits for hydration). GSAP + ScrollTrigger (`src/lib/motion`) are registered lazily and used only for scrubbed chapters (`useChapterProgress`); Lenis rides GSAP's ticker, mounts after idle on `(pointer: fine)` with motion allowed, and anchors work through `anchors: true`.

## D-28 Pinned chapters use CSS sticky, not ScrollTrigger pin (accepted, S2)
`Chapter pinned` keeps the stage column `position: sticky` at lg+. Layout is reserved by CSS (no CLS), reduced-motion and no-JS users get the same page, and there is no pin-spacer. ScrollTrigger is used only to read progress. If S3 needs a true scrubbed pin it can wrap the same markup.

## D-29 SplitText not used for the transcript (accepted, S2)
`KineticTranscript` splits words in React so the words exist in the server HTML (real DOM text, no layout jump, no GSAP on the critical path). Reading pace 2.8 words/s via a timer; beats scale 1 to 1.06 while current. `SplitText` stays registered for S3 headline reveals.

## D-30 Global 404 via `global-not-found` (accepted, S2)
The app has several root layouts, so unmatched URLs had no `<html lang>` (axe `html-has-lang`). `experimental.globalNotFound` plus `src/app/global-not-found.tsx` renders the same shell (`SiteShell`) with the "Bowled." page.

## D-31 Static nav/footer link filter (accepted, S2)
`src/lib/site-config.ts` lists every planned route with `ready: boolean`; Nav and Footer render only ready routes, so the deployed site never links to a 404. The Nav CTA is "Join the beta" once `/join` is ready; until then it is "Web app" (app.stumpnote.com). Flip flags per stage; S4 replaces this with the CMS `navigation` global.

## D-32 Home content lives in a typed TS module, not JSON (accepted, S3)
`src/seed/pages/home.ts` exports the `home` document typed against the generated `Page` type (blocks included). The seed script and the code fallback both import it, so renderer, seed and fallback cannot drift (a JSON file would widen `blockType` to `string`). `pnpm seed` upserts it by slug; `pnpm seed:dry` prints the plan. Options travel as env vars (`SEED_DRY_RUN`, `SEED_ONLY`, `SEED_ALLOW_REMOTE`) because `payload run` strips CLI flags from `process.argv`; the script uses top-level await because `payload run` exits when the module finishes evaluating.

## D-33 `/` is ISR with a code fallback, no `unstable_cache` (accepted, S3)
`getHomeContent()` (src/lib/cms/home.ts) returns the seed when `DATABASE_URI` is unset or any CMS call throws; the page uses `revalidate = 300` (S4 adds on-demand revalidation hooks). The production deploy has no database yet (Neon gate), so the fallback IS the production path until S1-U1 is done. Relationship blocks (`persona-tabs`, `feature-carousel`) use built-in copy from the content brief (src/content/home-fallbacks.ts) while their relationships are empty. A DB-free build is verified with `DATABASE_URI= pnpm build` (an empty value overrides `.env`; `env -u` does not, Next re-reads the file).

## D-34 No GSAP on the home page (accepted, S3)
Scroll scrubs use `useScrollProgress` (IntersectionObserver-gated scroll listener writing `--p` on one element, rAF-throttled, no React state) and CSS sticky for the pinned chapter (D-28). SplitText is not used: the hero lines are CSS-animated spans (transform only, never opacity, so the h1 and the lead paragraph, either of which can be the LCP element, are painted at first render). First-load JS stays free of GSAP; Lenis still loads after idle.

## D-35 Pinned chapter markup: pinned + inline stages, switched by CSS (accepted, S3)
How it learns renders a sticky stage column (`.learn-pinned`) and a per-step inline stage (`.learn-inline`). `html[data-motion='on']` at lg+ shows the pinned stage and hides the inline ones; everywhere else (mobile, motion off, no JS because the attribute is absent) the four steps are stacked cards. Stages remount when they become active so typing and dot-landing replay. Layout height is reserved (fixed stage box), no CLS.

## D-36 Persona accent crossfade via registered custom properties (accepted, S3)
`@property --accent` and `--accent-text` are registered as colours and `html` transitions them for 300 ms, so every token derived from them (soft, hi, M gradient, focus ring, CTA) follows in one move. Derived tokens are now declared on `:root, [data-persona]` so a scoped persona (the Team chapter) recomputes them instead of inheriting the page values. The Team chapter sets `data-persona="team"` on its own wrapper and never calls `setPersona`.

## D-37 In-block links to unbuilt routes are gated by `isRouteReady` (accepted, S3; deviates from the brief's "link anyway")
D-31 (never link to a 404) wins over the S3 brief. Persona-tab links, feature-card links and the privacy-chapter link render only when `site-config` marks the route `ready`; S4/S5 flip the flags and the links appear with no code change. The hero primary CTA is the `#join` anchor on the home page (the `/join` route arrives in S4).

## D-38 Waitlist form, defaults and storage (accepted, S3)
The form renders only when `beta-access.waitlistEnabled` is true (ships false). The server action re-checks the gate, validates, honeypots (bots get the success answer), applies a best-effort in-memory rate limit per instance (5 per 10 minutes, nothing persisted), and writes through the Local API with `overrideAccess: true`. `ipHash` is NOT stored (nothing to leak). The default consent sentence is draft wording pending legal review (listed in STATUS.md); the owner can override it in the Beta access global. A duplicate email answers success without revealing it.

## D-39 Lighthouse gates on applied throttling; lantern estimate recorded as informational; CSS inlined (accepted, S3; owner may overrule)
`pnpm test:lh` runs Lighthouse mobile with applied (DevTools) throttling: 4x CPU, 150 ms RTT, 1.6 Mbps, the same profile the Chrome-emulated runs use. Result on `/`: Performance 0.99, Accessibility 1.00, Best practices 1.00, SEO 1.00, FCP = LCP 1.6 s, CLS 0, TBT 90 ms. `pnpm test:lh --simulate` gives Lighthouse's lantern estimate (the PageSpeed-style number): Performance 0.92 to 0.94 and LCP 2.8 to 3.3 s, which MISSES the 2.0 s budget. Cause: lantern treats every script requested before first paint as a render dependency, and the Next 16 + React 19 baseline alone is about 140 KB gzip (react-dom 70, Next client 42, shared 14 + 8); app code is about 25 KB. The same artifact shows on the deployed URL. Real observed LCP (CDP 4x CPU, 1.6 Mbps) is 1.2 s before and 1.6 s after CSS inlining under Lighthouse's harsher latency multiplier. Getting the lantern number under 2.0 s would need most signature components converted to server components (S5 perf pass candidate); not done in S3. `experimental.inlineCss` is on (removes the CSS round trip: FCP/LCP 2.2 s to 1.6 s under applied throttling); side effect: the Payload admin HTML carries its CSS inline (about 1.3 MB raw per full page load; SPA navigation afterwards is unaffected). On mobile the lead paragraph, not the h1, is the LCP node (larger text area); both paint in the first frame.

## D-41 /blog and /changelog exist but are not linked until they have content (accepted, S4)
Both routes render (empty state, `noindex`, out of the sitemap) but stay out of `READY_ROUTES`, so nav and footer do not link to empty pages. S7 publishes the "Website launched" changelog entry; add `/changelog` (and `/blog` with the first post) to `READY_ROUTES` then.

## D-42 Content is typed TS, not JSON, and FAQs got a slug (accepted, S4; deviates from the brief's `*.json`)
`src/seed/data/{features,personas,faqs}.ts` and `src/seed/pages/content-pages.ts` follow D-32: one typed source for the seed, the code fallback (production has no database until Neon is attached) and `claims.test.ts`. `faqs` gained a `slug` (idempotent seed key, anchors). Lexical bodies come from `src/seed/lexical.ts`, so seed and fallback render identically.

## D-43 Live Preview uses the editor's session, not a preview secret (accepted, S4; deviates from the brief's `PREVIEW_SECRET`)
`admin.livePreview.url` points at `/next/preview/<collection>/<slug>`, a dynamic route that calls `payload.auth()` and 404s unless a staff user is signed in (same-origin cookie in the iframe). Public pages stay fully static (no `draftMode()`), and no secret ever reaches a client. `/next/*` already carries `noindex` and `no-store` headers.

## D-44 Seed policy: create missing, never overwrite (accepted, S4)
`pnpm seed` creates documents that do not exist and skips the rest, so re-running changes nothing and editors' changes survive. Globals fill blank fields only. `SEED_FORCE=1` overwrites, `SEED_DELETE=1` (`pnpm seed:delete`) removes the seeded documents. This replaces S3's update-on-every-run for `home`.

## D-45 Features filter is CSS-only; FAQ accordion is native `<details>` (accepted, S4)
Radio inputs + `:has()` filter the 22 cards with zero JavaScript (the `/` budget is at 165 of 170 KB), and all 22 stay in the DOM. Decorative outlined numerals are drawn from `data-n` via `::before` so no transparent-coloured text exists for contrast checkers.

## D-46 Team member has no route of its own (accepted, S4)
Five persona records, four routes: `members` renders as a section on `/captains` (the home tabs already link there).

## D-47 Pricing: video row and Free column (accepted, S4; owner to confirm)
The comparison table shows Free video uploads as "None", following the wireframe in 02-design section 9; the brief does not state it explicitly. Change in the CMS if Free has an allowance. The 90-day trial line is off by default (`site-settings.showTrialLine`).

## D-48 Legal rendering, versions and gates (accepted, S5)
`src/lib/legal/render.ts` is pure and server-only by usage (never imported by a client component). Values are HTML- and markdown-escaped on substitution; `{{LEGAL_REVIEW: ...}}` markers count as placeholders until `LEGAL_REVIEW_DONE=yes`, and the `{{LEGAL_REVIEW}}` value key is distinguished by the colon. Notice mode never emits body HTML at all, so placeholder text cannot leak. The same `getLegalView` feeds routes and the sitemap. The `policyVersion` hook compares against the latest PUBLISHED version via `findVersions` (not the draft value). `/privacy/v/<x>` renders that version's body with the current legal values and that version's own dates. History and old-version routes are always `noindex` and out of the sitemap. `/data-safety` exists but is `noindex`, unlinked and out of the sitemap until the owner decides (S5-U3).

## D-49 Legal import scrubs internal identifiers; bodies ship as a generated TS bundle (accepted, S5)
`pnpm import:legal` reads the three sources from the private repo, cuts at the first WHOLE-LINE `---` (table separator rows do not match), unwraps backticks around `{{KEY}}` tokens, drops the leading title (the route renders it), and removes backticked table, column, setting and bucket names from the public text. It fails if any internal marker survives (project ref, issue numbers, source paths, review-block headings). `src/seed/legal/*.md` is the reviewable source; `bodies.ts` is generated from it (`pnpm legal:bundle`) so production without a database (Neon gate) serves the same text in notice mode. `pnpm seed` creates legal pages as DRAFTS only.

## D-50 OG images render at build with embedded fonts; root-level metadata files (accepted, S5)
Satori cannot read woff2 or variable fonts, so Archivo 900 and Hanken 500 are static TTF instances embedded as base64 (`src/lib/seo/fonts-data.ts`, OFL) and the mark SVG is inlined: no file reads at build or runtime. `opengraph-image.tsx` exists for the site default, `/features/[slug]`, `/blog/[slug]` and the four persona routes; the rest inherit the site default. `robots.ts`, `sitemap.ts` and `manifest.ts` stay at `src/app/` root (two root layouts). OG and Twitter titles and descriptions derive from each route's own `title`/`description`.

## D-51 JSON-LD scope and honesty exclusions (accepted, S5)
Home carries one `@graph` (Organization, WebSite, three SoftwareApplication on iOS); `/support` carries FAQPage built from exactly the FAQs it shows (`selectFaqs`). `aggregateRating`, `review` and `offers` never appear. `installUrl` appears only for the Player app, only in state `appstore`, only with a real URL. `legalName` appears only once `COMPANY_LEGAL_NAME` is set. All enforced by `tests/unit/seo/jsonld.test.ts` and `seo.spec.ts`.

## D-52 Lighthouse set widened; `/blog` and `/changelog` stay unlinked (accepted, S5)
The gate now covers 15 routes (adds captains, coaches, privacy in notice mode, terms, legal, blog). `/blog` and `/changelog` are still empty-state, noindex and unlinked until S7 publishes content (D-41).

## D-53 v1 ships the dark theme only; the light theme is confined to /lab (accepted, S5)
The light tokens are the naive draft (accent text fails AA on light, as 02-design section 2 warns): axe in the light theme reports `color-contrast` on eyebrows and filled buttons across every route. Per the spec note ("if light is cut, drop the both-themes a11y runs"), the init script now honours a stored light choice only on `/lab`, so a visitor can never land in an unreviewed theme, and the S5 accessibility gate runs in dark (plus 320 px / 400% zoom and reduced motion). Shipping light later needs the re-derived palette from the app repo design notes and a both-themes axe run.

## D-54 Features filter chips no longer stretch the page on phones (accepted, S5 fix)
A `fieldset` defaults to `min-width: min-content`, so the scrollable chip row made `/features` 890 px wide on a 320 to 390 px viewport (page-level horizontal scroll). `min-width: 0` restores the intended in-row scroll. The new "no horizontal scroll at 320 px on every route" test guards it.

## D-55 Owner's analytics plugin is incompatible with Payload 3: custom admin view, PostHog adapter wired but inactive (accepted, S6-00)
Verified 2026-10-04 in a scratch branch (deleted, nothing merged). `@nouance/payload-dashboard-analytics` latest 0.3.0 (published 2023-05-25; repo last pushed 2023-08-28; providers Plausible and Google Analytics), peers `payload ^1.6.16` and `react ^16.8 || ^17 || ^18`. `pnpm add` succeeds with two unmet-peer warnings (payload 3.90.2, react 19.3.0), but loading the module fails at import with `ERR_PACKAGE_PATH_NOT_EXPORTED` on `payload/components/utilities` (it also imports `payload/config` and `payload/dist/admin/...`, none of which exist in Payload 3 exports). The admin boot step was therefore unreachable. Per D-ANALYTICS in USER-DECISIONS.md the plugin is not silently replaced: this entry is the record. Fallback: a custom server-component admin view at `/admin/analytics/web` behind `src/analytics/web-provider.ts` (PostHog HogQL adapter and Plausible Stats API adapter, both written). Because D-06 (provider) is unanswered the default applies: fixtures served, PostHog adapter wired, nothing live until the owner chooses and clears the account gate. The unscoped `payload-dashboard-analytics` was not installed.

## D-56 Admin analytics architecture (accepted, S6)
Three server-component views registered under `admin.components.views` (`/admin/analytics/{web,ai-spend,product}`), each wrapped in Payload's `DefaultTemplate`, each calling `requireAdmin` first. Payload serves custom views to anonymous callers (`isCustomAdminView`), so the gate is in the view: non-admins get `notFound()`. Observed behaviour: logged-out visitors see Payload's not-found/login content and logged-in editors and viewers see the not-found page, but the HTTP status is 200 because the view renders inside Payload's streamed layout (headers are already sent). No analytics content is in the response (tested). Dashboard tiles and the nav group render nothing unless the user is an admin. Throttle: more than 30 `view:*` audit rows per user in the last 60 s renders "Slow down" without querying; the audit write is best effort so a logging failure cannot take a view down. Over-pace states add a `view:ai-spend:over-pace` audit row.

## D-57 `payload-totp` evaluated and NOT adopted in S6 (accepted)
`payload-totp` 3.0.6 declares peers `payload ^3.88`, so it installs against 3.90.2. Its README says it overrides ALL collections' access (it must be the last plugin and "can break the default behavior for non-user-based access") and needs a `proxy.ts` header shim to avoid redirect loops. This site depends on anonymous reads of published content, and the owner cannot test a 2FA login flow in this session, so enabling it risks locking the owner out or breaking public reads. Left out; revisit with the owner present (needs a throwaway staging DB and a lockout recovery plan). No `ENABLE_TOTP` env name was added.

## D-58 Site tracking seam (accepted, S6)
`clientAnalytics()` (server, from env) returns null unless `WEB_ANALYTICS_PROVIDER` is `posthog` or `plausible` AND that provider's public values are set; only then `<AnalyticsLoader>` mounts. It waits for idle, honours Do Not Track, installs a bounded queue on `window.__snTrack` so early events are kept, then dynamic-imports `posthog-js` (cookieless, no person profiles, no autocapture, no session recording, history-change pageviews, web vitals on) or injects the Plausible script. Verified locally with a dummy token: no cookies and no localStorage keys; posthog-js and its asset fetches happen only after idle, never in the first-load bundle (`/` 165.4 KB gzip, budget 170). CSP `connect-src` and `script-src` gain only the configured provider's hosts at build time (PostHog also needs its `*-assets` host for web vitals). New events: `cta_view_hero`, `pricing_view`, `legal_view` (slug) via a one-shot IntersectionObserver in `TrackClicks` and a hidden `TrackView` marker; existing `data-track` clicks are unchanged. `payload-dashboard-analytics` (either package) is not involved.

## D-59 StumpNote DB access details (accepted, S6)
Fixed SQL strings only; the single interpolated value is an integer day range clamped to 1..400, so the simple query protocol is used (works through a transaction-mode pooler that rejects prepared statements). Pool: lazy, max 2, 8 s statement timeout, TLS verified (`sslmode` stripped from the URL, explicit `ssl` object, optional `STUMPNOTE_ANALYTICS_CA_CERT`). A unit test asserts every query reads only `analytics.*`, never `public`, never the internal views or tables, and contains no write keywords. Results are cached with `unstable_cache` for live mode only (web 5 min, AI 10, product 15, RevenueCat 30); fixtures are in-process JSON.

## D-60 Fixtures are generated, committed, rebased (accepted, S6)
`pnpm analytics:fixtures` regenerates `src/analytics/fixtures/*.json` from a seeded PRNG (120 days, 12 synthetic function names, invented costs, null `subjects` rows, k-suppressed cells already dropped). The loader rebases dates so the newest day is today (cohorts shift by whole weeks to stay Mondays), parses every row through the same zod schemas as live rows, and derives the budget row from the rebased rows. They contain no real numbers, ids, emails or price rates; `price-scenarios` ships empty.
