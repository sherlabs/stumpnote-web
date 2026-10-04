import 'server-only'
import { addDays, todayUtc } from './dates'
import { int } from './util'
import { RateLimitedError } from './posthog'
import { webPanels, type WebPanels } from './types'

/**
 * Plausible Stats API v2 adapter (same panel shapes as PostHog). Plausible has no free plan, so this stays inactive
 * unless the owner picks it (D-06). The request shape follows the v2 query docs and has NOT been exercised against a
 * live account: verify once when the account exists.
 */
export const plausibleConfigured = (): boolean =>
  Boolean(
    process.env.PLAUSIBLE_SITE_ID &&
    process.env.PLAUSIBLE_API_KEY &&
    process.env.PLAUSIBLE_API_HOST,
  )

export const plausibleMissing = (): string[] =>
  ['PLAUSIBLE_SITE_ID', 'PLAUSIBLE_API_KEY', 'PLAUSIBLE_API_HOST'].filter((k) => !process.env[k])

type Row = { dimensions: Array<string | number>; metrics: number[] }

async function query(body: Record<string, unknown>, fetchImpl: typeof fetch): Promise<Row[]> {
  const host = (process.env.PLAUSIBLE_API_HOST as string).replace(/\/+$/, '')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10_000)
  try {
    const res = await fetchImpl(`${host}/api/v2/query`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
      },
      body: JSON.stringify({ site_id: process.env.PLAUSIBLE_SITE_ID, ...body }),
      signal: ctrl.signal,
      cache: 'no-store',
    })
    if (res.status === 429) {
      const ra = Number(res.headers.get('retry-after'))
      throw new RateLimitedError(Number.isFinite(ra) && ra > 0 ? ra : null)
    }
    if (!res.ok) throw new Error(`Plausible query failed (HTTP ${res.status})`)
    const json = (await res.json()) as { results?: Row[] }
    return json.results ?? []
  } finally {
    clearTimeout(timer)
  }
}

const EVENTS = ['cta_view_hero', 'cta_click_beta', 'beta_form_submit', 'outbound_app_link'] as const

export async function plausiblePanels(
  days: number,
  fetchImpl: typeof fetch = fetch,
): Promise<WebPanels> {
  const d = int(days, 1, 365)
  const today = todayUtc()
  const date_range = [addDays(today, -(d - 1)), today]
  const dim = (dimension: string, limit: number) =>
    query(
      {
        metrics: ['pageviews'],
        date_range,
        dimensions: [dimension],
        order_by: [['pageviews', 'desc']],
        pagination: { limit },
      },
      fetchImpl,
    )

  const [daily, pages, sources, countries, devices] = await Promise.all([
    query({ metrics: ['pageviews', 'visitors'], date_range, dimensions: ['time:day'] }, fetchImpl),
    dim('event:page', 15),
    dim('visit:source', 10),
    dim('visit:country', 10),
    dim('visit:device', 10),
  ])
  const funnel = await Promise.all(
    EVENTS.map(async (event) => {
      const r = await query(
        { metrics: ['events'], date_range, filters: [['is', 'event:goal', [event]]] },
        fetchImpl,
      )
      return { event, count: r[0]?.metrics[0] ?? 0 }
    }),
  )
  const personaRows = (goal: string) =>
    query(
      {
        metrics: ['events'],
        date_range,
        dimensions: ['event:props:persona'],
        filters: [['is', 'event:goal', [goal]]],
      },
      fetchImpl,
    )
  const [switches, signups] = await Promise.all([
    personaRows('persona_switch'),
    personaRows('beta_form_submit'),
  ])
  const personas = new Map<string, { switches: number; signups: number }>()
  for (const r of switches) {
    const k = String(r.dimensions[0] || 'unknown')
    personas.set(k, { switches: r.metrics[0] ?? 0, signups: personas.get(k)?.signups ?? 0 })
  }
  for (const r of signups) {
    const k = String(r.dimensions[0] || 'unknown')
    personas.set(k, { switches: personas.get(k)?.switches ?? 0, signups: r.metrics[0] ?? 0 })
  }
  const list = (rows: Row[]) =>
    rows.map((r) => ({ label: String(r.dimensions[0] || '(unknown)'), value: r.metrics[0] ?? 0 }))
  return webPanels.parse({
    daily: daily.map((r) => ({
      day: String(r.dimensions[0]).slice(0, 10),
      pageviews: r.metrics[0] ?? 0,
      visitors: r.metrics[1] ?? 0,
    })),
    topPages: list(pages),
    referrers: list(sources),
    countries: list(countries),
    devices: list(devices).map((x) => ({ ...x, label: x.label.toLowerCase() })),
    funnel,
    persona: [...personas.entries()].map(([persona, x]) => ({ persona, ...x })),
    vitals: { lcp_ms: null, cls: null, inp_ms: null }, // Plausible does not collect web vitals
    eventsThisMonth: null,
    eventCap: null,
  })
}
