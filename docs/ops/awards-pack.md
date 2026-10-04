# Awards pack (preparation only: nothing here has been submitted)

Submitting costs money (Awwwards, CSSDA and FWA charge per submission or per tier) and is the owner's decision. This page is everything the owner needs to submit in about 20 minutes once the custom domain is live. An agent never submits, pays or fills a submission form.

## 1. Readiness gate (do these first)

| Gate | State | Where |
|---|---|---|
| Custom domain `stumpnote.com` serving the site over HTTPS | Pending the owner's DNS approval (S7-U1) | `docs/spec/07-deploy-runbook.md` section 4 |
| Production database attached and content seeded | Pending the Neon gate (S1-U1) and a seed run (S4-09) | `STATUS.md`, Blocked |
| Legal pages published (or the honest notice mode left on) | Notice mode today; real values pending (S5-U1/U2) | `docs/ops/HANDOFF.md` section 4 |
| iOS apps on the App Store | Not yet: the site says "In the beta" and "Coming soon" everywhere | do not submit a claim the site cannot back |
| Lighthouse (mobile) at or above the budgets on the production URL | Table in `STATUS.md`, S7-07 | `pnpm test:lh --base=<origin>` |

Recommendation: submit after the apex domain is live and the Neon database is seeded, so jurors see the CMS-backed site and a short, clean URL. Juries judge the live URL, not the repo.

## 2. Site facts

- URL today: https://stumpnote-site.vercel.app (alias of the production deployment). Target: https://stumpnote.com
- Product: StumpNote, a voice-first cricket journal with an AI that remembers your game. Roles: player, captain, coach, parent.
- Stack: Next.js (App Router) + Payload CMS 3 on Postgres, Tailwind CSS 4, GSAP + Lenis (lazy), OGL WebGL hero (lazy, gated, SVG fallback), self-hosted Archivo and Hanken Grotesk, Lucide icons, deployed on Vercel.
- Design thesis: "The innings that remembers". The home page is one continuous innings; scroll time is match time and the memory builds as you scroll.
- Signature moves jurors should notice in the first ten seconds:
  1. The StumpNote "M" paints itself in the hero (brush stroke drawn along the real mark's centreline).
  2. Persona re-theming: one `--accent` token swaps the whole page between player teal, coach orange, parent rose and team lime (rings, mark, focus rings, buttons).
  3. Type that is huge but readable on a dark canvas, with exactly one filled accent per view.
  4. Every chapter is a live component with real DOM text (heat grid, kinetic transcript, series charts), never a video.
  5. The 404 ("Bowled.") dislodges the bails.
- Restraint notes (these are the Usability and Content arguments): no scroll-jacking on touch, no pinned sections under 1024 px, reduced motion renders the final static states, keyboard order equals visual order, find-in-page works, no lorem, no stock photos, no invented numbers, ratings or testimonials, honest "Sample data" labels on every demo.

## 3. The 60-second recording

Record the production URL at 1440 x 900 (screen recorder at 60 fps, no cursor highlight), then export 1920 x 1080 H.264, under 100 MB. Use a fresh browser profile (no extensions) and a wired or fast connection so Lenis smooth-scroll and the WebGL rings run at full rate. Turn notifications off.

Script (scroll slowly; pause where noted):

| Time | Action | What the jury sees |
|---|---|---|
| 0:00 to 0:08 | Load `/`, do not touch the mouse. Let the M paint and the rings settle. | The signature moment, the headline, the single teal accent |
| 0:08 to 0:12 | Move the cursor slowly across the hero. | Rings displace with the cursor |
| 0:12 to 0:24 | Scroll through the capture and memory chapters at an even pace. Pause 1.5 s on the typing voice note. | Scroll as narrative; live component, real text |
| 0:24 to 0:34 | Scroll to the insight heat grid, pause 2 s, then to the mind and body chapters. | Cells resolve; kinetic transcript; chart draw-on |
| 0:34 to 0:44 | Reach the persona tabs. Click Coach, then Parent, then Captain. | Whole-page re-theme from one token |
| 0:44 to 0:50 | Scroll through the privacy principles (motion calms on purpose). | Restraint and trust |
| 0:50 to 0:56 | Open the menu, go to `/features`, click one feature to show the live demo. | Navigation craft, depth |
| 0:56 to 1:00 | Type a bad URL to show the 404 bails, end on the Join page. | Detail, honest call to action |

Add no voiceover; a quiet bed of music is optional (licence it yourself). Do not add fake UI chrome, stock footage or claims.

## 4. Five stills

Capture at 2560 x 1440 (or 1440 x 900 at 2x) PNG, no browser chrome:

1. Hero with the M fully painted and the rings visible (`/`, top).
2. The insight chapter with the heat grid resolved and its caption (`/`, scroll to Insight).
3. Persona re-theme: the Coach (orange) or Parent (rose) view next to a Player (teal) crop of the same section.
4. `/features` grid with the status badges (shows the honest status vocabulary).
5. Mobile at 390 x 844: hero and the open menu sheet, side by side.

Spare: `/security` (principles), `/pricing` (indicative plans), the 404 with the bails.

Existing reference captures made during the build live in `docs/ops/screens/` (they are QA evidence, not final submission assets).

## 5. Credits text (edit names before use)

> Design and development: Sherlabs. Content management: Payload CMS. Typography: Archivo and Hanken Grotesk (SIL Open Font License). Icons: Lucide. Motion: GSAP and Lenis. WebGL: OGL. Hosting: Vercel. Built with Claude Code.

Awwwards asks for a technology list and a short description; reuse section 2. Keep the description factual and avoid superlatives.

## 6. Categories and where to aim

| Programme | Fit | Note |
|---|---|---|
| Awwwards: Site of the Day / Developer Award | Primary target. Weights: Design 40%, Usability 30%, Creativity 20%, Content 10%; Developer Award needs a developer score above 7.0; Honorable Mention from 6.5 | Fee per submission; check the current fee on the submit page |
| CSS Design Awards (CSSDA) | Good fit for UI, UX and innovation | Fee per submission |
| FWA | Optional; favours heavy interactive work | Fee |
| Lapa Ninja, Land-book, Godly | Showcase galleries, usually free or low cost | Good for traffic and backlinks, no jury prestige |
| Product Hunt (for the apps, not the site) | Only after an App Store release | Out of scope until then |

Awwwards lists the main tags to pick: Dark, Typography, Scrolling, Animation, Mobile Friendly, Education or Sports. Choose at most the three that are plainly true.

## 7. Checklist from the design spec (status as built)

| Item | Status | Evidence |
|---|---|---|
| One signature interaction unmistakably ours | Done | M self-paint, persona re-theming (home, `/lab`) |
| Two-colour discipline per view | Done | Canvas plus one accent; nav and tabs neutral |
| Scroll as narrative spine; live DOM-text components | Done | Home chapters |
| Usability defended (keyboard, focus, targets, no touch scroll-jack) | Done | Playwright nav and a11y specs; axe zero serious/critical |
| Accessibility defended (WCAG 2.2 AA, reduced motion, text alternatives) | Done | `a11y.spec.ts`, `motion.spec.ts` (reduced-motion project) |
| Performance defended | Mostly: applied-throttling LCP is within budget; the Lighthouse lantern estimate is above 2.0 s (decision D-40, open for the owner) | `STATUS.md` Lighthouse table |
| Content defended (no lorem, no placeholders, legal live or honest notice) | Done (notice mode until legal values arrive) | Claims unit test, content QA |
| Works 320 to 2560 px, no horizontal scroll; legal print stylesheet | Done | Overflow checks in the e2e suite (320 to 1440); print CSS on legal pages |
| OG images, favicon set, 404 with bails | Done | `opengraph-image`, manifest, `global-not-found` |
| Custom domain on HTTPS | Pending the owner (S7-U1) | Runbook section 4 |
| 60 s recording and 5 stills | Instructions above; the owner records after the domain is live | This page |
