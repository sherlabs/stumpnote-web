import { describe, expect, it } from 'vitest'
import {
  faqPageLd,
  graph,
  lexicalToText,
  organizationLd,
  serializeLd,
  softwareApplicationsLd,
  websiteLd,
} from '@/lib/seo/jsonld'

const BASE = 'https://example.test'
const FORBIDDEN = ['aggregateRating', 'review', 'offers', 'ratingValue', 'priceCurrency']

const flat = (o: unknown) => JSON.stringify(o)

describe('JSON-LD honesty exclusions', () => {
  it('Organization has no legal entity until one is supplied', () => {
    expect(organizationLd({ baseUrl: BASE })).not.toHaveProperty('legalName')
    expect(organizationLd({ baseUrl: BASE, legalName: '  ' })).not.toHaveProperty('legalName')
    expect(organizationLd({ baseUrl: BASE, legalName: 'Test Co' })).toHaveProperty(
      'legalName',
      'Test Co',
    )
    expect(organizationLd({ baseUrl: BASE }).name).toBe('StumpNote')
  })

  it('three iOS apps, none claim ratings, offers or an install URL while not on the App Store', () => {
    for (const state of ['waitlist', 'testflight'] as const) {
      const apps = softwareApplicationsLd({
        baseUrl: BASE,
        beta: { state, appStorePlayerUrl: 'https://apps.apple.com/app/id1' },
      })
      expect(apps.map((a) => a.name)).toEqual(['StumpNote', 'StumpNote Coach', 'StumpNote Parent'])
      for (const a of apps) {
        expect(a.operatingSystem).toBe('iOS')
        expect(a).not.toHaveProperty('installUrl')
        for (const k of FORBIDDEN) expect(flat(a)).not.toContain(k)
      }
    }
  })

  it('installUrl appears only for the Player app, only in state appstore, only with a real URL', () => {
    const live = softwareApplicationsLd({
      baseUrl: BASE,
      beta: { state: 'appstore', appStorePlayerUrl: 'https://apps.apple.com/app/id1' },
    })
    expect(live[0]).toHaveProperty('installUrl')
    expect(live[1]).not.toHaveProperty('installUrl')
    expect(live[2]).not.toHaveProperty('installUrl')
    const noUrl = softwareApplicationsLd({ baseUrl: BASE, beta: { state: 'appstore' } })
    expect(noUrl[0]).not.toHaveProperty('installUrl')
    // even live, never ratings or offers
    for (const k of FORBIDDEN) expect(flat(live)).not.toContain(k)
  })

  it('the whole home graph carries no rating, review or offer keys', () => {
    const g = graph(
      organizationLd({ baseUrl: BASE }),
      websiteLd(BASE),
      softwareApplicationsLd({
        baseUrl: BASE,
        beta: { state: 'appstore', appStorePlayerUrl: 'https://x.test' },
      }),
    )
    for (const k of FORBIDDEN) expect(flat(g)).not.toContain(k)
    expect(g['@context']).toBe('https://schema.org')
  })
})

describe('FAQPage', () => {
  const lex = (t: string) => ({
    root: { children: [{ children: [{ text: t }] }, { children: [{ text: 'Second.' }] }] },
  })
  it('extracts plain text and builds Questions', () => {
    expect(lexicalToText(lex('First.'))).toBe('First. Second.')
    const f = faqPageLd([{ question: 'Q?', answer: lex('A.') }])
    expect(f?.['@type']).toBe('FAQPage')
    expect(f?.mainEntity[0].acceptedAnswer.text).toBe('A. Second.')
  })
  it('returns null with nothing to say (so no empty FAQPage is emitted)', () => {
    expect(faqPageLd([])).toBeNull()
    expect(faqPageLd([{ question: 'Q?', answer: undefined }])).toBeNull()
  })
})

describe('serializeLd', () => {
  it('cannot close the script tag', () => {
    expect(serializeLd({ a: '</script><b>' })).not.toContain('</script')
  })
})
