import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { plausiblePanels } from '@/analytics/plausible'
import { umamiConfigured, umamiPanels } from '@/analytics/umami'
import { posthogPanels, RateLimitedError } from '@/analytics/posthog'

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })

describe('posthog adapter', () => {
  beforeEach(() => {
    process.env.POSTHOG_PROJECT_ID = '123'
    process.env.POSTHOG_PERSONAL_API_KEY = 'test-key'
    process.env.POSTHOG_API_HOST = 'https://eu.posthog.example/'
  })
  afterEach(() => {
    delete process.env.POSTHOG_PROJECT_ID
    delete process.env.POSTHOG_PERSONAL_API_KEY
    delete process.env.POSTHOG_API_HOST
  })

  it('sends fixed HogQL with only an integer range interpolated, as a bearer request', async () => {
    const calls: Array<{ url: string; body: string; auth: string }> = []
    const f = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({
        url: String(url),
        body: String(init?.body),
        auth: String((init?.headers as Record<string, string>).authorization),
      })
      return json({ results: [] })
    }) as unknown as typeof fetch
    await posthogPanels(30, f)
    expect(calls.length).toBeGreaterThanOrEqual(9)
    for (const c of calls) {
      expect(c.url).toBe('https://eu.posthog.example/api/projects/123/query/')
      expect(c.auth).toBe('Bearer test-key')
      expect(JSON.parse(c.body).query.kind).toBe('HogQLQuery')
    }
    expect(calls[0]?.body).toContain('interval 30 day')
    await posthogPanels(Number('7; drop' as unknown as string), f) // NaN clamps to the minimum
    expect(calls.at(-1)?.body).toContain('interval 1 day')
  })

  it('maps rows into the provider-neutral panel shape', async () => {
    const f = vi.fn(async (_u: string | URL | Request, init?: RequestInit) => {
      const q = JSON.parse(String(init?.body)).query.query as string
      if (q.includes('toDate(timestamp)')) return json({ results: [['2026-10-01', 10, 4]] })
      if (q.includes('$pathname')) return json({ results: [['/', 7]] })
      if (q.includes('beta_form_submit') && q.includes('persona_switch'))
        return json({
          results: [
            ['persona_switch', 'player', 3],
            ['beta_form_submit', 'player', 1],
          ],
        })
      if (q.includes("event in ('cta_view_hero'"))
        return json({
          results: [
            ['cta_view_hero', 100],
            ['cta_click_beta', 10],
          ],
        })
      return json({ results: [] })
    }) as unknown as typeof fetch
    const p = await posthogPanels(7, f)
    expect(p.daily).toEqual([{ day: '2026-10-01', pageviews: 10, visitors: 4 }])
    expect(p.topPages[0]).toEqual({ label: '/', value: 7 })
    expect(p.funnel.map((x) => x.count)).toEqual([100, 10, 0, 0])
    expect(p.persona).toEqual([{ persona: 'player', switches: 3, signups: 1 }])
  })

  it('surfaces 429 as RateLimitedError with retry-after', async () => {
    const f = vi.fn(async () => json({}, 429, { 'retry-after': '12' })) as unknown as typeof fetch
    await expect(posthogPanels(30, f)).rejects.toBeInstanceOf(RateLimitedError)
    await expect(posthogPanels(30, f)).rejects.toMatchObject({ retryAfterSeconds: 12 })
  })

  it('a web-vitals failure does not break the view', async () => {
    const f = vi.fn(async (_u: string | URL | Request, init?: RequestInit) => {
      const q = JSON.parse(String(init?.body)).query.query as string
      return q.includes('web_vitals') ? json({}, 400) : json({ results: [] })
    }) as unknown as typeof fetch
    const p = await posthogPanels(30, f)
    expect(p.vitals).toEqual({ lcp_ms: null, cls: null, inp_ms: null })
  })

  it('aborts after the 10 s timeout', async () => {
    vi.useFakeTimers()
    const f = vi.fn(
      (_u: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_res, rej) =>
          init?.signal?.addEventListener('abort', () => rej(new Error('aborted'))),
        ),
    ) as unknown as typeof fetch
    const pending = posthogPanels(30, f)
    const assertion = expect(pending).rejects.toThrow('aborted')
    await vi.advanceTimersByTimeAsync(10_001)
    await assertion
    vi.useRealTimers()
  })
})

describe('plausible adapter', () => {
  beforeEach(() => {
    process.env.PLAUSIBLE_SITE_ID = 'example.test'
    process.env.PLAUSIBLE_API_KEY = 'test-key'
    process.env.PLAUSIBLE_API_HOST = 'https://plausible.example'
  })
  afterEach(() => {
    delete process.env.PLAUSIBLE_SITE_ID
    delete process.env.PLAUSIBLE_API_KEY
    delete process.env.PLAUSIBLE_API_HOST
  })
  it('queries Stats API v2 and maps the same panel shape', async () => {
    const bodies: Array<Record<string, unknown>> = []
    const f = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe('https://plausible.example/api/v2/query')
      const b = JSON.parse(String(init?.body)) as Record<string, unknown>
      bodies.push(b)
      if (JSON.stringify(b.dimensions) === '["time:day"]')
        return json({ results: [{ dimensions: ['2026-10-01'], metrics: [10, 4] }] })
      return json({ results: [] })
    }) as unknown as typeof fetch
    const p = await plausiblePanels(7, f)
    expect(p.daily).toEqual([{ day: '2026-10-01', pageviews: 10, visitors: 4 }])
    expect(bodies.every((b) => b.site_id === 'example.test')).toBe(true)
    expect(p.vitals.lcp_ms).toBeNull()
  })
  it('429 is a RateLimitedError', async () => {
    const f = vi.fn(async () => json({}, 429)) as unknown as typeof fetch
    await expect(plausiblePanels(7, f)).rejects.toBeInstanceOf(RateLimitedError)
  })
})

describe('umami adapter', () => {
  const id = '123e4567-e89b-42d3-a456-426614174000'
  beforeEach(() => {
    process.env.UMAMI_WEBSITE_ID = id
    process.env.UMAMI_API_KEY = 'test-key'
    delete process.env.UMAMI_API_HOST
  })
  afterEach(() => {
    delete process.env.UMAMI_WEBSITE_ID
    delete process.env.UMAMI_API_KEY
    delete process.env.UMAMI_API_HOST
  })
  const now = new Date('2026-10-04T12:00:00Z')

  it('is configured only with a UUID website id and a key', () => {
    expect(umamiConfigured()).toBe(true)
    process.env.UMAMI_WEBSITE_ID = "x'; drop"
    expect(umamiConfigured()).toBe(false)
  })

  it('sends fixed GETs with a bearer key and integer timestamps; maps the neutral shape', async () => {
    const urls: string[] = []
    const f = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const u = new URL(String(url))
      urls.push(String(url))
      expect((init?.headers as Record<string, string>).authorization).toBe('Bearer test-key')
      expect(init?.method ?? 'GET').toBe('GET')
      if (u.pathname.endsWith('/pageviews'))
        return json({
          pageviews: [{ x: '2026-10-03 00:00:00', y: 10 }, { x: '2026-10-04 00:00:00', y: 5 }],
          sessions: [{ x: '2026-10-03 00:00:00', y: 4 }],
        })
      if (u.pathname.endsWith('/metrics')) {
        const t = u.searchParams.get('type')
        if (t === 'path') return json([{ x: '/', y: 7 }])
        if (t === 'referrer') return json([{ x: '', y: 3 }])
        if (t === 'device') return json([{ x: 'Mobile', y: 2 }])
        if (t === 'event')
          return json([
            { x: 'cta_view_hero', y: 100 },
            { x: 'cta_click_beta', y: 10 },
          ])
        return json([])
      }
      if (u.searchParams.get('eventName') === 'persona_switch')
        return json([{ value: 'player', total: 3 }])
      if (u.searchParams.get('eventName') === 'beta_form_submit')
        return json([{ value: 'player', total: 1 }])
      return json([])
    }) as unknown as typeof fetch
    const p = await umamiPanels(7, f, now)
    for (const url of urls) {
      expect(url.startsWith(`https://api.umami.is/v1/websites/${id}/`)).toBe(true)
      const q = new URL(url).searchParams
      expect(q.get('startAt')).toBe(String(Date.parse('2026-09-28T00:00:00Z')))
      expect(q.get('endAt')).toBe(String(now.getTime()))
    }
    expect(p.daily).toEqual([
      { day: '2026-10-03', pageviews: 10, visitors: 4 },
      { day: '2026-10-04', pageviews: 5, visitors: 0 },
    ])
    expect(p.topPages).toEqual([{ label: '/', value: 7 }])
    expect(p.referrers[0]?.label).toBe('(direct / unknown)')
    expect(p.devices).toEqual([{ label: 'mobile', value: 2 }])
    expect(p.funnel.map((x) => x.count)).toEqual([100, 10, 0, 0])
    expect(p.persona).toEqual([{ persona: 'player', switches: 3, signups: 1 }])
    expect(p.vitals.lcp_ms).toBeNull()
  })

  it('uses a self-hosted API host when set, and clamps the range', async () => {
    process.env.UMAMI_API_HOST = 'https://stats.example.org/api/'
    const urls: string[] = []
    const f = vi.fn(async (url: string | URL | Request) => {
      urls.push(String(url))
      return json([])
    }) as unknown as typeof fetch
    await umamiPanels(Number('9999'), f, now)
    expect(urls[0]?.startsWith(`https://stats.example.org/api/websites/${id}/`)).toBe(true)
    expect(new URL(urls[0] as string).searchParams.get('startAt')).toBe(
      String(Date.parse('2025-10-05T00:00:00Z')), // 365 days
    )
  })

  it('429 is a RateLimitedError with retry-after; other errors are plain', async () => {
    const limited = vi.fn(async () => json({}, 429, { 'retry-after': '9' })) as unknown as typeof fetch
    await expect(umamiPanels(7, limited, now)).rejects.toMatchObject({ retryAfterSeconds: 9 })
    const bad = vi.fn(async () => json({}, 401)) as unknown as typeof fetch
    await expect(umamiPanels(7, bad, now)).rejects.toThrow('HTTP 401')
  })

  it('a missing persona property (400) does not break the view', async () => {
    const f = vi.fn(async (url: string | URL | Request) =>
      String(url).includes('event-data') ? json({}, 400) : json([]),
    ) as unknown as typeof fetch
    const p = await umamiPanels(7, f, now)
    expect(p.persona).toEqual([])
  })
})
