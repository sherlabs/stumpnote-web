# S5 Legal pages (notice mode) + SEO/OG/sitemap/JSON-LD + accessibility and performance pass

Read first: [CLAUDE.md](../../../CLAUDE.md), [STATUS.md](../../../STATUS.md), spec [06-legal-pages.md](../../spec/06-legal-pages.md) (all), [03-cms-model.md](../../spec/03-cms-model.md) 1.8 and globals, [05-content-brief.md](../../spec/05-content-brief.md) section 10, [02-design.md](../../spec/02-design.md) sections 10, 11, [08-test-and-quality.md](../../spec/08-test-and-quality.md).

## Goal
Legal routes live with the placeholder + review-marker + notice-mode mechanism and versioning; site-wide SEO (metadata, canonical, sitemap from CMS, robots, OG images, JSON-LD); a full accessibility and performance pass on every public route against the budgets.

## Prerequisites
- S3 and S4 done. Legal values are expected to be empty (notice mode is the shipped state).
- Private repo sources (read-only): `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/SUPPORT.md`, `docs/legal/legal_config.json`, `scripts/legal/render.sh` (for behaviour reference only).

## Steps
- [x] S5-00 Legal values proposal (owner decision D-LEGAL): fetch `https://www.sherlabs.com/privacy` and any linked terms/contact pages (WebFetch or Chrome; read-only). Extract only facts stated there for `COMPANY_LEGAL_NAME`, `COMPANY_ABN`, `COMPANY_ADDRESS`, `PRIVACY_CONTACT_EMAIL`, `SUPPORT_EMAIL`, `GOVERNING_LAW`. Write them into `STATUS.md` "Decisions needed" as "Proposed legal values (source: <url>)" for approval. Do NOT enter them into the `legal-values` global or publish until the owner approves. Leave all other keys empty.
- [x] S5-01 `legal-pages` full fields, versions (`drafts: true, maxPerDoc: 50`, autosave off), hooks: `beforeValidate` strict gate (`LEGAL_STRICT=1` blocks publish with placeholders), `beforeChange` `policyVersion` rule for privacy/terms. `legal-values` global with the 16 keys and descriptions. Migration + types.
- [x] S5-02 `src/lib/legal/render.ts`: substitution, review markers, notice-mode detection, markdown → HTML (remark-gfm, no raw HTML), HTML escaping. Unit tests per [08-test-and-quality.md](../../spec/08-test-and-quality.md) section 6.
- [x] S5-03 Importer `scripts/import-legal.ts`: reads the three markdown sources from the private repo via `git show origin/main:<path>`, strips the review block above the first `---` of the privacy file, writes `src/seed/legal/{privacy,terms,support}.md` and seeds `legal-pages` drafts. Draft `cookies.md`, `account-deletion.md`, `data-safety.md` per [06-legal-pages.md](../../spec/06-legal-pages.md) section 1 with `{{LEGAL_REVIEW: ...}}` markers on any new wording. Commit the seed markdown (it is already public-facing text with placeholders; confirm no review-block content leaked: `grep -c LEGAL_REVIEW` is acceptable, internal checklist text is not).
- [x] S5-04 Routes: `/privacy`, `/terms`, `/support` (support stays the S4 page but gets the legal body section), `/cookies`, `/account-deletion`, `/data-safety`, `/legal`, `/privacy/history`, `/privacy/v/[policyVersion]`, `/terms/history`, `/terms/v/[policyVersion]`. Notice mode sets `robots: noindex`. Print stylesheet `src/styles/print.css`.
- [x] S5-05 Footer legal items + Apple EULA link; `/legal` index via `legal-index` block.
- [x] S5-06 SEO: `generateMetadata` on every route (title template "… | StumpNote", description from CMS `meta`, canonical from `NEXT_PUBLIC_SERVER_URL`), `sitemap.ts` from published pages/features/personas/posts/legal (excluding notice-mode legal pages, `/lab`, `/admin`, `/api`), `robots.ts`, `opengraph-image.tsx` per route type generated at build (brand mark + title on canvas), favicons and `manifest.webmanifest`.
- [x] S5-07 JSON-LD `src/lib/seo/jsonld.ts`: `Organization` (name "StumpNote", url, logo; no legal entity until `COMPANY_LEGAL_NAME` set), `SoftwareApplication` ×3 (Player, Coach, Parent; `operatingSystem: iOS`; no `aggregateRating`, `offers`, `installUrl` until `beta-access.state === 'appstore'`), `FAQPage` on `/support` only. Unit test enforces the exclusions.
- [x] S5-08 Accessibility pass: `a11y.spec.ts` on all routes in both themes; manual keyboard + VoiceOver pass on Home, Join, Pricing, a feature page, `/privacy`; zoom 200%/400%; fix every serious/critical and all keyboard issues.
- [x] S5-09 Performance pass: full Lighthouse set per [08-test-and-quality.md](../../spec/08-test-and-quality.md) section 3; `size-limit`; confirm async chunks; fix regressions; record the summary table in `STATUS.md`.
- [x] S5-10 Link checker `pnpm test:links` green. `legal.spec.ts`, `seo.spec.ts` green.
- [x] S5-11 Content QA checklist ([08-test-and-quality.md](../../spec/08-test-and-quality.md) section 9) walked and ticked in this brief.
- [x] S5-12 `rm -rf node_modules .next`; update `STATUS.md` (legal values still needed; Lighthouse table) + `TASKS.md`; commit; push.

## Files created
`src/lib/legal/render.ts`, `scripts/import-legal.ts`, `src/seed/legal/*.md`, `src/app/(site)/{privacy,terms,cookies,account-deletion,data-safety,legal}/**`, `src/styles/print.css`, `src/lib/seo/{jsonld,metadata}.ts`, `src/app/(site)/{sitemap,robots}.ts` (completed), `src/app/(site)/opengraph-image.tsx`, `public/favicons/*`, `tests/unit/legal/*.test.ts`, `tests/unit/seo/*.test.ts`, `tests/playwright/{legal,seo}.spec.ts`, `scripts/check-links.mjs`.

## Acceptance criteria
- All legal routes render notice mode (noindex) with empty values and the full page with a complete local fixture; no `{{` in any rendered DOM.
- `LEGAL_STRICT=1` blocks publishing a page with placeholders (unit test).
- Version history and `/privacy/v/<x>` work.
- Sitemap excludes notice-mode legal pages, `/lab`, `/admin`, `/api`; robots disallows them; JSON-LD validates and has no rating/offer keys.
- Every public route: Lighthouse >= 95 ×4, LCP < 2.0 s, CLS < 0.05; axe zero serious/critical; link checker clean.
- Content QA checklist fully ticked.

## Verification
```bash
pnpm test:unit && pnpm test:e2e | tail -40
pnpm test:lh | tail -40 && pnpm test:links | tail -10
grep -rn '{{' .next/server/app --include=*.html | head   # expect none for rendered legal pages in notice mode
```

## Rollback
Legal routes fall back to notice mode by design; revert commits for SEO regressions. Seeded legal drafts can be deleted in the admin (admin role).

## Finish
Update STATUS.md + TASKS.md; commit; push.


## Content QA walk (S5-11, 2026-10-04, against production at 49d11b3 and the local build)
- [x] Every status badge uses one of the four allowed labels (`features.spec`).
- [x] No banned phrase (`claims.test.ts`, 41 tests, plus the legal drafts read through).
- [x] No App Store badge; CTAs read "Join the beta" / "Coming soon" (`smoke`, `nav` join test).
- [x] No user counts, ratings, press logos, testimonials; JSON-LD has no rating/review/offer keys (`jsonld.test.ts`, `seo.spec.ts`).
- [x] Screenshots labelled "Sample data" (feature pages).
- [x] Fictional personas only in "Illustrative scenario" blocks (S4, unchanged).
- [x] AI disclosure on AI surfaces and in the footer (`nav.spec`).
- [x] Pricing carries the indicative line, no buy control (`pricing.spec`).
- [x] Legal pages are in honest notice mode; no `{{` in any rendered HTML or text (`legal.spec`, build output grep: 0).
- [x] Contact shows only configured mailboxes or the in-app route (`legal.spec`, `features.spec`).
- [x] No private-repo issue numbers, branch names, model price tables in the repo tree (grep clean). Exception recorded in STATUS: commit 96c69a1 contains a project-ref string and an issue number inside importer test fixtures (removed in the next commit; still in git history).
- [x] Copy fits 3 lines at 1440 and 390 on the legal pages (screens `docs/ops/screens/s5-*`).
