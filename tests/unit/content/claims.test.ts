import { describe, expect, it } from 'vitest'
import { faqSeeds } from '../../../src/seed/data/faqs'
import { featureSeeds, stripItems } from '../../../src/seed/data/features'
import { personaSeeds } from '../../../src/seed/data/personas'
import { betaAccessSeed, navigationSeed, siteSettingsSeed } from '../../../src/seed/globals'
import { contentPageSeeds } from '../../../src/seed/pages/content-pages'

/**
 * Claims policy scan (docs/spec/05-content-brief.md section 5) over every string the seed and code fallbacks can
 * render. Internal `copyRules` reminders are skipped on purpose: they quote banned words so editors know not to use them.
 */
function strings(value: unknown, out: string[] = [], skip: string[] = ['copyRules']): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out, skip))
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) if (!skip.includes(k)) strings(v, out, skip)
  return out
}

const BANNED: Array<[string, RegExp]> = [
  ['diagnose', /\bdiagnos/i],
  ['treat', /\btreat(ment|ing)?\b/i],
  ['cure', /\bcure[sd]?\b/i],
  ['therapy', /\btherap(y|ist|ies)\b/i],
  ['clinically proven', /clinically proven/i],
  ['injury prevention', /injury prevention/i],
  ['guaranteed', /guarantee/i],
  ['score more runs', /score more runs/i],
  ['reduce injuries', /reduce injur/i],
  ['win more', /win more/i],
  ['improve your average', /improve your average/i],
  ['never repeat a mistake', /never repeat a mistake/i],
  ['cricket brain', /cricket brain/i],
  ['win weekends', /win weekends/i],
  ['private by design', /private by design/i],
  ['never used to train', /never used to train/i],
  ['COPPA', /coppa/i],
  ['kids category', /kids category/i],
  ['safe for kids', /(fully )?safe for kids|child-safe/i],
  ['fully protected', /fully protected/i],
  ['km/h', /km\/h/i],
  ['google play', /google play/i],
  ['apple app store', /apple app store/i],
  ['any language', /any language/i],
  ['replaces your coach', /replaces your coach/i],
  ['mental health tracking', /mental health tracking/i],
  ['crisis or helpline', /\b(crisis|helpline)\b/i],
  ['saves minutes', /saves? \d+ ?(minutes|hours)/i],
  ['issue number', /#\d{2,4}\b/],
  ['user counts', /\b\d[\d,]*\+? (users|players|teams|downloads|matches|countries)\b/i],
  ['ratings', /\b\d(\.\d)? ?(stars?|\/5)\b|\brated\b/i],
  ['buy buttons', /\b(buy now|subscribe now|purchase now)\b/i],
]

// The one sentence that may name Android: it denies availability (FAQ "Which devices?").
const ALLOWED_ANDROID = 'We have not announced Android availability.'

const corpus = strings({
  featureSeeds,
  stripItems,
  personaSeeds,
  faqSeeds,
  contentPageSeeds,
  siteSettingsSeed,
  betaAccessSeed,
  navigationSeed,
}).map((s) => s.replace(ALLOWED_ANDROID, ''))

describe('claims policy', () => {
  it('has content to scan', () => {
    expect(corpus.length).toBeGreaterThan(300)
  })
  for (const [name, re] of BANNED) {
    it(`no "${name}"`, () => {
      const hits = corpus.filter((s) => re.test(s))
      expect(hits, hits.join(' | ')).toEqual([])
    })
  }
  it('mentions Android only to deny availability', () => {
    expect(corpus.filter((s) => /android/i.test(s))).toEqual([])
  })
})

describe('seed shape', () => {
  it('has 22 features with unique slugs and only the four status labels', () => {
    expect(featureSeeds).toHaveLength(22)
    expect(new Set(featureSeeds.map((f) => f.slug)).size).toBe(22)
    for (const f of featureSeeds)
      expect(['available-web', 'in-beta', 'preview', 'coming-soon']).toContain(f.status)
  })
  it('only the web app is "available"; nothing on iOS is claimed as available', () => {
    expect(featureSeeds.filter((f) => f.status === 'available-web').map((f) => f.slug)).toEqual([
      'web-app',
    ])
  })
  it('every feature has a fictional scenario, 3 bullets or fewer than 5, and a benefit', () => {
    for (const f of featureSeeds) {
      expect(f.scenario.text.length).toBeGreaterThan(10)
      expect(f.bullets.length).toBeGreaterThan(0)
      expect(f.bullets.length).toBeLessThanOrEqual(4)
      expect(f.benefit.length).toBeGreaterThan(5)
    }
  })
  it('related features and persona references resolve', () => {
    const slugs = new Set(featureSeeds.map((f) => f.slug))
    for (const f of featureSeeds)
      for (const r of f.related) expect(slugs.has(r), `${f.slug}->${r}`).toBe(true)
    const faqs = new Set(faqSeeds.map((f) => f.slug))
    for (const p of personaSeeds) {
      expect(p.featureBlocks.length).toBeLessThanOrEqual(4)
      expect(p.proofPoints.length).toBeLessThanOrEqual(6)
      for (const s of p.featureBlocks) expect(slugs.has(s), `${p.slug}->${s}`).toBe(true)
      for (const s of p.faqs) expect(faqs.has(s), `${p.slug}->${s}`).toBe(true)
    }
  })
  it('has 20 FAQs and 5 personas and 4 content pages', () => {
    expect(faqSeeds).toHaveLength(20)
    expect(new Set(faqSeeds.map((f) => f.slug)).size).toBe(20)
    expect(personaSeeds).toHaveLength(5)
    expect(contentPageSeeds.map((p) => p.slug).sort()).toEqual([
      'join',
      'pricing',
      'security',
      'support',
    ])
  })
  it('pricing uses "Pro Player" and never "Players Pro"; no child plans', () => {
    const pricing = JSON.stringify(contentPageSeeds.find((p) => p.slug === 'pricing'))
    expect(pricing).toContain('Pro Player')
    expect(pricing).not.toMatch(/Players Pro|child plan/i)
  })
  it('waitlist ships off and no store badge is implied', () => {
    expect(betaAccessSeed.waitlistEnabled).toBe(false)
    expect(corpus.join(' ')).not.toMatch(/download on the app store/i)
  })
})
