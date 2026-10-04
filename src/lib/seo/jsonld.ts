/**
 * Structured data (docs/spec/06-legal-pages.md and the S5 brief). Pure functions, unit-tested.
 * Honesty exclusions, enforced by tests/unit/seo/jsonld.test.ts:
 * - never `aggregateRating` or `review` (we have no ratings),
 * - never `offers` (no buy flow; pricing is indicative),
 * - `installUrl` only when the owner has set state "appstore" AND pasted the real store URL,
 * - no legal entity on Organization until COMPANY_LEGAL_NAME is set.
 */

export type JsonLdBeta = {
  state: 'waitlist' | 'testflight' | 'appstore'
  appStorePlayerUrl?: string
}

type LexNode = { text?: string; children?: LexNode[] }

/** Plain text of a Lexical document (FAQ answers). Blocks are joined with a space. */
export function lexicalToText(root: unknown): string {
  const walk = (n: LexNode): string => {
    if (typeof n.text === 'string') return n.text
    return (n.children ?? []).map(walk).join(n.children?.some((c) => c.children) ? ' ' : '')
  }
  const r = (root as { root?: LexNode } | undefined)?.root
  return r ? walk(r).replace(/\s+/g, ' ').trim() : ''
}

export function organizationLd(opts: { baseUrl: string; legalName?: string }) {
  const legalName = opts.legalName?.trim()
  return {
    '@type': 'Organization',
    '@id': `${opts.baseUrl}/#organization`,
    name: 'StumpNote',
    url: opts.baseUrl,
    logo: `${opts.baseUrl}/favicons/icon-512.png`,
    ...(legalName ? { legalName } : {}),
  }
}

export function websiteLd(baseUrl: string) {
  return {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'StumpNote',
    publisher: { '@id': `${baseUrl}/#organization` },
  }
}

const APPS = [
  {
    key: 'player',
    name: 'StumpNote',
    description: 'A voice-first cricket journal for players, with an AI that remembers your game.',
  },
  {
    key: 'coach',
    name: 'StumpNote Coach',
    description: 'Turn a voice memo into a session plan for your players.',
  },
  {
    key: 'parent',
    name: 'StumpNote Parent',
    description: 'Support a junior cricketer, with consent and visibility controls for guardians.',
  },
] as const

export function softwareApplicationsLd(opts: { baseUrl: string; beta: JsonLdBeta }) {
  const live = opts.beta.state === 'appstore'
  return APPS.map((a) => ({
    '@type': 'SoftwareApplication',
    '@id': `${opts.baseUrl}/#app-${a.key}`,
    name: a.name,
    description: a.description,
    operatingSystem: 'iOS',
    applicationCategory: 'SportsApplication',
    publisher: { '@id': `${opts.baseUrl}/#organization` },
    // Only the Player app has a store flow today, and only once the owner switches state to "appstore".
    ...(live && a.key === 'player' && opts.beta.appStorePlayerUrl
      ? { installUrl: opts.beta.appStorePlayerUrl }
      : {}),
  }))
}

export function faqPageLd(faqs: Array<{ question: string; answer: unknown }>) {
  const entities = faqs
    .map((f) => ({ q: f.question, a: lexicalToText(f.answer) }))
    .filter((f) => f.q && f.a)
    .map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    }))
  return entities.length ? { '@type': 'FAQPage', mainEntity: entities } : null
}

/** Wraps nodes in one @graph document. */
export const graph = (...nodes: Array<object | null | undefined | object[]>) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.flat().filter(Boolean),
})

/** JSON for a <script type="application/ld+json">: `<` is escaped so content can never close the tag. */
export const serializeLd = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c')
