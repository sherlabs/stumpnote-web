import 'server-only'
import { sinceDay } from './dates'
import { int } from './util'
import { RateLimitedError } from './posthog'
import { FUNNEL_EVENTS, webPanels, type WebPanels } from './types'

/**
 * Umami adapter (MIT, open source). Works against Umami Cloud (`https://api.umami.is/v1`, API key as Bearer) and a
 * self-hosted instance (`https://<host>/api`, API key from Settings > API keys, same Bearer header). Only GET requests
 * with fixed paths; the only interpolated values are the website id (validated as a UUID) and integer timestamps.
 * Not yet exercised against a live account: verify once when the account exists (D-06).
 * Cloud limit: 50 calls per 15 s per key; one view is about 10 calls and is cached for 5 minutes.
 */
export const UMAMI_CLOUD_API = 'https://api.umami.is/v1'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const umamiConfigured = (): boolean =>
  UUID.test((process.env.UMAMI_WEBSITE_ID ?? '').trim()) && Boolean(process.env.UMAMI_API_KEY?.trim())

export const umamiMissing = (): string[] =>
  ['UMAMI_WEBSITE_ID', 'UMAMI_API_KEY'].filter((k) => !process.env[k]?.trim())

type Pair = { x: string | null; y: number }

async function get<T>(
  path: string,
  params: Record<string, string | number>,
  fetchImpl: typeof fetch,
): Promise<T> {
  const base = (process.env.UMAMI_API_HOST?.trim() || UMAMI_CLOUD_API).replace(/\/+$/, '')
  const site = (process.env.UMAMI_WEBSITE_ID as string).trim()
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10_000)
  try {
    const res = await fetchImpl(`${base}/websites/${site}/${path}?${qs}`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${(process.env.UMAMI_API_KEY as string).trim()}`,
      },
      signal: ctrl.signal,
      cache: 'no-store',
    })
    if (res.status === 429) {
      const ra = Number(res.headers.get('retry-after'))
      throw new RateLimitedError(Number.isFinite(ra) && ra > 0 ? ra : null)
    }
    if (!res.ok) throw new Error(`Umami query failed (HTTP ${res.status})`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export async function umamiPanels(
  days: number,
  fetchImpl: typeof fetch = fetch,
  now: Date = new Date(),
): Promise<WebPanels> {
  const d = int(days, 1, 365)
  const startAt = Date.parse(`${sinceDay(d, now)}T00:00:00Z`)
  const endAt = now.getTime()
  const range = { startAt, endAt }
  const metric = (type: string, limit: number) =>
    get<Pair[]>('metrics', { ...range, type, limit }, fetchImpl)
  const list = (rows: Pair[]) =>
    rows.map((r) => ({ label: r.x || '(direct / unknown)', value: r.y }))

  const [series, pages, refs, countries, devices, events] = await Promise.all([
    get<{ pageviews?: Pair[]; sessions?: Pair[] }>(
      'pageviews',
      { ...range, unit: 'day', timezone: 'UTC' },
      fetchImpl,
    ),
    metric('path', 15),
    metric('referrer', 10),
    metric('country', 10),
    metric('device', 10),
    metric('event', 100),
  ])
  const sessions = new Map((series.sessions ?? []).map((r) => [String(r.x).slice(0, 10), r.y]))
  const counts = new Map(events.map((r) => [String(r.x), r.y]))

  const personaValues = async (eventName: string) => {
    try {
      const rows = await get<Array<{ value: string; total: number }>>(
        'event-data/values',
        { ...range, eventName, propertyName: 'persona' },
        fetchImpl,
      )
      return rows
    } catch (e) {
      if (e instanceof RateLimitedError) throw e
      return [] // events without the property (or a restricted plan) must not break the view
    }
  }
  const [switches, signups] = await Promise.all([
    personaValues('persona_switch'),
    personaValues('beta_form_submit'),
  ])
  const personas = new Map<string, { switches: number; signups: number }>()
  const put = (rows: typeof switches, key: 'switches' | 'signups') => {
    for (const r of rows) {
      const k = String(r.value || 'unknown')
      const cur = personas.get(k) ?? { switches: 0, signups: 0 }
      cur[key] = r.total
      personas.set(k, cur)
    }
  }
  put(switches, 'switches')
  put(signups, 'signups')

  return webPanels.parse({
    daily: (series.pageviews ?? []).map((r) => {
      const day = String(r.x).slice(0, 10)
      // Umami's series counts distinct sessions per day; used as the daily visitor figure.
      return { day, pageviews: r.y, visitors: sessions.get(day) ?? 0 }
    }),
    topPages: list(pages),
    referrers: list(refs),
    countries: list(countries),
    devices: list(devices).map((x) => ({ ...x, label: x.label.toLowerCase() })),
    funnel: FUNNEL_EVENTS.map((event) => ({ event, count: counts.get(event) ?? 0 })),
    persona: [...personas.entries()].map(([persona, x]) => ({ persona, ...x })),
    vitals: { lcp_ms: null, cls: null, inp_ms: null }, // not collected by the privacy-minimal snippet
    eventsThisMonth: null,
    eventCap: null,
  })
}

