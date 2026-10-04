import { lexical } from '../lexical'

/** First changelog entries. Seeded by `pnpm seed` (title-matched, created once, never overwritten). Date = seed run date. */
export const changelogSeeds = [
  {
    title: 'Website launched',
    app: ['site'],
    kind: 'new',
    publicStatus: 'available-web',
    summary: lexical(
      'The StumpNote website is live: every feature, a page for each role, indicative plans, how we handle your data, and support in one place.',
      'The iPhone apps are in TestFlight beta and coming to the App Store. Use the Join page to ask for beta access.',
    ),
  },
] as const
