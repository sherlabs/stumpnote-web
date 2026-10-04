import { legalBodies } from './bodies'

export type LegalSlug = keyof typeof legalBodies

export const LEGAL_SLUG_LIST = [
  'privacy',
  'terms',
  'support',
  'cookies',
  'account-deletion',
  'data-safety',
] as const satisfies readonly LegalSlug[]

/** Route titles and meta descriptions; bodies come from the markdown sources (bodies.ts is generated from them). */
export const legalMeta: Record<
  LegalSlug,
  { title: string; description: string; versioned: boolean }
> = {
  privacy: {
    title: 'Privacy Policy',
    description:
      'What StumpNote collects, why, who handles it, how long we keep it and the choices you have.',
    versioned: true,
  },
  terms: {
    title: 'Terms of Use',
    description: 'The terms for using StumpNote, including AI, subscriptions and accounts.',
    versioned: true,
  },
  support: {
    title: 'Support details',
    description: 'How to reach StumpNote support, report a bug and manage your subscription.',
    versioned: false,
  },
  cookies: {
    title: 'Cookies',
    description: 'What the StumpNote website stores in your browser. No advertising cookies.',
    versioned: false,
  },
  'account-deletion': {
    title: 'Account deletion',
    description: 'How to delete your StumpNote account and what happens to your data.',
    versioned: false,
  },
  'data-safety': {
    title: 'Data safety summary',
    description: 'A plain-language summary of the data StumpNote handles and why.',
    versioned: false,
  },
}

export const legalSeed = (slug: LegalSlug) => ({
  slug,
  title: legalMeta[slug].title,
  body: legalBodies[slug] as string,
})

export const isLegalSlug = (s: string): s is LegalSlug =>
  (LEGAL_SLUG_LIST as readonly string[]).includes(s)
