import { lexical } from '../lexical'
import type { Page } from '@/payload-types'

/**
 * The non-home `pages` documents (pricing, security, join, support). Same dual use as home.ts: seed source and the
 * code fallback that keeps every route alive with no database. Copy: docs/spec/05-content-brief.md sections 6, 7, 8
 * and the wireframes in docs/spec/02-design.md section 9.
 */
export type ContentPageSeed = Pick<Page, 'title' | 'slug' | 'persona' | 'hero' | 'layout'> & {
  metaTitle: string
  metaDescription: string
}

export const INDICATIVE_LINE =
  'Indicative. Final prices are shown in your local currency in the app before you subscribe. Subscriptions are managed through the App Store.'
export const TRIAL_LINE = 'A 90-day trial gives Player-level access.'

export const pricingSeed: ContentPageSeed = {
  title: 'Pricing',
  slug: 'pricing',
  persona: 'player',
  metaTitle: 'Plans | StumpNote',
  metaDescription:
    'A free tier that works for real, and monthly plans for players, teams and coaches. Indicative prices; final prices are shown in the app.',
  hero: {
    type: 'standard',
    overline: 'Plans',
    headline: 'Start free.\nGrow when you need to.',
    subcopy:
      'Creating a team and planning a match by hand are free on every plan. Team members and coaches ride free on a captain’s or player’s plan.',
    persona: 'player',
  },
  layout: [
    {
      blockType: 'pricing-table',
      heading: 'Plans',
      plans: [
        {
          name: 'Free',
          priceLabel: '$0',
          period: 'forever',
          summary: 'Free works for real.',
          bullets: [
            { text: '4 journal entries a month' },
            { text: 'Basic dashboard' },
            { text: 'Create teams and plan by hand' },
          ],
          highlight: false,
        },
        {
          name: 'Player',
          priceLabel: '$2.99',
          period: 'per month',
          summary: 'For the player who logs every session.',
          bullets: [
            { text: 'Unlimited voice and manual entries' },
            { text: '10 video uploads a month' },
            { text: 'Full insights and wellbeing check-ins' },
            { text: 'Training planner and playbook' },
          ],
          highlight: true,
        },
        {
          name: 'Pro Player',
          priceLabel: '$4.99',
          period: 'per month',
          summary: 'More video, deeper analytics.',
          bullets: [
            { text: 'Everything in Player' },
            { text: '30 video uploads a month' },
            { text: 'Priority video processing' },
            { text: 'Advanced analytics' },
          ],
          highlight: false,
        },
        {
          name: 'Team',
          priceLabel: '$12.99',
          period: 'per month',
          summary: 'The captain pays. Members get team access free.',
          bullets: [
            { text: 'Everything in Pro Player' },
            { text: 'The game-plan AI helpers' },
            { text: 'Members get team access free' },
          ],
          highlight: false,
        },
      ],
      addons: [
        {
          name: 'Coach add-on',
          priceLabel: '$6.99',
          period: 'per month',
          text: 'Stacks on any plan. Lets a player enable coaching. The coach uses coach mode free.',
        },
        {
          name: 'Team / Academy Coach',
          priceLabel: '$19.99',
          period: 'per month',
          text: 'Lifts the coach scale limits (the free coach tier covers one team and 12 active consented members).',
        },
      ],
      comparison: [
        {
          row: 'Journal entries a month',
          values: [
            { value: '4' },
            { value: 'Unlimited' },
            { value: 'Unlimited' },
            { value: 'Unlimited' },
          ],
        },
        {
          row: 'Video uploads a month',
          values: [{ value: 'None' }, { value: '10' }, { value: '30' }, { value: '30' }],
        },
        {
          row: 'Insights',
          values: [
            { value: 'Basic dashboard' },
            { value: 'Full insights' },
            { value: 'Advanced analytics' },
            { value: 'Advanced analytics' },
          ],
        },
        {
          row: 'Wellbeing check-ins, training planner and playbook',
          values: [{ value: 'No' }, { value: 'Yes' }, { value: 'Yes' }, { value: 'Yes' }],
        },
        {
          row: 'Priority video processing',
          values: [{ value: 'No' }, { value: 'No' }, { value: 'Yes' }, { value: 'Yes' }],
        },
        {
          row: 'Create a team and plan by hand',
          values: [{ value: 'Yes' }, { value: 'Yes' }, { value: 'Yes' }, { value: 'Yes' }],
        },
        {
          row: 'Game-plan AI helpers',
          values: [{ value: 'No' }, { value: 'No' }, { value: 'No' }, { value: 'Yes' }],
        },
      ],
      notes: [
        { text: 'Free tier works for real: 4 entries a month.' },
        { text: 'We never delete your data when you downgrade.' },
      ],
    },
    { blockType: 'faq-list', overline: 'Questions', heading: 'About plans', category: 'pricing' },
    { blockType: 'cta-beta', heading: 'Join the beta', subcopy: 'The web app is live now.' },
  ],
}

export const securitySeed: ContentPageSeed = {
  title: 'Security and privacy',
  slug: 'security',
  persona: 'player',
  metaTitle: 'Security and privacy | StumpNote',
  metaDescription:
    'What StumpNote stores, when AI sees your data, who can see what, and how to delete your account. Plain language, with the full Privacy Policy linked.',
  hero: {
    type: 'standard',
    overline: 'Security and privacy',
    headline: 'Clear about\nyour data.',
    subcopy:
      'The short version, in plain language. The full policy is the authority, and it is linked below.',
    persona: 'player',
  },
  layout: [
    {
      blockType: 'principles',
      overline: 'The short version',
      heading: 'What matters most.',
      items: [
        {
          title: 'You decide what the AI sees',
          text: 'The app asks your permission before an AI feature sends your data, and you can withdraw it any time in Profile.',
          icon: 'KeyRound',
        },
        {
          title: 'Only what you share',
          text: 'Coaches, captains and parents only see what the sharing rules and your choices allow.',
          icon: 'Users',
        },
        {
          title: 'Not for sale',
          text: "We do not sell your personal information, we do not use it for advertising, and we do not track you across other companies' apps or sites.",
          icon: 'Ban',
        },
        {
          title: 'Delete inside the app',
          text: 'You can delete your account from within the app. Cancel any subscription with Apple first.',
          icon: 'ShieldCheck',
        },
      ],
    },
    {
      blockType: 'rich-text',
      content: lexical(
        { h2: 'Age gate' },
        'Self sign-up is 13 and over. Profiles for younger players are created and managed by a parent or guardian in the StumpNote Parent app. Safeguards for young players are age-aware.',
        { h2: 'Guardian consent' },
        'A guardian attests when a managed profile is created. Consent is recorded, and asked for again when the policy changes.',
        { h2: 'Sharing switches' },
        "Guardians see three groups, each with its own switch: cricket, wellbeing and growth. A coach link stays pending until the player accepts. A child's private wellbeing entries are not shown when wellbeing sharing is off.",
        { h2: 'What we store' },
        'You write or speak journal entries about your cricket. We store them and use AI to find patterns and help you plan training. Health data from Apple Health is optional. Our database and file storage are hosted on Supabase (Mumbai, India), and some providers operate globally.',
        { h2: 'AI and your data' },
        "AI runs through our servers using Google's services. The app asks permission before any AI feature sends your data, and you can withdraw it in Profile. AI can make mistakes. It is not medical advice. We do not use your content to train our own models; how our AI provider treats API content depends on its terms.",
        { h2: 'Deleting your account' },
        'In the app: Profile, Account, Delete account. Cancel any subscription with Apple first.',
      ),
    },
    { blockType: 'cta-beta', heading: 'Join the beta', subcopy: 'The web app is live now.' },
  ],
}

export const joinSeed: ContentPageSeed = {
  title: 'Join the beta',
  slug: 'join',
  persona: 'player',
  metaTitle: 'Join the beta | StumpNote',
  metaDescription:
    'The StumpNote iPhone apps are in TestFlight beta and coming to the App Store. The web app is live now.',
  hero: {
    type: 'standard',
    overline: 'Join the beta',
    headline: 'Be among the first\nto try it.',
    subcopy:
      'The iPhone apps are in TestFlight beta and coming to the App Store. The web app is live now.',
    persona: 'player',
  },
  layout: [
    { blockType: 'cta-beta', heading: 'Join the beta', subcopy: 'The web app is live now.' },
  ],
}

export const supportSeed: ContentPageSeed = {
  title: 'Support',
  slug: 'support',
  persona: 'player',
  metaTitle: 'Support | StumpNote',
  metaDescription:
    'Answers to common questions about StumpNote, and how to get help or report a bug. Include the app, your device and OS version, and what you were doing.',
  hero: {
    type: 'standard',
    overline: 'Support',
    headline: 'Questions,\nanswered.',
    subcopy:
      'Include the app, your device and OS version, and what you were doing when you ask for help.',
    persona: 'player',
  },
  layout: [{ blockType: 'faq-list', overline: 'FAQ', heading: 'Common questions' }],
}

export const contentPageSeeds: ContentPageSeed[] = [
  pricingSeed,
  securitySeed,
  joinSeed,
  supportSeed,
]
export const contentPageBySlug = Object.fromEntries(
  contentPageSeeds.map((p) => [p.slug, p]),
) as Record<string, ContentPageSeed>
