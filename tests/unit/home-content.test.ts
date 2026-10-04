import { describe, expect, it } from 'vitest'
import { pageBlocks } from '../../src/blocks'
import { FEATURE_CARDS, PERSONA_TABS } from '../../src/content/home-fallbacks'
import { homeSeed } from '../../src/seed/pages/home'

const blockSlugs = new Set(pageBlocks.map((b) => b.slug))

/** Every string the seed and the built-in fallbacks can render. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out))
  return out
}

const BANNED = [
  /\bdiagnos/i,
  /\btreat(ment|ing)?\b/i,
  /\bcure\b/i,
  /\btherapy\b/i,
  /clinically proven/i,
  /guaranteed/i,
  /score more runs/i,
  /reduce injur/i,
  /win more/i,
  /never repeat a mistake/i,
  /cricket brain/i,
  /win weekends/i,
  /private by design/i,
  /coppa/i,
  /km\/h/i,
  /android/i,
  /google play/i,
  /apple app store/i,
  /any language/i,
  /replaces your coach/i,
  /#\d{2,4}\b/, // issue-number patterns
]

describe('home seed', () => {
  it('uses only registered block types, with the eleven sections in wireframe order', () => {
    const types = (homeSeed.layout ?? []).map((b) => b.blockType)
    for (const t of types) expect(blockSlugs.has(t)).toBe(true)
    expect(types).toEqual([
      'hero-story',
      'statement',
      'chapter', // How it learns
      'persona-tabs',
      'feature-carousel',
      'chapter', // Game day
      'chapter', // Mind
      'chapter', // Body
      'chapter', // Team
      'principles',
      'testimonials',
      'cta-beta',
    ])
  })

  it('keeps the approved problem line free of numbers', () => {
    const s = (homeSeed.layout ?? []).find((b) => b.blockType === 'statement')
    expect(s && 'text' in s && s.text).toBe('Most post-match thoughts are gone by Tuesday.')
    expect(s && 'text' in s && /\d/.test(s.text)).toBe(false)
  })

  it('has no banned claim phrases (seed + built-in fallbacks)', () => {
    const all = [...strings(homeSeed), ...strings(PERSONA_TABS), ...strings(FEATURE_CARDS)]
    for (const re of BANNED) {
      const hit = all.find((t) => re.test(t))
      expect(hit, `${re} in: ${hit}`).toBeUndefined()
    }
  })

  it('uses only the four allowed status labels', () => {
    for (const f of FEATURE_CARDS) {
      expect(['Available now (web)', 'In the beta', 'Preview', 'Coming soon']).toContain(f.status)
    }
    const badges = (homeSeed.layout ?? [])
      .filter((b) => b.blockType === 'chapter')
      .map((b) => ('badge' in b ? b.badge : undefined))
      .filter(Boolean)
    for (const b of badges)
      expect(['available-web', 'in-beta', 'preview', 'coming-soon']).toContain(b)
  })
})
