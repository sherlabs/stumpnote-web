/**
 * The 22 feature records plus the "Preview and Coming soon" strip. Source: docs/spec/05-content-brief.md section 4.
 * Single source for the seed script AND the code fallback (production has no database until Neon is attached).
 * `scenario.persona` names are fictional and always rendered under the label "Illustrative scenario".
 */
export type FeatureArea =
  'journal-memory' | 'mental-game' | 'game-day' | 'team' | 'coach' | 'parent' | 'platform'
export type FeatureStatus = 'available-web' | 'in-beta' | 'preview' | 'coming-soon'
export type FeatureDemo =
  | 'none'
  | 'voice-typer'
  | 'quick-log'
  | 'heat-grid'
  | 'kinetic-transcript'
  | 'series-chart'
  | 'squad-grid'
  | 'm-stroke'
export type FeaturePersona = 'player' | 'captain' | 'member' | 'coach' | 'parent'

export type FeatureSeed = {
  slug: string
  title: string
  area: FeatureArea
  status: FeatureStatus
  benefit: string
  bullets: string[]
  howItWorks: string
  scenario: { persona: string; text: string }
  /** Internal editor reminder; never rendered. */
  copyRules?: string
  demo: FeatureDemo
  personas: FeaturePersona[]
  related: string[]
  order: number
  comingSoonTeaser?: string
  /** Lucide icon name from components/blocks/icons.tsx. */
  icon: string
}

export const AREA_LABELS: Record<FeatureArea, string> = {
  'journal-memory': 'Journal and memory',
  'mental-game': 'Mental game',
  'game-day': 'Game day',
  team: 'Team',
  coach: 'Coach',
  parent: 'Parent',
  platform: 'Platform',
}

export const featureSeeds: FeatureSeed[] = [
  {
    slug: 'journal',
    title: 'Voice journal',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'Talk for a minute and get a structured entry instead of filling in a form.',
    bullets: [
      'Captures runs, balls, dismissal, what went right and wrong, plus sleep, soreness and mood if you mention them.',
      'A review screen shows what was heard before anything is saved.',
      'At most a short follow-up or two for anything essential that is missing.',
    ],
    howItWorks:
      'Record, review, save. The entry opens and its AI read starts on its own. You can also create entries manually with the detailed form.',
    scenario: {
      persona: 'Aarav',
      text: 'Aarav says "Made 34 off 41, caught at cover, six overs for 1 for 28, slept badly." He checks the figures and saves.',
    },
    copyRules: '"About a minute of talking" is the design target, not a measured saving.',
    demo: 'voice-typer',
    personas: ['player'],
    related: ['ai-read', 'memory'],
    order: 10,
    icon: 'Mic',
  },
  {
    slug: 'ai-read',
    title: 'AI read on every entry',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'A debrief without writing one.',
    bullets: [
      'A verdict, a short takeaway and an analysis per discipline with an up, steady or down grade.',
      'Checks whether the playbook rules you tried worked, with a line of evidence.',
      'A suggested next-session drill.',
    ],
    howItWorks:
      'Every saved entry is analysed against your history, so the read cites your own numbers.',
    scenario: {
      persona: 'Meera',
      text: 'Meera corrects a 28 to 38 and the read re-runs so the verdict matches.',
    },
    demo: 'm-stroke',
    personas: ['player'],
    related: ['journal', 'memory'],
    order: 20,
    icon: 'Brain',
  },
  {
    slug: 'memory',
    title: 'A memory that keeps learning',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'Log once. Every feature knows.',
    bullets: [
      'Role, styles, strengths, goals, injuries and mood feed one profile.',
      'Private conditions stay private; coaches never see what you did not share.',
      'You can set the profile up by voice.',
    ],
    howItWorks: 'Everything you log is folded into a compact summary that each AI feature reads.',
    scenario: {
      persona: 'Priya',
      text: 'Priya graduates a focus area. Later advice builds on it instead of repeating it.',
    },
    copyRules: 'Say "memory" and "profile"; never "trained on your data".',
    demo: 'm-stroke',
    personas: ['player', 'coach'],
    related: ['ai-read', 'conditions'],
    order: 30,
    icon: 'Brain',
  },
  {
    slug: 'ask-coach',
    title: 'Ask Coach',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'Questions answered from your own history, not a textbook.',
    bullets: [
      'Technique answers give likely causes, a fix, one drill and one mental cue.',
      'Rules and stats questions get short answers; figures are attached by the app.',
      'Suggested next steps become goals only after you review them.',
    ],
    howItWorks:
      'Type or speak a question. Answers draw on your form and the most relevant past sessions.',
    scenario: {
      persona: 'Rohan',
      text: 'Rohan asks "why do I keep getting out early?" and gets an answer tied to his own dismissals.',
    },
    demo: 'none',
    personas: ['player'],
    related: ['memory', 'daily-brief'],
    order: 40,
    icon: 'MessageCircle',
  },
  {
    slug: 'daily-brief',
    title: "Daily brief and today's focus",
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'One thing to work on today, not a dashboard.',
    bullets: [
      'A single focus, what moved since last time, and a win quoted from your own notes.',
      'Real numbers only.',
      'A friendly nudge instead of invented content when you are new.',
    ],
    howItWorks: 'Open Home and tap the focus for the full brief and earlier days.',
    scenario: {
      persona: 'Aarav',
      text: 'Aarav\'s Monday focus reads "Play inside the box", from his caught-behind pattern.',
    },
    demo: 'none',
    personas: ['player'],
    related: ['goals', 'insights'],
    order: 50,
    icon: 'Target',
  },
  {
    slug: 'goals',
    title: 'Measured goals and focus areas',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'Progress you can trust.',
    bullets: [
      'Targets such as "500 season runs by 31 March", with milestone dots.',
      'Focus areas are measured from your innings; nothing is shown until there is enough data.',
      'Graduation, with a notification when you beat one.',
    ],
    howItWorks: 'Set a target. Progress recomputes after every log.',
    scenario: {
      persona: 'Priya',
      text: 'Priya\'s "bowled" focus area graduates after enough usable innings show a clear improvement.',
    },
    demo: 'series-chart',
    personas: ['player'],
    related: ['insights', 'daily-brief'],
    order: 60,
    icon: 'TrendingUp',
  },
  {
    slug: 'confidence-bank',
    title: 'Confidence bank',
    area: 'mental-game',
    status: 'in-beta',
    benefit: 'Your own proof, ready before the big day.',
    bullets: [
      'Every "went right" note you logged, newest first, filterable by discipline.',
      'Fills itself from normal entries.',
      'Built only from your own words.',
    ],
    howItWorks: 'Log as usual. Open the bank the night before a final.',
    scenario: {
      persona: 'Aarav',
      text: 'Aarav rereads five batting wins from the last month.',
    },
    demo: 'none',
    personas: ['player'],
    related: ['mindset', 'journal'],
    order: 70,
    icon: 'Landmark',
  },
  {
    slug: 'insights',
    title: 'Insights and trends',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'What is actually happening across your season.',
    bullets: [
      'Where your runs come from, last 5 versus previous 5, and a season read.',
      'Dismissal patterns with evidence counts (such as "5 of 11 dismissals").',
      'A line-and-length heat grid for bowlers and batters.',
    ],
    howItWorks:
      'Four tabs: Overview, Focus areas, Trends, Weaknesses. Charts appear only when there is real data.',
    scenario: {
      persona: 'Meera',
      text: "A bowler's danger map flags the costliest phase.",
    },
    copyRules: 'The "works for you" pattern cards are Coming soon.',
    demo: 'heat-grid',
    personas: ['player', 'coach'],
    related: ['goals', 'clips'],
    order: 80,
    comingSoonTeaser: 'Cards that show which of your habits are working for you.',
    icon: 'TrendingUp',
  },
  {
    slug: 'mindset',
    title: 'Mindset Coach',
    area: 'mental-game',
    status: 'in-beta',
    benefit: 'A short spoken routine for the moment it matters.',
    bullets: [
      '1 to 5 minute sessions built around one problem you raised.',
      'The transcript is always available; audio never starts without a tap.',
      'Labelled "Created by StumpNote AI. AI can make mistakes. Not medical or psychological advice."',
    ],
    howItWorks: 'Pick a focus, press play, listen on the bus.',
    scenario: {
      persona: 'Aarav',
      text: 'Before a game Aarav plays "Trust your first ten balls".',
    },
    copyRules:
      'English only. For managed children, personalisation stays off until a guardian turns it on. Say "wellbeing" and "mindset", never "therapy".',
    demo: 'kinetic-transcript',
    personas: ['player'],
    related: ['confidence-bank', 'playbooks'],
    order: 90,
    comingSoonTeaser: 'A live transcript and pinned takeaways.',
    icon: 'Headphones',
  },
  {
    slug: 'playbooks',
    title: 'Playbooks and match-day prep',
    area: 'mental-game',
    status: 'in-beta',
    benefit: 'The right format for the moment.',
    bullets: [
      'Cues, visualisations, tactical plans and routines in one library.',
      'A 5 to 10 minute prep flow assembled by rules, so it is instant and explainable.',
      'Coach suggestions arrive as suggestions and wait for your agreement.',
    ],
    howItWorks: 'Tap "Prep for this match". Afterwards, mark what helped.',
    scenario: {
      persona: 'Priya',
      text: 'Priya skips the rehearsal on the bus and runs the routine at the ground.',
    },
    demo: 'none',
    personas: ['player', 'coach'],
    related: ['mindset', 'gameday'],
    order: 100,
    comingSoonTeaser: 'Match-eve prep nudges.',
    icon: 'GalleryHorizontal',
  },
  {
    slug: 'training',
    title: 'Training, drills and bowling plans',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'Practice aimed at a tracked weakness.',
    bullets: [
      'Daily no-equipment drills, a weekly plan and rep-tracked guided net sessions.',
      'A curated library of 60 bowling plans, filterable by style and phase.',
      'Drills respect your logged injuries.',
    ],
    howItWorks:
      'Open Training. Tap Success, Edge or Miss per rep. The summary reads like "84 reps, 71% success".',
    scenario: {
      persona: 'Rohan',
      text: 'A left-arm spinner saves a "vs set batter, middle overs" plan to the playbook.',
    },
    copyRules: 'Say "60 plans" only while the dataset stays at 60.',
    demo: 'heat-grid',
    personas: ['player', 'coach'],
    related: ['conditions', 'insights'],
    order: 110,
    icon: 'Target',
  },
  {
    slug: 'clips',
    title: 'Clips and video analysis',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'A second opinion on technique, anywhere.',
    bullets: [
      'Technique points, a rating and a pitch map for bowling.',
      'Findings roll up into your weakness insights.',
      'Reels of up to 8 clips for sharing.',
    ],
    howItWorks:
      'Attach a clip to an entry or the Video Hub. Allow AI when the app asks. Run analysis. AI feedback from one camera angle. It is not coaching.',
    scenario: {
      persona: 'Aarav',
      text: 'Three clips flag "head over ball" and it shows in Aarav\'s weakness view.',
    },
    copyRules: 'Never claim automatic trimming.',
    demo: 'heat-grid',
    personas: ['player', 'coach'],
    related: ['insights', 'training'],
    order: 120,
    comingSoonTeaser: 'A 3D technique stage.',
    icon: 'GalleryHorizontal',
  },
  {
    slug: 'season-story',
    title: 'Season Story',
    area: 'journal-memory',
    status: 'in-beta',
    benefit: 'A shareable season recap with no work.',
    bullets: [
      'Swipeable cards with one big number each, shareable as an image.',
      '"Proof" cards use measured before-and-after numbers.',
      'A team version for awards night.',
    ],
    howItWorks: 'Unlocks at 8 logged sessions. Regenerate any time.',
    scenario: {
      persona: 'Meera',
      text: 'Meera shares her wickets card to the team chat.',
    },
    demo: 'series-chart',
    personas: ['player', 'captain'],
    related: ['goals', 'insights'],
    order: 130,
    icon: 'GalleryHorizontal',
  },
  {
    slug: 'conditions',
    title: 'Conditions and wellbeing check-ins',
    area: 'mental-game',
    status: 'in-beta',
    benefit: 'Advice that respects how you actually are.',
    bullets: [
      'Log injuries and illness and choose per item whether coaches can see them.',
      'Optional Apple Health snapshot.',
      'A quick mood and confidence check-in with an optional supportive reply.',
    ],
    howItWorks:
      'Log a condition. The next training plan avoids aggravating it. Not medical advice: if you are injured or struggling, talk to a professional or someone you trust.',
    scenario: {
      persona: 'Aarav',
      text: 'Aarav logs a hamstring strain and his next drills are not sprint-heavy.',
    },
    copyRules:
      'Say "wellbeing check-ins". Do not mention crisis or helpline features in marketing copy at all.',
    demo: 'none',
    personas: ['player', 'parent'],
    related: ['memory', 'training'],
    order: 140,
    icon: 'ShieldCheck',
  },
  {
    slug: 'gameday',
    title: 'Game-day hub',
    area: 'game-day',
    status: 'in-beta',
    benefit: 'Everything for match day in one place.',
    bullets: [
      'Phase track from arrival to post-match, a toolbelt and moment notes.',
      'Voice-note a thought mid-match.',
      'Finish creates a draft journal entry.',
    ],
    howItWorks: 'Open Gameday. Work through the phases. Tap Finish.',
    scenario: {
      persona: 'Rohan',
      text: 'Rohan voice-logs "dropped a catch, shaking it off" between innings.',
    },
    demo: 'quick-log',
    personas: ['player'],
    related: ['playbooks', 'journal'],
    order: 150,
    comingSoonTeaser:
      'A 60-second readiness check-in and a plan that reflects how you slept and feel.',
    icon: 'Target',
  },
  {
    slug: 'squad',
    title: 'Squad management',
    area: 'team',
    status: 'in-beta',
    benefit: 'Plan for all eleven without waiting for everyone to install the app.',
    bullets: [
      'Name-only squad members who can link to a real profile later.',
      'Invite links that expire after 72 hours.',
      'Private captain notes, with roles for captain, vice-captain and coach.',
    ],
    howItWorks: 'Create a team. Add names. Invite those who use the app.',
    scenario: { persona: 'Sam', text: 'Sam adds 14 names and invites four.' },
    demo: 'squad-grid',
    personas: ['captain', 'member'],
    related: ['game-plan', 'team-insights'],
    order: 160,
    icon: 'Users',
  },
  {
    slug: 'game-plan',
    title: 'Manual-first game plan',
    area: 'team',
    status: 'in-beta',
    benefit: 'Plan like you do on paper, then speed it up if you want.',
    bullets: [
      'Phase fields, a bowler-by-phase matrix, batting order, matchups and notes.',
      'Warnings warn and never block.',
      'Voice and AI suggestions are optional proposals you accept or drop.',
    ],
    howItWorks:
      'Start from scratch or copy a past plan. The plan stands without any AI. Building a plan by hand is free; the AI helpers belong to the Team plan.',
    scenario: { persona: 'Sam', text: 'Sam builds a T20 plan with no mic and no AI.' },
    demo: 'squad-grid',
    personas: ['captain'],
    related: ['live-mode', 'squad'],
    order: 170,
    icon: 'Users',
  },
  {
    slug: 'live-mode',
    title: 'Match-day live mode and fields',
    area: 'team',
    status: 'in-beta',
    benefit: "The plan's own words, at over nine.",
    bullets: [
      'Drag-and-snap field editor with rule hints.',
      'IF/THEN contingencies that jump to the top of Live mode when they fire.',
      'A voice Live Coach that answers using your plan.',
    ],
    howItWorks: 'Step through the overs. A fired contingency comes first.',
    scenario: {
      persona: 'Sam',
      text: '"If two left-handers are in and 3 boundaries come in 2 overs, then Kunal on."',
    },
    demo: 'quick-log',
    personas: ['captain'],
    related: ['game-plan', 'gameday'],
    order: 180,
    icon: 'Target',
  },
  {
    slug: 'team-insights',
    title: 'Team insights and squad pulse',
    area: 'team',
    status: 'in-beta',
    benefit: 'Turn match logs into a short list of team focus areas.',
    bullets: [
      'Growth points with an improved, same or regressed record.',
      'Opposition scouting.',
      'A squad pulse that never exposes an individual; below three tracked players it shows only bands.',
    ],
    howItWorks: 'Log a result. Insights follow.',
    scenario: {
      persona: 'Sam',
      text: '"Top-order collapse in overs 4 to 8" appears with its source matches.',
    },
    demo: 'series-chart',
    personas: ['captain', 'coach'],
    related: ['squad', 'game-plan'],
    order: 190,
    icon: 'TrendingUp',
  },
  {
    slug: 'coach-app',
    title: 'StumpNote Coach app',
    area: 'coach',
    status: 'in-beta',
    benefit: 'Less admin, richer notes.',
    bullets: [
      'Roster, player detail, session plans, drills and programs.',
      'Speak a session note and it is extracted into a structured session the player sees.',
      'Squad tab and match-day banner.',
    ],
    howItWorks: 'Invite a player. They accept. Nothing is readable before that.',
    scenario: {
      persona: 'Coach Mehta',
      text: 'Coach Mehta speaks "worked on front-foot defence, head falling over, set two drills".',
    },
    demo: 'none',
    personas: ['coach'],
    related: ['training', 'team-insights'],
    order: 200,
    icon: 'MessageCircle',
  },
  {
    slug: 'parent-app',
    title: 'StumpNote Parent app',
    area: 'parent',
    status: 'in-beta',
    benefit: 'Stay in the loop without reading their diary.',
    bullets: [
      'Create a managed profile for your child or link a teen by invite.',
      'Guardian consent recorded, with re-consent when the policy changes.',
      'Three sharing switches: cricket, wellbeing and growth.',
    ],
    howItWorks: "Attest as guardian. The child's profile is created and consent recorded.",
    scenario: {
      persona: 'Anil',
      text: 'Anil is told "Maya logged an injury". A routine soreness does not alert.',
    },
    copyRules: 'Describe safeguards as "age-aware", never "fully protected".',
    demo: 'none',
    personas: ['parent'],
    related: ['conditions', 'memory'],
    order: 210,
    icon: 'ShieldCheck',
  },
  {
    slug: 'web-app',
    title: 'Web app',
    area: 'platform',
    status: 'available-web',
    benefit: 'One login, desktop-grade layouts for coaches and parents.',
    bullets: [
      'Player, coach and parent in one app with a role switcher.',
      'Wide master-detail layouts.',
      'Honest fallbacks: watch and some video tools are mobile-only.',
    ],
    howItWorks:
      'Open app.stumpnote.com and sign in. Purchases are not offered on the web; plans are read-only there.',
    scenario: { persona: 'Coach Rahul', text: 'Coach Rahul reviews a roster on a laptop.' },
    demo: 'none',
    personas: ['player', 'coach', 'parent'],
    related: ['coach-app', 'parent-app'],
    order: 220,
    icon: 'GalleryHorizontal',
  },
]

/** Preview and Coming soon strip: teasers only, never full cards. */
export const stripItems: Array<{
  title: string
  status: 'preview' | 'coming-soon'
  text?: string
}> = [
  {
    title: 'Apple Watch capture',
    status: 'preview',
    text: 'Wrist-based swing and bowling metrics, in preview.',
  },
  {
    title: 'Readiness check-in and personal plan',
    status: 'coming-soon',
    text: 'A 60-second readiness check-in and a plan that reflects how you slept and feel.',
  },
  {
    title: 'Mindset live transcript and pinned takeaways',
    status: 'coming-soon',
  },
  {
    title: 'Quick-log shortcut',
    status: 'coming-soon',
  },
  {
    title: '"Works for you" patterns',
    status: 'coming-soon',
  },
  {
    title: 'Match-eve prep nudges',
    status: 'coming-soon',
  },
  {
    title: '3D technique stage',
    status: 'coming-soon',
  },
]
