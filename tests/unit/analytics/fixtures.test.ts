import { describe, expect, it } from 'vitest'
import { todayUtc } from '@/analytics/dates'
import { fixtureAi, fixtureK, fixtureProduct, fixtureWeb } from '@/analytics/fixtures'

describe('fixtures (synthetic) parse through the live row schemas', () => {
  const ai = fixtureAi()
  const product = fixtureProduct()

  it('rebases so the newest day is today and 120 days exist', () => {
    const days = [...new Set(ai.daily.map((r) => r.day))].sort()
    expect(days.at(-1)).toBe(todayUtc())
    expect(days.length).toBe(120)
  })

  it('exercises k-suppression: null subjects exist, no product cell is under k', () => {
    expect(ai.daily.some((r) => r.subjects === null)).toBe(true)
    expect(ai.daily.every((r) => r.subjects === null || r.subjects >= fixtureK)).toBe(true)
    expect(product.featureDaily.every((r) => r.users >= fixtureK)).toBe(true)
    expect(product.byPersona.every((r) => r.users >= fixtureK)).toBe(true)
    expect(product.signups.every((r) => r.accounts >= fixtureK)).toBe(true)
    expect(product.subscriptions.every((r) => r.users >= fixtureK)).toBe(true)
  })

  it('weekly cohorts stay Mondays after rebasing', () => {
    for (const r of product.retention) expect(new Date(`${r.cohort}T00:00:00Z`).getUTCDay()).toBe(1)
  })

  it('budget row is derived from the rebased rows and is internally consistent', () => {
    const b = ai.budget
    expect(b.projected_eom_usd).toBeCloseTo(
      b.mtd_cost_usd + b.last7_daily_avg_usd * b.days_remaining,
      3,
    )
  })

  it('top spenders are ranks only (no id column)', () => {
    for (const t of ai.top)
      expect(Object.keys(t).sort()).toEqual(['calls', 'cost_usd', 'pct_of_subject_spend', 'rank'])
  })

  it('web panels scale by range and never contain ids or emails', () => {
    const w7 = fixtureWeb(7)
    const w90 = fixtureWeb(90)
    expect(w7.daily.length).toBe(7)
    expect(w90.daily.length).toBe(90)
    expect(JSON.stringify([w7, w90, ai, product])).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i)
  })
})
