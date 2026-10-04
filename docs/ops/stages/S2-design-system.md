# S2 Design system + motion foundation + `/lab`

Read first: [CLAUDE.md](../../../CLAUDE.md), [STATUS.md](../../../STATUS.md), spec [02-design.md](../../spec/02-design.md) (all sections), [08-test-and-quality.md](../../spec/08-test-and-quality.md) sections 2 and 4.

## Goal
Tokens, typography, layout shell (nav, footer, ambient rings, persona provider, theme), the motion foundation (GSAP + ScrollTrigger + SplitText, Lenis on fine pointers, reduced-motion handling), and every signature component built as an isolated React component with a static fallback, all demonstrated on the `/lab` route and covered by visual tests. No marketing copy yet beyond what the shell needs.

## Prerequisites
- S1 done (`pnpm install`, `pnpm db:up`, `pnpm dev` works).
- Fonts: download Archivo and Hanken Grotesk variable fonts from Google Fonts, subset to Latin woff2 (`pnpm dlx glyphhanger` or `pyftsubset`), place in `public/fonts/` with the OFL licence file. Verify the licence text is present before committing.
- Brand mark: `git -C /Users/nilesh93/Projects/personal/stumpnote show origin/main:assets/images/stumpnote_mark.svg > public/brand/stumpnote-mark.svg`. Also read `docs/design/set-a/m-loader.md` from the private repo (read-only) for the centreline path data used by the paint mask; copy only the path geometry, not the document.

## Steps
- [ ] S2-01 Tokens finalised in `src/styles/tokens.css` (persona and light-mode overrides); Tailwind 4 `@theme` aliases; ESLint rule banning hex colours outside `tokens.css`. Compute and record the contrast table in `02-design.md` section 2 (replace "about" values with measured ones).
- [ ] S2-02 Fonts via `next/font/local` (`src/lib/fonts.ts`), `adjustFontFallback`, CSS variables `--font-display`/`--font-body`. Type scale utilities in `globals.css` (`.display-1` … `.overline`).
- [ ] S2-03 `src/components/ui/`: `Button` (3 variants, 44px), `TextLink`, `Overline`, `Badge` (4 status labels only), `Card`, `Field`, `Checkbox`, `Notice`. All token-driven, keyboard accessible, with focus ring.
- [ ] S2-04 `src/components/site/`: `SkipLink`, `Nav` (desktop + mobile sheet, focus trap, Escape closes), `Footer` (columns from the `navigation` global or static fallback; disclosure line; "Motion: on/off" toggle; EULA link; © line from site-settings or "© 2026 StumpNote"), `AmbientRings` (fixed SVG, 90 s rotation, paused on reduced motion), `PersonaProvider` (`data-persona`, context + `usePersona()`), `ThemeToggle` (dark default, `localStorage`), `Section`, `Chapter` (stage + copy pair; pinned variant only at `lg+` and no reduced motion).
- [ ] S2-05 Motion foundation `src/lib/motion/`: `gsap.ts` (register ScrollTrigger + SplitText once), `useReducedMotion()` (media query + footer toggle), `lenis.ts` (init only when `(pointer: fine)` and not reduced; `lenis.on('scroll', ScrollTrigger.update)`; destroy on unmount), `matchMedia` helper wrapping `gsap.matchMedia()` with the two standard conditions, `idle.ts` (`requestIdleCallback` with timeout fallback). All motion code loaded via `next/dynamic` with `ssr: false`.
- [ ] S2-06 Signature components in `src/components/signature/`, each with props `{ reducedMotion?, persona?, seed? }` and a static render path:
  - `MStroke` (paint on mount, scrub mode via a `progress` prop, loop mode, `AiMark` static export) per 02-design 7A.
  - `BailsLoader` (NEW asset SVG) per 7B.
  - `PitchHeatGrid` per 7C (3x3, DOM text values, focusable cells, caption).
  - `KineticTranscript` per 7D (script as prop, play/pause, disclosure line).
  - `SeriesChart` per 7E (SVG, deterministic generated data, hidden table, caption "Wrist speed proxy. Preview.").
  - `HeroRings` per 7F (OGL shader, capability gates, fallback to `AmbientRings`).
  - `EntryDots`, `QuickLogStrip`, `VoiceNoteTyper`, `SquadGrid` (simple, used by home chapters).
- [ ] S2-07 `/lab` page (noindex): grid of every ui/site/signature component, controls for persona, theme, motion on/off, seed; each component in its final state and (where applicable) a "replay" button. Server component wrapper, client islands.
- [ ] S2-08 Tests: `tests/playwright/visual.spec.ts` (snapshots of `/lab` states, chromium-desktop), `motion.spec.ts` (reduced-motion assertions), `a11y.spec.ts` on `/lab` and `/`. Record snapshots. `pnpm check` green.
- [ ] S2-09 Verify Lenis does not break: anchors (`#section`), find-in-page, keyboard PageDown, touch emulation (Lenis absent). Record in the brief as checked.
- [ ] S2-10 Bundle check: `next build` output; GSAP/Lenis/OGL only in async chunks; note first-load JS for `/lab` and `/` in `STATUS.md`.
- [ ] S2-11 `rm -rf node_modules .next`; update `STATUS.md` + `TASKS.md`; commit; push.

## Files created
`public/fonts/*`, `public/brand/stumpnote-mark.svg`, `public/brand/bails.svg`, `src/lib/fonts.ts`, `src/lib/motion/*`, `src/components/ui/*`, `src/components/site/*`, `src/components/signature/*`, `src/app/(site)/lab/page.tsx`, `tests/playwright/{visual,motion,a11y}.spec.ts`, snapshots under `tests/playwright/__snapshots__/`.

## Acceptance criteria
- Every component in [02-design.md](../../spec/02-design.md) section 5 (ui, site, signature groups) exists and renders on `/lab` in dark and light, all four personas, motion on and off.
- Reduced motion: no pinned sections, no WebGL canvas, transcript fully visible, charts fully drawn (asserted by `motion.spec.ts`).
- axe: zero serious/critical on `/lab` and `/`.
- Contrast table recorded; no hex colours outside `tokens.css` (lint passes).
- Visual snapshots committed; `pnpm test:e2e` green.

## Verification
```bash
pnpm check && pnpm build | tail -30
pnpm test:e2e --project=chromium-desktop --project=reduced-motion | tail -30
grep -rnE '#[0-9a-fA-F]{6}' src --include=*.tsx --include=*.ts | grep -v tokens.css   # expect none
```

## Rollback
Components are additive; revert the stage's commits if `/` regresses. Snapshots can be regenerated with `--update-snapshots` after a reviewed visual change.

## Finish
Update STATUS.md + TASKS.md; commit; push.
