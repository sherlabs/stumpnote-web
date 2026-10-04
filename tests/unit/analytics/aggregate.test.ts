import { describe, expect, it } from 'vitest'
import {
  adoptionByPersona,
  budgetState,
  cacheSavings,
  costByFunction,
  dailyCost,
  dayAxis,
  featureHeat,
  filterAiDaily,
  funnel,
  latencyByFunction,
  retentionTriangle,
  weekStart,
} from '@/analytics/aggregate'
import type { AiDailyRow } from '@/analytics/types'

const NOW = new Date('2026-10-10T12:00:00Z')
const row = (over: Partial<AiDailyRow>): AiDailyRow => ({
  day: '2026-10-10',
  function_name: 'f1',
  model: 'm1',
  scope: 'player',
  calls: 1,
  subjects: null,
  prompt_tokens: 0,
  cached_tokens: 0,
  completion_tokens: 0,
  thoughts_tokens: 0,
  tts_chars: 0,
  cost_usd: 1,
  wasted_cost_usd: 0,
  cache_hits: 0,
  saved_cost_usd: 0,
  retries: 0,
  errors: 0,
  timeouts: 0,
  ...over,
})

describe('ai aggregation', () => {
  it('filters by window and by model, function and scope', () => {
    const rows = [
      row({ day: '2026-10-10' }),
      row({ day: '2026-10-01', model: 'm2' }),
      row({ day: '2026-09-01' }),
      row({ function_name: 'f2', scope: 'team' }),
    ]
    expect(filterAiDaily(rows, 7, {}, NOW)).toHaveLength(2)
    expect(filterAiDaily(rows, 30, { model: 'm2' }, NOW)).toHaveLength(1)
    expect(filterAiDaily(rows, 7, { fn: 'f2' }, NOW)).toHaveLength(1)
    expect(filterAiDaily(rows, 7, { scope: 'team' }, NOW)).toHaveLength(1)
  })
  it('zero-fills the day axis and sums cost per day', () => {
    const out = dailyCost(
      [row({ day: '2026-10-10', cost_usd: 2 }), row({ day: '2026-10-10', cost_usd: 3 })],
      3,
      NOW,
    )
    expect(out).toEqual([
      { day: '2026-10-08', cost: 0 },
      { day: '2026-10-09', cost: 0 },
      { day: '2026-10-10', cost: 5 },
    ])
    expect(dayAxis(7, NOW)).toHaveLength(7)
  })
  it('ranks functions with shares that sum to one', () => {
    const r = costByFunction([
      row({ function_name: 'a', cost_usd: 3 }),
      row({ function_name: 'b', cost_usd: 1 }),
      row({ function_name: 'c', cost_usd: 0 }),
    ])
    expect(r.map((x) => x.label)).toEqual(['a', 'b'])
    expect(r.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1)
  })
  it('cache ratio is saved / (saved + spent), null with no activity', () => {
    const none = cacheSavings([], [], 7, NOW)
    expect(none.ratio).toBeNull()
    const c = cacheSavings(
      [{ day: '2026-10-10', function_name: 'f', cache_layer: 'x', hits: 2, saved_cost_usd: 1 }],
      [row({ cost_usd: 3 })],
      7,
      NOW,
    )
    expect(c.ratio).toBeCloseTo(0.25)
  })
  it('latency is call-weighted', () => {
    const l = latencyByFunction(
      [
        { day: '2026-10-10', function_name: 'f', model: 'm', calls: 1, p50_ms: 100, p95_ms: 200 },
        { day: '2026-10-09', function_name: 'f', model: 'm', calls: 3, p50_ms: 200, p95_ms: 400 },
      ],
      7,
      NOW,
    )
    expect(l[0]?.p50).toBeCloseTo(175)
    expect(l[0]?.p95).toBeCloseTo(350)
  })
  it('budget state: no budget, on track, over pace (word, not just colour)', () => {
    const b = {
      month_start: '2026-10-01',
      mtd_cost_usd: 10,
      last7_daily_avg_usd: 1,
      days_remaining: 10,
      projected_eom_usd: 20,
    }
    expect(budgetState(b, null).state).toBe('no-budget')
    expect(budgetState(b, 0).state).toBe('no-budget')
    expect(budgetState(b, 25).state).toBe('on-track')
    expect(budgetState(b, 15).state).toBe('over-pace')
    expect(budgetState(b, 40).usedPct).toBeCloseTo(0.25)
  })
})

describe('product aggregation', () => {
  it('week starts on Monday', () => {
    expect(weekStart('2026-10-04')).toBe('2026-09-28') // Sunday
    expect(weekStart('2026-10-05')).toBe('2026-10-05') // Monday
  })
  it('heat table marks missing cells as null (hidden)', () => {
    const h = featureHeat(
      [
        { day: '2026-10-09', feature: 'a', events: 5, users: 5 },
        { day: '2026-10-09', feature: 'b', events: 7, users: 6 },
        { day: '2026-10-01', feature: 'a', events: 2, users: 5 },
      ],
      14,
      NOW,
    )
    expect(h.features).toEqual(['a', 'b'])
    expect(h.cells.flat().includes(null)).toBe(true)
    expect(h.max).toBe(7)
  })
  it('persona matrix counts hidden cells', () => {
    const m = adoptionByPersona([
      { feature: 'a', persona: 'player', users: 9 },
      { feature: 'a', persona: 'coach', users: 5 },
      { feature: 'b', persona: 'player', users: 6 },
    ])
    expect(m.hidden).toBe(1)
  })
  it('retention triangle is a share of cohort size', () => {
    const t = retentionTriangle([
      { cohort: '2026-09-28', week_n: 0, cohort_size: 10, active_users: 10 },
      { cohort: '2026-09-28', week_n: 1, cohort_size: 10, active_users: 4 },
    ])
    expect(t.cohorts[0]?.cells).toEqual([1, 0.4])
  })
  it('funnel conversions and persona filter', () => {
    const f = funnel([
      {
        cohort: '2026-09-28',
        persona: 'player',
        signed_up: 100,
        onboarded: 80,
        first_entry: 60,
        first_entry_7d: 50,
        three_plus_entries: 30,
        trial_started: 20,
        store_subscribed: 5,
      },
      {
        cohort: '2026-09-28',
        persona: 'coach',
        signed_up: 50,
        onboarded: 40,
        first_entry: 10,
        first_entry_7d: 8,
        three_plus_entries: 5,
        trial_started: 2,
        store_subscribed: 1,
      },
    ])
    expect(f[0]?.count).toBe(150)
    expect(f[1]?.pctOfPrev).toBeCloseTo(120 / 150)
    expect(
      funnel(
        [
          {
            cohort: '2026-09-28',
            persona: 'coach',
            signed_up: 50,
            onboarded: 40,
            first_entry: 10,
            first_entry_7d: 8,
            three_plus_entries: 5,
            trial_started: 2,
            store_subscribed: 1,
          },
        ],
        { persona: 'player' },
      )[0]?.count,
    ).toBe(0)
  })
})
