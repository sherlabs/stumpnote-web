# 02 Design: concept, tokens, motion, signature interactions, wireframes

Index: [README.md](./README.md). Copy comes from [05-content-brief.md](./05-content-brief.md); CMS blocks from [03-cms-model.md](./03-cms-model.md). Executed in S2 (system + `/lab`), S3 (home), S4 (pages), S5 (a11y/perf pass).

Brand source: the app's "Set A" design system (private repo `docs/design/set-a/*`, read-only). Everything below is derived from it; where the site invents something new (the bails flourish, the hero shader) it is labelled NEW.

## 1. Creative concept: "The innings that remembers"

Thesis: StumpNote is a player's memory that keeps learning. The home page is one continuous innings. Scroll time is match time; the memory builds as you scroll.

**Spine.** A sticky stage (about 100vh) sits behind the chapters. It starts as the dark canvas with the hairline ambient rings. The StumpNote "M" brush stroke paints itself, scrubbed by scroll, along the exact centreline documented for the app's loader. The painted M then anchors each chapter: real components drop into the stage, each built from the app's own visual language.

**Chapters** (each a live component, never a video):
1. Capture: a voice note types itself out, then a quick-log tap strip.
2. Memory: the M fills; entries land as dots around it; rings pulse outward.
3. Insight: the pitch-map heat grid resolves out of those dots.
4. Mind: the kinetic transcript speaks (text only, no audio).
5. Body: the watch series charts draw on.
6. Team: persona accent swaps to team lime; a squad grid staggers in.
7. Privacy: motion drops away on purpose; three calm principles.

**Signature UI move: persona re-theming.** One CSS custom property (`--accent`) swaps at page level: player teal, coach orange, parent rose, team lime. The M, rings, focus rings and CTA all follow. It is one token, cheap, and unmistakably ours.

**What the award jury must notice in 10 seconds:** the M painting itself in the hero; the two-colour restraint; type that is huge but still reads; nothing that fights the scrollbar.

**What it must never do:** scroll-jack on touch, hide content behind motion, lose the headline as LCP, use colour as the only status signal, ship lorem or stock photos.

## 2. Design tokens (`src/styles/tokens.css`)

All colours and type come from here. No hard-coded hex in components (lint rule: `no-restricted-syntax` on `#[0-9a-f]{3,8}` outside `tokens.css`).

```css
:root {
  /* canvas and text (Set A dark) */
  --canvas: #0B1114;
  --surface: #141920;            /* raised */
  --text: #F2F5F4;
  --text-body: #C9D0D6;
  --muted: #96A1AB;
  --tertiary: #7C8894;
  --hairline-1: rgb(255 255 255 / 0.06);
  --hairline-2: rgb(255 255 255 / 0.08);
  --hairline-3: rgb(255 255 255 / 0.12);
  --error: #FF8A80;

  /* persona accents */
  --accent-player: #00B9AE;
  --accent-coach: #FD9423;
  --accent-parent: #CC5572;
  --accent-parent-text: #E07A93; /* small text on dark */
  --accent-team: #89C012;
  --accent: var(--accent-player);           /* swapped by [data-persona] */
  --accent-ink: color-mix(in oklab, var(--accent) 70%, black);
  --accent-soft: color-mix(in oklab, var(--accent) 16%, transparent);

  /* type */
  --font-display: "Archivo", system-ui, sans-serif;
  --font-body: "Hanken Grotesk", system-ui, sans-serif;

  /* spacing (4px base) */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px;
  --s-7: 48px; --s-8: 64px; --s-9: 96px; --s-10: 128px; --s-11: 192px;

  /* radii, motion */
  --r-1: 8px; --r-2: 12px; --r-3: 20px; --r-pill: 999px;
  --ease-out: cubic-bezier(.16,1,.3,1);
  --ease-in-out: cubic-bezier(.65,0,.35,1);
  --dur-1: 160ms; --dur-2: 300ms; --dur-3: 600ms; --dur-4: 1200ms;

  /* layout */
  --gutter: clamp(16px, 4vw, 48px);
  --content-max: 1280px;
  --measure: 64ch;
}
[data-persona="coach"]  { --accent: var(--accent-coach); }
[data-persona="parent"] { --accent: var(--accent-parent); }
[data-persona="team"]   { --accent: var(--accent-team); }
[data-theme="light"] { --canvas:#F7F8F7; --surface:#FFFFFF; --text:#0B1114; --text-body:#2B343B; --muted:#5B6770; --tertiary:#7C8894;
  --hairline-1: rgb(0 0 0 / 0.06); --hairline-2: rgb(0 0 0 / 0.08); --hairline-3: rgb(0 0 0 / 0.12); }
```

Contrast notes (compute and record in S2): `--muted` #96A1AB on #0B1114 is about 7.4:1 (fine for body); `--tertiary` #7C8894 is about 5:1 (fine for 11px overlines at 600 weight, still AA); teal #00B9AE on canvas is about 8:1 as text; parent rose #CC5572 on canvas is about 4.3:1, so small parent text uses `--accent-parent-text` #E07A93. Accent-filled buttons use `--canvas` as label colour (dark on accent).

Design grammar from Set A, enforced in review: one focal headline or numeral at 56px+ per screen; one filled accent element per screen; navigation, tabs and selected states are neutral, never accent; status is neutral + words/glyphs, never traffic-light colour alone.

## 3. Typography scale

Fonts self-hosted via `next/font/local` from `public/fonts/` as woff2 subsets (Latin) of **Archivo** (variable, weight axis used at 900 for display) and **Hanken Grotesk** (variable, 400 to 700). Both are published under the SIL Open Font License on Google Fonts; copy the licence file next to the fonts and verify it on import. `font-display: swap` with `adjustFontFallback` so there is no layout shift.

| Token | Font | Size (fluid) | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `display-1` | Archivo 900 | `clamp(56px, 9vw, 160px)` | 0.86 | -0.05em | Hero headline, one per page |
| `display-2` | Archivo 900 | `clamp(40px, 6vw, 96px)` | 0.9 | -0.04em | Chapter titles |
| `display-3` | Archivo 900 | `clamp(32px, 4vw, 56px)` | 0.95 | -0.035em | Section titles, pricing numerals |
| `title` | Hanken 700 | `clamp(22px, 2vw, 28px)` | 1.2 | -0.01em | Card titles |
| `body-lg` | Hanken 400 | `clamp(18px, 1.4vw, 22px)` | 1.5 | 0 | Lead paragraphs |
| `body` | Hanken 400 | 17px | 1.6 | 0 | Body |
| `body-sm` | Hanken 400 | 15px | 1.5 | 0 | Captions, legal |
| `overline` | Hanken 600 | 11px | 1 | +0.18em, uppercase | Labels, status |
| `mono-num` | Hanken 500, `font-variant-numeric: tabular-nums` | inherits | | | Chart values |

Max measure for prose: `--measure` (64ch). Display lines never wrap more than 3 lines on desktop; copy is written to that constraint.

## 4. Grid and layout

- 12-column fluid grid inside `--content-max`, gutter `--gutter`. Columns via CSS grid (`grid-template-columns: repeat(12, minmax(0,1fr))`), no grid framework.
- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`. Pinned scroll chapters exist only at `lg+`; below that each chapter is a stacked card.
- Section rhythm: `--s-10` between chapters on desktop, `--s-8` on mobile. Hero is `100svh` min.
- Ultra-wide (> 1920): content stays at `--content-max`; the stage and rings extend full-bleed.
- Minimum supported width 320px; no horizontal scroll at any width (Playwright asserts `scrollWidth <= clientWidth`).

## 5. Components inventory

| Group | Component | Notes |
|---|---|---|
| ui | `Button` (primary accent-filled, secondary hairline, ghost), `TextLink` (underline on hover, focus ring), `Overline`, `Badge` (status: "Available now (web)", "In the beta", "Preview", "Coming soon"), `Card`, `Field` + `Checkbox`, `Notice` (legal notice mode) | 44px min height for primary controls |
| site | `Nav` (logo, 5 links, CTA; mobile sheet), `Footer` (links, legal, EULA link, "AI-generated insights are guidance" line, © line), `AmbientRings` (fixed SVG layer in root layout), `PersonaProvider` (sets `data-persona`), `Section`, `Chapter` (stage + copy pair), `SkipLink`, `ThemeToggle` (dark default) | Nav is neutral; CTA is the one filled accent |
| signature | `MStroke`, `BailsLoader` (NEW), `PitchHeatGrid`, `KineticTranscript`, `SeriesChart`, `HeroRings` (WebGL, NEW), `EntryDots`, `QuickLogStrip`, `VoiceNoteTyper`, `SquadGrid` | Each has a static fallback and a `/lab` demo |
| blocks | one renderer per CMS block (section 4 of 03-cms-model.md) | |
| admin | `StatTile`, `TimeSeries`, `BarList`, `HeatTable`, `RangePicker`, `SampleDataBanner` | Recharts 3, styled with Payload `--theme-*` vars + persona accents as categorical colours |

## 6. Motion spec

Stack (D-12): GSAP 3.15 core + ScrollTrigger + SplitText; Lenis 1.3 for smooth scroll on `(pointer: fine)` only; CSS scroll-driven animations (`animation-timeline: scroll()/view()`) behind `@supports` for decorative progress; one OGL shader in the hero. No Motion/Framer.

Global rules:
- `prefers-reduced-motion: reduce` disables Lenis, all pins and scrubs, the kinetic transcript, the WebGL hero; every component renders its final static state. A visible "Motion: on/off" toggle in the footer mirrors the media query and persists in `localStorage`.
- Lenis never runs on touch devices; native scroll and anchors work everywhere; find-in-page and keyboard scrolling must keep working (test in S2).
- All ScrollTriggers are created inside `gsap.matchMedia()` with `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` for pinned variants and a simpler fade/translate variant otherwise.
- Pinned sections reserve their height up front (`pin: true, pinSpacing: true`) so CLS stays under 0.05; demo components have fixed aspect ratios.
- Nothing autoplays audio or video. Looping animations have a pause control.
- The LCP element is always the hero headline text; the canvas and all GSAP code mount after `requestIdleCallback`.

Per-section motion (home):

| Section | Desktop motion | Mobile / reduced |
|---|---|---|
| Hero | M paints over 1.2 s on load; headline lines rise with SplitText (lines, 60 ms stagger); rings idle shader | M static; headline fades in; SVG rings |
| Problem | Single sentence; "lost note" fragments drift and dim on scrub | Fragments static at 40% opacity |
| How it learns (pinned) | 4 steps scrub a stage timeline; M fills; step copy swaps | Stacked cards, no pin |
| Personas | Accent crossfade 300 ms via CSS variable; card copy swaps with 160 ms fade | Same (cheap) |
| Features carousel | Native scroll-snap; icons parallax 8px | Same without parallax |
| Game day | Tap ripples; counters count up on viewport entry | Counters show final values |
| Mind | Kinetic transcript phrases land in time (section 7C) | Phrases static, emphasised |
| Watch | SVG stroke draw-on scrubbed; dots appear in sequence | Final drawn state |
| Team | Persona switches to team; grid cells stagger 30 ms | Grid static |
| Privacy | Motion intentionally minimal: 1 fade | Same |
| CTA | M paints a final time (short) | Static |

Route transitions: Next experimental View Transitions behind `NEXT_PUBLIC_FLAG_VIEW_TRANSITIONS`; crossfade only; AmbientRings persist because they live in the root layout.

## 7. Signature interactions

### 7A. M brush stroke self-paint (`MStroke`)
Source: the app's loader spec. The mark is `public/brand/stumpnote-mark.svg` (viewBox `66 62 118 120`, five paths in order: landing piece, right leg, inner fold at opacity .6, top arch, loop). Confirm the SVG is marketing-safe before committing it (it is the public brand mark; the file ships in the App Store build).
Implementation: render the five fill paths inside a `<mask>` whose content is a single round-capped stroke (36 units wide) along the documented centreline; animate `stroke-dashoffset` from full length to 0. Hero: `gsap.to` over 1.2 s, ease `power2.out`, then a 200 ms "shine" sweep (a translating linear gradient) and hold. Scrub variant: `ScrollTrigger` with `scrub: 0.6` across the Memory chapter. Persona-aware: fill uses `var(--accent)`.
Fallback: `motion: reduce` or no JS renders the complete mark.
Also used as: the `AiMark` (static flat M) next to any "AI" label; a 2.4 s looping loader (paint 0 to 58%, shine 60 to 80%, fade 84 to 93%) on the waitlist submit button.

### 7B. Bails dislodge (NEW asset, `BailsLoader`)
Not an existing brand asset. A small SVG: three stumps, two bails. On trigger, bails lift (translateY -14px, rotate ±18°, 420 ms `--ease-out`) and fall off-stage (opacity 0 at 700 ms). Used on the 404 page ("Bowled. That page is gone.") and optionally as a route-change flourish behind the view-transitions flag. Reduced motion: bails drawn already dislodged.

### 7C. Pitch-map heat grid (`PitchHeatGrid`)
Source: the app's insights zone-heat grid (lengths Full / Good / Short by lines Off / Stumps / Leg; each cell = share of dismissals or deliveries landing there).
Implementation: a 3x3 CSS grid; cell background `color-mix(in oklab, var(--accent) calc(var(--v) * 100%), var(--surface))` with `--v` from a data array; each cell contains the percentage as real DOM text (visually small, always present), `tabindex=0`, `aria-label="Good length, Off: 36% of dismissals"`. On scroll entry cells fill in reading order (60 ms stagger); one cell pulses once and a caption states the finding in words ("Most dismissals: good length, outside off"). Data is synthetic and the component shows a "Sample data" badge.
Fallback: all cells at final values; no pulse.

### 7D. Kinetic key-phrase transcript (`KineticTranscript`)
Source: the app's Mindset Coach plays audio while key phrases ("beats") land in time with the speech. The site version is text-only.
Implementation: a pre-authored 6 to 8 line script with marked beats (`[[Trust your first ten balls]]`). SplitText by words; a GSAP timeline advances at a reading pace (about 2.8 words/s) when the section is 50% in view; beat phrases scale 1 to 1.06 and switch to `--text` from `--muted`, then settle. A play/pause button controls the timeline; it never starts audio. Labelled "Created by StumpNote AI. AI can make mistakes. Not medical or psychological advice." under the component (required disclosure).
Fallback: all text visible, beats emphasised with weight 600.

### 7E. Watch time-series charts (`SeriesChart`)
Source: the app's watch series spec (swing speed as dots + rolling median with a peak marker; heart rate with zone bands and a visible data gap; a thin activity strip).
Implementation: hand-built SVG, `viewBox` fixed, `preserveAspectRatio="none"` on the plot area. Lines use `stroke-dasharray/offset` draw-on scrubbed by ScrollTrigger; dots appear by index. Axis label "Swing speed (wrist), °/s" and caption "Wrist speed proxy. Preview." Never km/h, never "accuracy". Data is generated (`seed`-based pseudo-random, deterministic) and never copied from the private repo. A visually hidden `<table>` carries the values.
Fallback: fully drawn.

### 7F. Hero rings shader (NEW, `HeroRings`)
Concentric hairline rings as a fragment shader (OGL, lazy chunk), displaced slightly by cursor (desktop) and scroll, tinted `var(--accent)`. Gates (all must pass): `prefers-reduced-motion: no-preference`, `navigator.hardwareConcurrency >= 4`, `!navigator.connection?.saveData`, WebGL2 available, a 10-frame probe under 20 ms/frame. Any failure renders the static SVG `AmbientRings` in the identical layout (no shift). Mounted after `requestIdleCallback`; never the LCP.

### 7G. Ambient rings backdrop (`AmbientRings`)
Fixed SVG layer in the root layout: 5 concentric circles, `--hairline-1/2`, very slow 90 s rotation (CSS, paused on reduced motion). Persists across routes.

## 8. Hero concept

Giant Archivo 900 headline on the left two thirds: "Your cricket, remembered." (tagline 1 from the content brief) with sub-copy "Talk for a minute after a session. StumpNote turns it into a journal entry, then uses everything you have logged so every brief, drill, plan and answer is about your game." The M paints itself on the right third (desktop) or above the headline (mobile). Primary CTA "Join the beta" (state-driven from the `betaAccess` global), secondary "Open the web app" to `https://app.stumpnote.com`. Beneath: the four persona chips (neutral, selecting one sets `data-persona` and scrolls to Personas). Overline above the headline: "Voice-first cricket journal". No badges, no app store buttons.

## 9. Wireframes (ASCII, desktop; mobile stacks top to bottom)

Legend: `[CTA]` filled accent button, `(link)` text link, `{M}` the mark, `~~~` motion stage.

### Home `/`
```
┌──────────────────────────────────────────────────────────────┐
│ {M} StumpNote   Features  Players  Coaches  Parents  Pricing │ [Join the beta]
├──────────────────────────────────────────────────────────────┤
│ VOICE-FIRST CRICKET JOURNAL                                   │
│ Your cricket,                              ~~~~~~~~~~~~~~~~   │
│ remembered.                                ~~~  {M paints} ~  │
│ Talk for a minute after a session…         ~~~~~~~~~~~~~~~~   │
│ [Join the beta]  (Open the web app →)                         │
│ ○ Player  ○ Captain  ○ Coach  ○ Parent                        │
├──────────────────────────────────────────────────────────────┤
│ "Most post-match thoughts are gone by Tuesday."  (fragments drift)
├──────────────────────────────────────────────────────────────┤
│ HOW IT LEARNS (pinned)       │  ~~~ stage: M fills, dots land │
│ 1 Capture  2 Memory          │  ~~~ voice note → entry → dots │
│ 3 Insight  4 Action          │  ~~~                           │
├──────────────────────────────────────────────────────────────┤
│ WHO IT'S FOR   [Player][Captain][Coach][Parent]  (tabs, neutral)
│ headline per persona · 3 proof points · (See the Players page →)
├──────────────────────────────────────────────────────────────┤
│ FEATURES  ◂ card card card card card card ▸  (scroll-snap)    │
├──────────────────────────────────────────────────────────────┤
│ GAME DAY  quick-log strip [4][.][W][6]  live-mode mock        │
├──────────────────────────────────────────────────────────────┤
│ MIND  kinetic transcript  ▶ ‖   "AI can make mistakes…"       │
├──────────────────────────────────────────────────────────────┤
│ BODY  series chart (swing °/s, HR bands, activity strip) "Preview"
├──────────────────────────────────────────────────────────────┤
│ TEAM (accent→lime)  squad grid 3x4 · team insights card       │
├──────────────────────────────────────────────────────────────┤
│ PRIVACY-FIRST  three principles · (Read the policy →)         │
├──────────────────────────────────────────────────────────────┤
│ {M}  Join the beta   [email] [persona ▾] ☐ consent  [Request] │
├──────────────────────────────────────────────────────────────┤
│ footer: Product · Personas · Company · Legal (Privacy, Terms, Cookies, Account deletion, Apple EULA) · Motion: on/off · © 2026 StumpNote · "AI-generated insights are guidance for reflection and training."
└──────────────────────────────────────────────────────────────┘
```

### Features index `/features`
```
│ FEATURES                                                        │
│ Everything reads the same memory.                               │
│ filter: [All][Journal & memory][Mental game][Game day][Team][Coach][Parent][Platform]
│ ┌ card ─────────┐ ┌ card ─────────┐ ┌ card ─────────┐          │
│ │ icon  Badge   │ │               │ │               │          │
│ │ Title         │ │               │ │               │          │
│ │ one-line      │ │               │ │               │          │
│ └───────────────┘ └───────────────┘ └───────────────┘          │
│ … 22 cards + a "Preview and coming soon" strip (no full cards)  │
```

### Feature page `/features/[slug]`
```
│ ← Features        JOURNAL & MEMORY · In the beta                │
│ Voice journal                                                   │
│ Talk for a minute and get a structured entry instead of a form. │
│ ┌ demo component or screenshot (synthetic data) ─────────────┐  │
│ └─────────────────────────────────────────────────────────────┘  │
│ • bullet • bullet • bullet                                      │
│ HOW IT WORKS  Record → review → save.                           │
│ ILLUSTRATIVE SCENARIO  "Aarav says…"  (label visible)           │
│ Related: (AI read on every entry) (Memory)                      │
│ [Join the beta]                                                 │
```

### Persona pages `/players` `/captains` `/coaches` `/parents` (one template, accent per page)
```
│ FOR PLAYERS (accent teal)                                       │
│ A minute of talking. A season of insight.                       │
│ [Join the beta] (Open the web app →)                            │
│ ┌ feature block ┐ ┌ feature block ┐ ┌ feature block ┐ ┌ block ┐ │
│ FAQ (3 persona-specific from the FAQ collection)                │
│ Parents page: leads with guardian consent + sharing switches    │
```

### Pricing `/pricing`
```
│ PLANS  Indicative. Final prices in your local currency in the app. Subscriptions via the App Store.
│ ┌ Free $0 ┐ ┌ Player $2.99 ┐ ┌ Pro Player $4.99 ┐ ┌ Team $12.99 ┐
│ │ 4 entries│ │ unlimited…   │ │ 30 uploads…      │ │ captain pays│
│ └──────────┘ └──────────────┘ └──────────────────┘ └─────────────┘
│ ── Coach add-on $6.99/mo (stacks on any plan) ── Team / Academy Coach $19.99/mo ──
│ comparison table (entries, uploads 0/10/30/30, insights, team AI helpers)
│ "Free tier works for real." "We never delete your data when you downgrade." "90-day trial…" (CMS-toggleable)
│ [Join the beta]   (Terms §4) (Apple standard EULA)
```

### Security & privacy `/security`
```
│ SECURITY & PRIVACY                                              │
│ Built for juniors first.                                        │
│ short-version bullets (7, from the policy's own summary)        │
│ sections: Age gate · Guardian consent · Sharing switches · What we store · AI consent · Deletion
│ (Read the full Privacy Policy →) (Account deletion →) (Data safety summary →)
```

### Join beta `/join`
```
│ JOIN THE BETA                                                   │
│ state=waitlist:  form [email][persona ▾] ☐ "I agree…" [Request beta access]  {M loader on submit}
│ state=testflight: [Open TestFlight] + "Public beta link" copy    │
│ state=appstore:   official badge + link                         │
│ always: (Open the web app →) · "iPhone apps are in TestFlight beta and coming to the App Store."
```

### Blog `/blog`, `/blog/[slug]`; Changelog `/changelog`
```
│ BLOG   ┌ post card ┐ ┌ post card ┐      │ CHANGELOG  v-less dated entries, grouped by month
│ post: overline date · display-2 title · body (rich text) · author (team, no personal emails) · RSS
```

### Support `/support`
```
│ SUPPORT                                                         │
│ "Include the app, your device and OS version, and what you were doing."
│ contact: {{SUPPORT_EMAIL}} or notice "via the app: Profile → Help"
│ FAQ accordion (20 from the FAQ collection) · (Account deletion →)
```

### Legal pages `/privacy` `/terms` `/cookies` `/account-deletion` `/data-safety` `/legal`
```
│ PRIVACY POLICY   Effective {{EFFECTIVE_DATE}} · Version {{POLICY_VERSION}} · (Version history)
│ ┌ Notice (if any placeholder unresolved): "This page is being finalised…" ┐   ← noindex
│ prose, system fonts allowed, max 64ch, print stylesheet, no motion
│ /legal: index of all legal pages + Apple EULA link
```

### 404
```
│ {bails dislodge}                                                │
│ Bowled.                                                         │
│ That page is gone. (Home) (Features) (Support)                  │
```

### `/lab` (noindex)
Grid of every signature component with controls: persona switch, motion on/off, theme, data seed. Used for review and Playwright visual tests.

## 10. Accessibility (WCAG 2.2 AA)

- Semantic landmarks (`header`, `nav`, `main`, `footer`, one `h1` per page), skip link first in DOM.
- Keyboard: order matches visual order; focus ring `outline: 2px solid var(--accent); outline-offset: 3px` (>= 3:1 against canvas); no focus traps; carousel navigable with arrow keys.
- Targets: 24 px minimum everywhere, 44 px for primary controls.
- Motion: reduced-motion honoured (section 6); pause control on any loop; no flashing.
- Text alternatives: every demo has real DOM text (heat-grid values, transcript, chart table); icons are `aria-hidden` with adjacent text.
- Colour never the only signal; status badges carry words.
- Forms: visible labels, error text linked by `aria-describedby`, consent checkbox not pre-checked.
- No-JS: all content pages and legal pages render readable server-side.
- Checks: axe in Playwright on every route (S5, S7), manual keyboard pass, screen reader pass on Home and Join.

## 11. Performance budgets

| Metric | Budget | Where enforced |
|---|---|---|
| LCP (mobile, throttled) | < 2.0 s | Lighthouse CI assertions |
| CLS | < 0.05 | Lighthouse + Playwright layout-shift probe |
| INP | < 150 ms | Lighthouse (TBT proxy) + manual |
| Lighthouse Performance / A11y / BP / SEO | >= 95 each | `pnpm test:lh` |
| Initial JS on `/` | < 170 KB gzipped | `next build` output + `size-limit` script |
| Fonts | 2 families, woff2 subsets, < 120 KB total | build check |
| Images | SVG first; CMS images WebP via Payload sizes; `images.unoptimized` for static | review |
| Third-party scripts | one web-analytics snippet at most (provider per D-06), loaded after idle, cookieless | review |
| GSAP, Lenis, OGL | separate chunks, loaded after idle or on viewport entry | `next/dynamic` |

Mobile: no pinned sections under 1024 px; test on a throttled mid-range profile, not just desktop.
