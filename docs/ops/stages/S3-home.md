# S3 Home page: hero + storytelling chapters

Read first: [CLAUDE.md](../../../CLAUDE.md), [STATUS.md](../../../STATUS.md), spec [02-design.md](../../spec/02-design.md) sections 1, 6, 8, 9 (Home wireframe), [05-content-brief.md](../../spec/05-content-brief.md) sections 2, 3, 5, 8, [03-cms-model.md](../../spec/03-cms-model.md) section 4 (blocks), [08-test-and-quality.md](../../spec/08-test-and-quality.md).

## Goal
The complete home page as "The innings that remembers": hero with the self-painting M and headline, the problem statement, the pinned "How it learns" stage, persona tabs with page-level re-theming, features carousel, game day, mind, body, team and privacy chapters, and the state-driven beta CTA. Content is served from the `pages` document `home` (block layout) with a code fallback so the page renders even before seeding.

## Prerequisites
- S2 done (components on `/lab`). `pnpm install`, `pnpm db:up`, `pnpm dev`.
- Copy for every chapter is taken from the content brief; no new claims.

## Steps
- [ ] S3-01 Block renderers in `src/components/blocks/` for: `hero-story`, `statement`, `chapter`, `persona-tabs`, `feature-carousel`, `cta-beta`, `principles`, `rich-text`, `testimonials` (renders nothing when empty). `RenderBlocks` switch by `blockType`.
- [ ] S3-02 `pages` collection: full `hero` group and `layout` blocks fields per [03-cms-model.md](../../spec/03-cms-model.md) 1.1 and section 4. Migration created and committed; types regenerated.
- [ ] S3-03 Home seed JSON `src/seed/pages/home.json` with the eleven sections in wireframe order; copy from the brief (hero: "Your cricket, remembered." + sub-copy; problem: "Most post-match thoughts are gone by Tuesday."; privacy chapter: the 7-line summary condensed to 3 principles with a link to `/privacy`). `pnpm seed --only=pages`.
- [ ] S3-04 `src/app/(site)/page.tsx`: fetch `pages` where `slug=home` with `unstable_cache`, render blocks; if no document or no DB, render the same sections from `src/seed/pages/home.json` directly (code fallback) so `/` never 500s.
- [ ] S3-05 Hero: `HeroStory` block renderer composes `display-1` headline (SplitText lines), `MStroke` paint on mount, `HeroRings` after idle, CTAs from `beta-access` state (fallback `waitlist`), persona chips. LCP = headline text (verify in Lighthouse).
- [ ] S3-06 "How it learns" pinned chapter: `gsap.matchMedia` with pinned scrub at `lg+` + motion, stacked cards otherwise; stage swaps `VoiceNoteTyper` → `EntryDots` + `MStroke` scrub → `PitchHeatGrid` → short action card.
- [ ] S3-07 Persona tabs: selecting sets `data-persona` on `<html>` via `PersonaProvider`; accent crossfade 300 ms; copy from brief section 3; link to each persona page (routes exist in S4; link anyway).
- [ ] S3-08 Features carousel: scroll-snap list of feature cards; data from `features` collection if seeded else a static list of 8 titles from brief section 4; keyboard arrows; icons parallax only with motion.
- [ ] S3-09 Game day, Mind (`KineticTranscript` with a 6-line script derived from brief block 9; disclosure line), Body (`SeriesChart`, caption), Team (`SquadGrid`, persona switches to team inside the chapter only), Privacy (`principles`), CTA (`cta-beta` with waitlist form (rendered only when `beta-access.waitlistEnabled` is true; otherwise the "Beta sign-up opens soon" line plus the web-app link) posting to a server action that creates `waitlist-signups` via the Local API with `overrideAccess: true` (collection `access.create` is `() => false`); honeypot; consent text from `beta-access.waitlistConsentText` or a default sentence marked for legal review in the admin description).
- [ ] S3-10 Footer wiring from `navigation` global or static fallback. `motion_toggle`, `persona_switch`, `cta_click_beta`, `beta_form_submit`, `outbound_app_link` events fire through a thin `track()` that no-ops until PostHog is configured (S6).
- [ ] S3-11 Tests: `home.spec.ts`, `layout-shift.spec.ts`; Lighthouse on `/` (`pnpm test:lh --url /`) meets budgets; `size-limit` on `/`. Fix until green.
- [ ] S3-12 Mobile pass at 320/375/768 (no pins, no horizontal scroll, headline wraps <= 4 lines at 375).
- [ ] S3-13 `rm -rf node_modules .next`; update `STATUS.md` (record Lighthouse numbers) + `TASKS.md`; commit; push.

## Files created
`src/components/blocks/*`, `src/seed/pages/home.json`, `src/app/(site)/page.tsx` (replaced), `src/app/(site)/actions/waitlist.ts`, `src/lib/track.ts`, `migrations/<ts>_pages_blocks.ts`, `tests/playwright/{home,layout-shift}.spec.ts`, `tests/lighthouse/lighthouserc.json`.

## Acceptance criteria
- `/` renders all eleven sections in order on desktop and mobile, from CMS or fallback.
- Hero headline is the LCP element; LCP < 2.0 s, CLS < 0.05 (Lighthouse mobile, local).
- Persona selection re-themes the whole page; reduced motion renders final states; no WebGL on reduced motion.
- Waitlist form stores a `waitlist-signups` row locally with the consent text; validation errors are announced.
- No copy outside the content brief; the required AI disclosure sits under the transcript; footer disclosure present.
- `pnpm check`, `pnpm test:e2e`, `pnpm test:lh` green.

## Verification
```bash
pnpm check && pnpm build | tail -20
pnpm test:e2e tests/playwright/home.spec.ts tests/playwright/layout-shift.spec.ts | tail -20
pnpm test:lh | tail -30
```

## Rollback
Revert the stage commits; `/` falls back to the S1 skeleton. Seeded `home` document can be deleted in the admin.

## Finish
Update STATUS.md + TASKS.md; commit; push.
