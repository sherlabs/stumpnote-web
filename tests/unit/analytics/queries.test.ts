import { beforeEach, describe, expect, it, vi } from 'vitest'

const queries: string[] = []
const poolArgs: unknown[] = []
vi.mock('pg', () => {
  class Pool {
    constructor(cfg: unknown) {
      poolArgs.push(cfg)
    }
    on() {}
    async query(sql: string) {
      queries.push(sql)
      if (/ai_budget_month/.test(sql))
        return {
          rows: [
            {
              month_start: '2026-10-01',
              mtd_cost_usd: '1.5',
              last7_daily_avg_usd: '0.2',
              days_remaining: '3',
              projected_eom_usd: '2.1',
            },
          ],
        }
      if (/data_freshness/.test(sql))
        return {
          rows: [
            {
              ai_usage_latest: new Date('2026-10-01T00:00:00Z'),
              now_utc: new Date('2026-10-01T00:05:00Z'),
            },
          ],
        }
      return { rows: [] }
    }
  }
  return { Pool, default: { Pool } }
})

beforeEach(() => {
  queries.length = 0
  poolArgs.length = 0
  vi.resetModules()
  process.env.STUMPNOTE_ANALYTICS_DATABASE_URL =
    'postgresql://user:pw@db.example.test:6543/postgres?sslmode=require'
})

describe('stumpnote-db live queries', () => {
  it('only reads the analytics schema (views and functions), never public', async () => {
    const { liveAi, liveProduct } = await import('@/analytics/stumpnote-db')
    await liveAi(30)
    await liveProduct(30)
    expect(queries.length).toBeGreaterThan(15)
    for (const q of queries) {
      expect(q).toMatch(/analytics\./)
      expect(q).not.toMatch(/public\./i)
      expect(q).not.toMatch(/\b(insert|update|delete|drop|alter|grant|create)\b/i)
      expect(q).not.toMatch(/_activity_user_day|_feature_events|analytics\.config|excluded_subject/)
    }
  })
  it('clamps the day range to an integer between 1 and 400 and never interpolates text', async () => {
    const { liveAi } = await import('@/analytics/stumpnote-db')
    await liveAi(9999)
    await liveAi(Number('1; drop table x'))
    await liveAi(-5)
    const interpolated = queries.flatMap((q) =>
      [
        ...q.matchAll(
          /current_date - (\S+)|ai_subject_cost_dist\((\S+)\)|ai_top_spenders\((\S+),/g,
        ),
      ].map((m) => m[1] ?? m[2] ?? m[3]),
    )
    for (const v of interpolated) expect(v).toMatch(/^\d+$/)
    expect(Math.max(...interpolated.map(Number))).toBeLessThanOrEqual(400)
    expect(Math.min(...interpolated.map(Number))).toBeGreaterThanOrEqual(1)
  })
  it('pool is lazy, small, time-limited and verifies TLS', async () => {
    const mod = await import('@/analytics/stumpnote-db')
    expect(poolArgs).toHaveLength(0)
    await mod.liveAi(7)
    const cfg = poolArgs[0] as {
      max: number
      statement_timeout: number
      ssl: { rejectUnauthorized: boolean }
      connectionString: string
    }
    expect(cfg.max).toBe(2)
    expect(cfg.statement_timeout).toBeLessThanOrEqual(8000)
    expect(cfg.ssl.rejectUnauthorized).toBe(true)
    expect(cfg.connectionString).not.toContain('sslmode')
  })
  it('parses numeric strings from pg into numbers', async () => {
    const { liveAi } = await import('@/analytics/stumpnote-db')
    const d = await liveAi(7)
    expect(d.budget.mtd_cost_usd).toBe(1.5)
    expect(d.freshness.ai_usage_latest).toBe('2026-10-01T00:00:00.000Z')
  })
})
