# 03 CMS model: Payload collections, globals, blocks, access, seed plan

Index: [README.md](./README.md). Architecture: [01-architecture.md](./01-architecture.md). Copy for seeds: [05-content-brief.md](./05-content-brief.md). Legal specifics: [06-legal-pages.md](./06-legal-pages.md). Executed: skeleton in S1, full fields + seed in S4, legal in S5, analytics globals in S6.

Conventions: every public-facing collection has `versions: { drafts: true }`, a `slug` field (unique, auto from title, editable), SEO fields from `@payloadcms/plugin-seo` (`meta.title`, `meta.description`, `meta.image`), `publishedAt`, and Live Preview. Read access for anonymous is `publishedOnly`. Write access per role in [01-architecture.md](./01-architecture.md) section 8.1. Field names are camelCase; select values are kebab-case. Rich text uses Lexical with headings h2 to h4, lists, links, blockquote and the inline `AiMark` feature.

## 1. Collections

### 1.1 `pages` (CMS pages with layout blocks)
| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, unique | `home` reserved for `/` |
| `hero` | group | `type` select [`none`, `standard`, `persona`, `legal`], `overline`, `headline` (textarea, max 3 lines), `subcopy`, `primaryCta` (link group), `secondaryCta`, `persona` select |
| `layout` | blocks | see section 4 |
| `persona` | select [player, coach, parent, team, none] | sets `data-persona` for the page |
| `showInNav` | checkbox | |
| `meta` | SEO plugin group | |
| `noindex` | checkbox | forced true while a legal page is in notice mode |
Admin: `useAsTitle: title`, `defaultColumns: [title, slug, _status, updatedAt]`, Live Preview URL `${SERVER_URL}/${slug}?preview`.

### 1.2 `features`
| Field | Type | Notes |
|---|---|---|
| `title` | text | e.g. "Voice journal" |
| `slug` | text | `journal`, `ai-read`, `memory`, `ask-coach`, `daily-brief`, `goals`, `confidence-bank`, `insights`, `mindset`, `playbooks`, `training`, `clips`, `season-story`, `conditions`, `gameday`, `squad`, `game-plan`, `live-mode`, `team-insights`, `coach-app`, `parent-app`, `web-app` |
| `area` | select [journal-memory, mental-game, game-day, team, coach, parent, platform] | index grouping |
| `status` | select [available-web, in-beta, preview, coming-soon] | public vocabulary only |
| `benefit` | text | one line |
| `bullets` | array of `text` (max 4) | |
| `howItWorks` | textarea | |
| `scenario` | group `{ persona (text, fictional), text }` | rendered under "Illustrative scenario" |
| `copyRules` | textarea, admin-only description | internal reminder, not rendered |
| `demo` | select [none, voice-typer, quick-log, heat-grid, kinetic-transcript, series-chart, squad-grid, m-stroke] | which signature component renders on the page |
| `media` | upload (Media) | synthetic screenshots only |
| `personas` | select hasMany [player, captain, member, coach, parent] | |
| `related` | relationship features hasMany | |
| `order` | number | index sort |
| `comingSoonTeaser` | text | allowed teaser line for coming-soon parts |
| `meta` | SEO | |

### 1.3 `personas`
`title` (Player, Captain / vice, Team member, Coach, Parent / guardian), `slug` (`players`, `captains`, `members`, `coaches`, `parents`), `accent` select, `headline`, `proofPoints` array (max 6), `featureBlocks` relationship features (max 4), `faqs` relationship faqs, `leadWith` select [default, consent] (parents lead with consent), `meta`.

### 1.4 `posts` (blog)
`title`, `slug`, `excerpt`, `coverImage`, `content` (rich text), `author` relationship users (display name only; never email), `publishedAt`, `tags` array, `meta`. RSS at `/blog/rss.xml`.

### 1.5 `changelog-entries`
`title`, `date`, `app` select hasMany [player, coach, parent, web, site], `summary` rich text, `kind` select [new, improved, fixed], `publicStatus` select [in-beta, available-web]. Rendered grouped by month. Never reference internal issue numbers.

### 1.6 `faqs`
`question`, `answer` (rich text), `category` select [general, availability, privacy, pricing, team, coach, parent, support], `personas` hasMany, `order`. Rendered on `/support`, persona pages, pricing. Also emitted as FAQ JSON-LD on `/support` only.

### 1.7 `testimonials` (ships empty)
`quote`, `attribution`, `role`, `consentGiven` (checkbox, required true), `permissionDate` (date, required), `materialConnection` (text, disclosure), `approved` (checkbox, admin-only). The homepage slot renders only when at least one `approved && consentGiven` published record exists. No placeholder content, ever. Juniors require guardian consent noted in `materialConnection`.

### 1.8 `legal-pages` (versioned)
Full spec in [06-legal-pages.md](./06-legal-pages.md). Summary: `slug` (privacy, terms, support, cookies, account-deletion, data-safety), `title`, `body` (textarea markdown, stored verbatim with `{{KEY}}` placeholders), `effectiveDate`, `lastUpdated`, `policyVersion`, `reviewStatus` select [draft, lawyer-reviewed], `notes` (internal). `versions: { drafts: true, maxPerDoc: 50 }`, autosave off. `beforeValidate` hook rejects publish when `LEGAL_STRICT=1` and placeholders remain; `beforeChange` on publish requires `policyVersion` non-empty and different from the previous published version for `privacy` and `terms`. Delete = admin only. Prior published versions are readable at `/privacy/v/[policyVersion]`.

### 1.9 `media`
Upload collection to Vercel Blob (D-05). Fields: `alt` (required), `caption`, `isSynthetic` (checkbox, default true, description "Screenshots must use the fictional demo data only"). `imageSizes`: thumb 400, card 800, hero 1600 (WebP). `mimeTypes` images + mp4; 10 MB cap.

### 1.10 `users`
Auth collection. `name`, `email`, `roles` select hasMany [admin, editor, viewer] (default viewer; field access update = isAdmin). Auth options in [01-architecture.md](./01-architecture.md) section 8.1. `create` = isAdmin (closes self-registration after the first user). Optional TOTP plugin in S6.

### 1.11 `waitlist-signups`
`email` (required, unique, lowercase), `persona` select [player, captain, coach, parent, other], `consent` checkbox (required true), `consentText` (text, the exact consent line shown, stored for the record), `source` (text: page path), `ip` (hashed, text), `createdAt`. Access: create = public (server action only; REST create disabled via `access.create` checking a server-side header secret), read/update/delete = admin. Export via admin CSV. No emails are sent (no mailing provider wired).

### 1.12 `redirects`
From `@payloadcms/plugin-redirects`. Used for legacy slugs. 308 by default.

### 1.13 `audit-log`
`user` relationship, `action` text, `panel` text, `range` text, `ip` text, `userAgent` text. Create = system (hooks), read = admin, update/delete = nobody. Pruned manually.

### 1.14 `search` (plugin-generated)
From `@payloadcms/plugin-search` over features, posts, faqs. Powers a small `/search?q=` route (optional, S4 stretch).

## 2. Globals

| Global | Fields | Access |
|---|---|---|
| `site-settings` | `siteName`, `tagline`, `defaultMeta` (SEO group), `ogImage` upload, `socialLinks` array, `webAppUrl` (default `https://app.stumpnote.com`), `showPricing` (checkbox, default true; D-14), `showTrialLine` (checkbox), `footerDisclosure` (text, default "AI-generated insights are guidance for reflection and training."), `copyrightLine` (text, default "© 2026 StumpNote"; no entity until confirmed), `motionDefault` select [auto, reduced] | admin |
| `navigation` | `header.items` array `{ label, link (page/feature/custom), children }` (max 6 top-level), `header.cta` link, `footer.columns` array `{ heading, items[] }`, `footer.legalItems` array (auto-includes Apple EULA link) | editor |
| `beta-access` | `state` select [waitlist, testflight, appstore] (D-15), `testflightUrl`, `appStoreUrl` (per app: player/coach/parent), `waitlistConsentText` (text, required; the exact consent sentence), `waitlistSuccessMessage`, `comingSoonLine` (default "iPhone apps are in TestFlight beta and coming to the App Store.") | admin |
| `legal-values` | the 16 keys from [06-legal-pages.md](./06-legal-pages.md) section 4, each `text` with description from the legal config notes; `LEGAL_REVIEW_DONE` as select [`""`, `yes`] | admin |
| `analytics-settings` | `provider` select [none, posthog], `publicKeyPresent` (read-only computed), `defaultRange` select [7d, 30d, 90d], `kMinDisplay` (number, read-only, mirrors DB) , `fixturesBanner` (checkbox) | admin |
| `price-scenarios` | array `{ label, inputPerMillionUsd, outputPerMillionUsd, cachedPerMillionUsd, audioInputPerMillionUsd, ttsPerMillionCharsUsd, appliesToModelPattern }` for the AI-spend "what if" view (section 5 of [04-analytics-and-admin.md](./04-analytics-and-admin.md)). Ships EMPTY; never seeded with real rates in the public repo | admin |
| `header` / `footer` | template globals; replaced by `navigation` above (remove or alias) | editor |

## 3. Access matrix

| Collection / global | anon read | viewer | editor | admin |
|---|---|---|---|---|
| pages, features, personas, posts, changelog, faqs | published only | read all | CRUD (no delete published legal) | all |
| testimonials | published + approved | read | CRU (cannot set `approved`) | all |
| legal-pages | published only (+ notice mode) | read | CRU, publish blocked by strict gate | all incl. delete |
| media | yes | read | CRUD | all |
| users | no | self | self | all |
| waitlist-signups | no | no | no | read, export, delete |
| redirects, search | n/a | read | CRUD | all |
| audit-log | no | no | no | read |
| site-settings, beta-access, legal-values, analytics-settings, price-scenarios | public read of non-secret fields via server components only | read | read | update |
| navigation | server read | read | update | update |
| analytics admin views | 404 | 404 | 404 | render |

## 4. Layout blocks (for `pages.layout`)

Each block has a React renderer in `src/components/blocks/` and a `blockName`.

| Block | Fields | Renders |
|---|---|---|
| `hero-story` | `headline`, `subcopy`, `ctas`, `showMStroke` | Home hero (section 8 of 02-design) |
| `statement` | `text` (max 140 chars), `fragments` array of short strings | Problem chapter |
| `chapter` | `overline`, `title`, `body`, `demo` select (same enum as features.demo), `persona` select, `pin` checkbox | Storytelling chapter with stage |
| `persona-tabs` | relationship personas hasMany | Who it's for tabs |
| `feature-carousel` | `heading`, relationship features hasMany, `filterByArea` select | Scroll-snap cards |
| `pricing-table` | `heading`, `plans` array `{ name, priceLabel, period, bullets[], highlight }`, `addons` array, `comparison` array `{ row, values[] }`, `footnote` | Pricing (values seeded from the brief; indicative label forced) |
| `faq-list` | `heading`, relationship faqs hasMany or `category` | Accordion |
| `cta-beta` | `heading`, `subcopy` | State-driven beta CTA |
| `rich-text` | `content` | Prose, measure-limited |
| `principles` | `heading`, `items` array `{ title, text, icon (Lucide name) }` (3 to 4) | Privacy chapter |
| `media-block` | `media`, `caption`, `syntheticLabel` (forced true) | Screenshot with "Sample data" badge |
| `two-column` | `left` rich text, `right` rich text or media | Generic |
| `testimonials` | none (reads approved records) | Renders nothing when empty |
| `legal-index` | none | List of legal pages + EULA link |

## 5. Live Preview, drafts, revalidation

- `admin.livePreview`: `url: ({ data, collectionConfig }) => \`${SERVER_URL}/next/preview?slug=…&collection=…&secret=PREVIEW_SECRET\``, `breakpoints: [mobile 375, tablet 768, desktop 1440]`. Frontend uses `RefreshRouteOnSave`.
- Drafts on all public collections; autosave on for pages/features/posts (interval 800 ms), off for legal-pages.
- `afterChange` hooks call `revalidatePath` for the document's route and `revalidateTag('nav')` for globals.
- No `schedulePublish` (D-09).

## 6. Seed plan (`pnpm seed`, idempotent by slug)

All seed content is synthetic or taken from [05-content-brief.md](./05-content-brief.md). Never seed real people, emails, or price scenarios.

| Order | Target | Source |
|---|---|---|
| 1 | `users` | none (first admin is created by the user in the browser); seed refuses to run if 0 users exist in production |
| 2 | `media` | brand SVG + up to 6 synthetic screenshots from `src/seed/media/` (only if present and marked synthetic) |
| 3 | `features` (22) | brief section A3, one record each with `status` from the vocabulary table |
| 4 | `personas` (5) | brief section A2 |
| 5 | `faqs` (20) | brief section A6 |
| 6 | `pages`: home, features (index is code), pricing, security, join, support, legal (index) | wireframes in 02-design + brief A5/A7 |
| 7 | `legal-pages` (privacy, terms, support bodies from the app repo markdown; cookies, account-deletion, data-safety drafted per 06-legal-pages) | imported verbatim with placeholders; `reviewStatus: draft` |
| 8 | globals: site-settings, navigation, beta-access (`waitlist`), legal-values (all empty except `DELETE_ACCOUNT_PATH`), analytics-settings (`none`/fixtures), price-scenarios (empty) | |
| 9 | `changelog-entries` | 1 entry: "Website launched" (S7) |
| 10 | `testimonials`, `posts` | none |

Seed script location `scripts/seed.ts`, content JSON under `src/seed/`. `pnpm seed --dry-run` prints the diff. Seeding production is a manual admin step in S4/S5, run from a local shell with the production `DATABASE_URI_UNPOOLED` exported for that command only (never saved).
