# S4 CMS pages: features, personas, pricing, security, join, support, blog, changelog + seed content

Read first: [CLAUDE.md](../../../CLAUDE.md), [STATUS.md](../../../STATUS.md), spec [03-cms-model.md](../../spec/03-cms-model.md) (all), [05-content-brief.md](../../spec/05-content-brief.md) (all), [02-design.md](../../spec/02-design.md) section 9 wireframes, [08-test-and-quality.md](../../spec/08-test-and-quality.md) sections 2, 6, 9.

## Goal
Every non-legal content route live from Payload with full field sets, Live Preview and drafts working, and the seed populated from the content brief: 22 features, 5 personas, 20 FAQs, pricing, security, join, support, blog and changelog shells.

## Prerequisites
- S2 done; S3 done or at least its block renderers (`feature-carousel`, `cta-beta`, `faq-list` are reused).
- Decision D-14 (show pricing) default unless `STATUS.md` says hide.

## Steps
- [ ] S4-01 Full field sets for `features`, `personas`, `faqs`, `posts`, `changelog-entries`, `testimonials`, `waitlist-signups`, `redirects`, `media` per [03-cms-model.md](../../spec/03-cms-model.md). Access matrix implemented (section 3). Migration + types + importmap committed.
- [ ] S4-02 Globals full fields: `site-settings`, `navigation`, `beta-access`. Revalidation hooks (`afterChange` → `revalidatePath`/`revalidateTag`).
- [ ] S4-03 Live Preview: `admin.livePreview` config, `/next/preview` route with `PREVIEW_SECRET`, `RefreshRouteOnSave` in `(site)` layout; drafts enabled with autosave on content collections.
- [ ] S4-04 Routes and templates:
  - `/features` index (filter chips by area; cards with status `Badge`; "Preview and coming soon" strip from features with those statuses).
  - `/features/[slug]` (hero, demo component by `demo` enum, bullets, how it works, labelled "Illustrative scenario", related, CTA).
  - `/players`, `/captains`, `/coaches`, `/parents` from `personas` (one template; `data-persona` set per page; parents page `leadWith=consent` shows the consent block first).
  - `/pricing` from `pages` `pricing` using the `pricing-table` block; `showPricing=false` → `notFound()`; indicative line forced in the renderer.
  - `/security` from `pages` `security` (principles + rich text + links to legal routes).
  - `/join` (state-driven from `beta-access`; waitlist form shared with S3 and hidden unless `waitlistEnabled`).
  - `/support` (FAQ accordion from `faqs`; contact line from `legal-values.SUPPORT_EMAIL` or the in-app route; link to `/account-deletion`).
  - `/blog`, `/blog/[slug]`, `/blog/rss.xml`; `/changelog` grouped by month.
  - `[slug]` fallback for other `pages`.
- [ ] S4-05 Seed JSON under `src/seed/`: `features.json` (22 blocks from brief section 4, statuses from section 1), `personas.json` (section 3), `faqs.json` (section 7), `pages/{pricing,security,join,support,legal}.json` (sections 6, 8 and wireframes), `globals/*.json` (site-settings defaults, navigation, beta-access `waitlist` + consent sentence marked for legal review). `pnpm seed` idempotent by slug; `--dry-run` prints a diff.
- [ ] S4-06 Unit test `content/claims.test.ts`: scans seed JSON for banned phrases (brief section 5) and issue-number patterns; passes.
- [ ] S4-07 Playwright: `features.spec.ts`, `pricing.spec.ts`, `nav.spec.ts`; a11y on all new routes. Update `routes.json`.
- [ ] S4-08 Lighthouse on `/features`, `/features/journal`, `/players`, `/pricing`, `/join`, `/support`; fix regressions.
- [ ] S4-09 Production seeding (only if the DB gates are cleared and the first admin exists): run `pnpm seed` once with the production unpooled URL exported for that single command; verify in `/admin`; never save the URL to a file. Otherwise note "seed pending DB" in STATUS.
- [ ] S4-10 `rm -rf node_modules .next`; update `STATUS.md` + `TASKS.md`; commit; push.

## Files created
`src/collections/*` (completed), `src/globals/*` (completed), `src/app/(site)/{features,players,captains,coaches,parents,pricing,security,join,support,blog,changelog,[slug]}/*`, `src/app/(site)/next/preview/route.ts`, `src/seed/**/*.json`, `scripts/seed.ts`, `tests/unit/content/claims.test.ts`, `tests/playwright/{features,pricing,nav}.spec.ts`, migrations.

## Acceptance criteria
- All routes in the wireframes exist, render from CMS, and fall back gracefully (404 for missing docs, never 500).
- Live Preview works for pages and features locally.
- Seed produces 22 features, 5 personas, 20 FAQs, 5 pages, globals; re-running changes nothing.
- Status badges use only the four labels; every scenario block is labelled; pricing cards carry the indicative line and no buy button.
- `claims.test.ts`, Playwright and Lighthouse green; `pnpm check` green.

## Verification
```bash
pnpm db:reset && pnpm seed --dry-run | tail -20 && pnpm seed | tail -5
pnpm test:unit && pnpm test:e2e | tail -40
pnpm test:lh | tail -30
```

## Rollback
Delete seeded documents via `pnpm seed --delete` (implement as part of S4-05) or restore the local DB; revert commits.

## Finish
Update STATUS.md + TASKS.md; commit; push.
