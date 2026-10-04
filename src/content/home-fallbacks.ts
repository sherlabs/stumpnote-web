import type { BadgeLabel } from '@/components/ui/Badge'
import type { Persona } from '@/lib/site-config'

/**
 * Built-in copy for relationship blocks when the CMS has no related documents yet (and for the DB-free deploy).
 * Source: docs/spec/05-content-brief.md section 3 (personas) and section 4 (features).
 */

export type PersonaTab = {
  id: string
  label: string
  /** Page accent applied when the tab is selected. */
  accent: Persona
  headline: string
  proof: string[]
  /** Persona page route (linked only once the route is built, see site-config). */
  href: string
  linkLabel: string
}

export const PERSONA_TABS: PersonaTab[] = [
  {
    id: 'player',
    label: 'Player',
    accent: 'player',
    headline: 'A minute of talking. A season of insight.',
    proof: [
      'Voice entries with a review step, and an AI read on every entry.',
      'A daily focus and measured goals, plus a confidence bank of your own wins.',
      'Mindset audio and Ask Coach, grounded in your own sessions.',
    ],
    href: '/players',
    linkLabel: 'See the Players page',
  },
  {
    id: 'captain',
    label: 'Captain / vice',
    accent: 'team',
    headline: 'Plan like you do on paper, with a squad that is not all on the app.',
    proof: [
      'Name-only squad members and private captain notes.',
      'Manual-first game plan (voice and AI optional), field editor and IF/THEN contingencies.',
      'Team insights. The captain pays and members are free.',
    ],
    href: '/captains',
    linkLabel: 'See the Captains page',
  },
  {
    id: 'member',
    label: 'Team member',
    accent: 'team',
    headline: 'Your role, your match card, no extra bill.',
    proof: [
      "Join by invite link, with free team access under the captain's plan.",
      'A personal match card with your overs and field.',
      'Your own private journal.',
    ],
    href: '/captains',
    linkLabel: 'See the Captains page',
  },
  {
    id: 'coach',
    label: 'Coach',
    accent: 'coach',
    headline: 'Turn a voice memo into a session plan.',
    proof: [
      'Coach mode is free for the coach. Roster and player detail in one place.',
      'Voice session notes become structured sessions, with plans, drills and programs.',
      'The coach sees only what the player accepts and shares.',
    ],
    href: '/coaches',
    linkLabel: 'See the Coaches page',
  },
  {
    id: 'parent',
    label: 'Parent / guardian',
    accent: 'parent',
    headline: 'Support your junior without surveilling them.',
    proof: [
      'Create a managed profile, or link a teen by invite, with recorded consent.',
      'Alerts for injuries and low-mood patterns, within the sharing switches.',
      'Private wellbeing entries stay private when that switch is off.',
    ],
    href: '/parents',
    linkLabel: 'See the Parents page',
  },
]

export type FeatureCard = {
  slug: string
  title: string
  benefit: string
  status: BadgeLabel
  icon: string
}

export const FEATURE_CARDS: FeatureCard[] = [
  {
    slug: 'journal',
    title: 'Voice journal',
    benefit: 'Talk for a minute and get a structured entry instead of filling in a form.',
    status: 'In the beta',
    icon: 'Mic',
  },
  {
    slug: 'memory',
    title: 'A memory that keeps learning',
    benefit: 'Log once. Every feature knows.',
    status: 'In the beta',
    icon: 'Brain',
  },
  {
    slug: 'ask-coach',
    title: 'Ask Coach',
    benefit: 'Questions answered from your own history, not a textbook.',
    status: 'In the beta',
    icon: 'MessageCircle',
  },
  {
    slug: 'daily-brief',
    title: "Daily brief and today's focus",
    benefit: 'One thing to work on today, not a dashboard.',
    status: 'In the beta',
    icon: 'Target',
  },
  {
    slug: 'goals',
    title: 'Measured goals and focus areas',
    benefit: 'Progress you can trust.',
    status: 'In the beta',
    icon: 'TrendingUp',
  },
  {
    slug: 'confidence-bank',
    title: 'Confidence bank',
    benefit: 'Your own proof, ready before the big day.',
    status: 'In the beta',
    icon: 'Landmark',
  },
  {
    slug: 'mindset',
    title: 'Mindset Coach',
    benefit: 'A short spoken routine for the moment it matters.',
    status: 'In the beta',
    icon: 'Headphones',
  },
  {
    slug: 'season-story',
    title: 'Season Story',
    benefit: 'A shareable season recap with no work.',
    status: 'In the beta',
    icon: 'GalleryHorizontal',
  },
]
