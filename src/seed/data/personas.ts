/**
 * Persona records. Source: docs/spec/05-content-brief.md section 3. Five records, four routes: "Team member" has no
 * route of its own and renders as a section on /captains (the home tabs link there too).
 */
export type PersonaAccent = 'player' | 'coach' | 'parent' | 'team'

export type PersonaSeed = {
  slug: 'players' | 'captains' | 'members' | 'coaches' | 'parents'
  title: string
  eyebrow: string
  accent: PersonaAccent
  headline: string
  subcopy: string
  proofPoints: string[]
  featureBlocks: string[]
  faqs: string[]
  leadWith: 'default' | 'consent'
  lead?: { heading: string; body: string; items: Array<{ title: string; text: string }> }
  /** Route (null: shown inside another persona page). */
  route: string | null
  metaTitle: string
  metaDescription: string
}

export const personaSeeds: PersonaSeed[] = [
  {
    slug: 'players',
    title: 'Player',
    eyebrow: 'For players',
    accent: 'player',
    headline: 'A minute of talking. A season of insight.',
    subcopy:
      'Talk after a session and StumpNote turns it into a journal entry, then uses everything you have logged so every brief, drill and answer is about your game.',
    proofPoints: [
      'Voice entries with a review step.',
      'An AI read on every entry.',
      'A daily focus and measured goals.',
      'A confidence bank of your own wins.',
      'Mindset audio.',
      'Ask Coach, grounded in your own sessions.',
    ],
    featureBlocks: ['journal', 'ai-read', 'daily-brief', 'mindset'],
    faqs: ['no-voice', 'little-logged', 'training-data'],
    leadWith: 'default',
    route: '/players',
    metaTitle: 'StumpNote for players | Cricket journal and personal AI coach',
    metaDescription:
      'Talk after a session, get a personal brief, drills and answers built from your own history. A voice-first cricket journal for players.',
  },
  {
    slug: 'captains',
    title: 'Captain / vice',
    eyebrow: 'For captains',
    accent: 'team',
    headline: 'Plan like you do on paper, with a squad that is not all on the app.',
    subcopy:
      'Name-only squad members, a game plan you build by hand, and live-mode contingencies. Speed it up with voice or AI when you want to.',
    proofPoints: [
      'Name-only squad members.',
      'Private captain notes.',
      'Manual-first game plan, with voice and AI optional.',
      'Field editor, IF/THEN contingencies and a live over stepper.',
      'Team insights.',
      'The captain pays and members are free.',
    ],
    featureBlocks: ['squad', 'game-plan', 'live-mode', 'team-insights'],
    faqs: ['teammates-pay', 'plan-without-ai', 'what-do-i-pay'],
    leadWith: 'default',
    route: '/captains',
    metaTitle: 'StumpNote for captains | Cricket game plan and field placement planner',
    metaDescription:
      'Plan a match like you do on paper: squad, bowler matrix, field editor and IF/THEN contingencies. Members join free under the captain.',
  },
  {
    slug: 'members',
    title: 'Team member',
    eyebrow: 'For team members',
    accent: 'team',
    headline: 'Your role, your match card, no extra bill.',
    subcopy: 'Join your captain by invite link and get team access under their plan.',
    proofPoints: [
      'Joins by invite link.',
      "Free team access under the captain's plan.",
      'A personal match card with your overs and field.',
      'Your own private journal.',
    ],
    featureBlocks: ['squad', 'live-mode'],
    faqs: ['teammates-pay'],
    leadWith: 'default',
    route: null,
    metaTitle: 'StumpNote for team members',
    metaDescription:
      'Your role, your match card and your own private journal, free under the captain.',
  },
  {
    slug: 'coaches',
    title: 'Coach',
    eyebrow: 'For coaches',
    accent: 'coach',
    headline: 'Turn a voice memo into a session plan.',
    subcopy:
      'Speak a session note and it becomes a structured session your player sees. You only see what the player accepts and shares.',
    proofPoints: [
      'Coach mode is free for the coach.',
      'Roster and player detail in one place.',
      'Voice session notes become structured sessions.',
      'Plans, drills and programs.',
      'Squad insights.',
      'The coach sees only what the player accepts and shares.',
    ],
    featureBlocks: ['coach-app', 'training', 'team-insights', 'playbooks'],
    faqs: ['coaches-pay', 'coach-parent-read-journal', 'which-devices'],
    leadWith: 'default',
    route: '/coaches',
    metaTitle: 'StumpNote Coach | Cricket coaching app for player development',
    metaDescription:
      'Turn a voice memo into a structured session plan. Roster, drills and programs, with the player in control of what you can see.',
  },
  {
    slug: 'parents',
    title: 'Parent / guardian',
    eyebrow: 'For parents and guardians',
    accent: 'parent',
    headline: 'Support your junior without surveilling them.',
    subcopy:
      'You create or link the profile, consent is recorded, and three separate switches decide what you can see.',
    proofPoints: [
      'Create a managed profile, or link a teen by invite.',
      'Guardian consent is recorded.',
      'Alerts for injuries and low-mood patterns, within the sharing switches.',
      'Private wellbeing entries stay private when that switch is off.',
      'A claim path when the child turns 13.',
    ],
    featureBlocks: ['parent-app', 'conditions', 'mindset', 'web-app'],
    faqs: ['under-13', 'parents-see', 'is-this-medical-advice'],
    leadWith: 'consent',
    lead: {
      heading: 'Consent first.',
      body: 'Nothing is shared until a guardian has attested and you have chosen what to switch on.',
      items: [
        {
          title: 'Guardian consent, recorded',
          text: 'A guardian attests when the profile is created, and consent is asked for again when the policy changes.',
        },
        {
          title: 'Three sharing switches',
          text: 'Cricket, wellbeing and growth each have their own switch, so you choose group by group.',
        },
        {
          title: 'Private stays private',
          text: "A child's private wellbeing entries are not shown when wellbeing sharing is off.",
        },
        {
          title: 'Age-aware safeguards',
          text: 'Self sign-up is 13 and over. Profiles for younger players are created and managed by a parent or guardian.',
        },
      ],
    },
    route: '/parents',
    metaTitle: 'StumpNote Parent | Junior cricket app for parents and guardians',
    metaDescription:
      'Guardian consent, three sharing switches and age-aware safeguards. Stay in the loop on your junior cricketer without reading their diary.',
  },
]
