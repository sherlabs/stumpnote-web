import 'server-only'
import { webPanels, type WebPanels } from './types'
import { int } from './util'

/**
 * PostHog HogQL adapter (docs/spec/04 section 1). Queries are fixed strings; only the range, as a clamped integer, is
 * interpolated. Server-only: the personal API key never reaches a browser.
 */
export class RateLimitedError extends Error {
  constructor(public retryAfterSeconds: number | null) {
    super(
      'Web analytics provider rate limit reached; showing the last cached values or try again shortly.',
    )
  }
}

export const posthogConfigured = (): boolean =>
  Boolean(
    process.env.POSTHOG_PROJECT_ID &&
    process.env.POSTHOG_PERSONAL_API_KEY &&
    process.env.POSTHOG_API_HOST,
  )

export const posthogMissing = (): string[] =>
  ['POSTHOG_PROJECT_ID', 'POSTHOG_PERSONAL_API_KEY', 'POSTHOG_API_HOST'].filter(
    (k) => !process.env[k],
  )

type HogResult = { results?: unknown[][] }

async function hogql(query: string, fetchImpl: typeof fetch = fetch): Promise<unknown[][]> {
  const host = (process.env.POSTHOG_API_HOST as string).replace(/\/+$/, '')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10_000)
  try {
    const res = await fetchImpl(
      `${host}/api/projects/${encodeURIComponent(process.env.POSTHOG_PROJECT_ID as string)}/query/`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
        },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
        signal: ctrl.signal,
        cache: 'no-store',
      },
    )
    if (res.status === 429) {
      const ra = Number(res.headers.get('retry-after'))
      throw new RateLimitedError(Number.isFinite(ra) && ra > 0 ? ra : null)
    }
    if (!res.ok) throw new Error(`PostHog query failed (HTTP ${res.status})`)
    const json = (await res.json()) as HogResult
    return json.results ?? []
  } finally {
    clearTimeout(timer)
  }
}

const q = (days: number) => ({
  daily: `select toDate(timestamp) d, count() pv, count(distinct person_id) v from events where event = '$pageview' and timestamp >= now() - interval ${days} day group by d order by d`,
  pages: `select properties.$pathname p, count() c from events where event = '$pageview' and timestamp >= now() - interval ${days} day group by p order by c desc limit 15`,
  referrers: `select coalesce(nullIf(properties.$referring_domain, ''), '$direct') r, count() c from events where event = '$pageview' and timestamp >= now() - interval ${days} day group by r order by c desc limit 10`,
  countries: `select properties.$geoip_country_code k, count() c from events where event = '$pageview' and timestamp >= now() - interval ${days} day group by k order by c desc limit 10`,
  devices: `select properties.$device_type k, count() c from events where event = '$pageview' and timestamp >= now() - interval ${days} day group by k order by c desc`,
  funnel: `select event, count() c from events where event in ('cta_view_hero','cta_click_beta','beta_form_submit','outbound_app_link') and timestamp >= now() - interval ${days} day group by event`,
  persona: `select event, properties.persona p, count() c from events where event in ('persona_switch','beta_form_submit') and timestamp >= now() - interval ${days} day group by event, p`,
  vitals: `select quantile(0.75)(toFloat(properties.$web_vitals_LCP_value)) lcp, quantile(0.75)(toFloat(properties.$web_vitals_CLS_value)) cls, quantile(0.75)(toFloat(properties.$web_vitals_INP_value)) inp from events where event = '$web_vitals' and timestamp >= now() - interval ${days} day`,
  month: `select count() from events where timestamp >= toStartOfMonth(now())`,
})

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v) || 0)
const str = (v: unknown, fallback: string): string => (typeof v === 'string' && v ? v : fallback)

export async function posthogPanels(
  days: number,
  fetchImpl: typeof fetch = fetch,
): Promise<WebPanels> {
  const queries = q(int(days, 1, 365))
  // Sequential in two small batches keeps well under the provider's concurrency limit.
  const [daily, pages, referrers, countries] = await Promise.all([
    hogql(queries.daily, fetchImpl),
    hogql(queries.pages, fetchImpl),
    hogql(queries.referrers, fetchImpl),
    hogql(queries.countries, fetchImpl),
  ])
  const [devices, funnel, persona, month] = await Promise.all([
    hogql(queries.devices, fetchImpl),
    hogql(queries.funnel, fetchImpl),
    hogql(queries.persona, fetchImpl),
    hogql(queries.month, fetchImpl),
  ])
  // Web-vitals property names are unverified against live data (spec 04): a failure must not break the view.
  const vitals = await hogql(queries.vitals, fetchImpl).catch((e) => {
    if (e instanceof RateLimitedError) throw e
    return [] as unknown[][]
  })
  const v = vitals[0]
  const f = new Map(funnel.map((r) => [String(r[0]), num(r[1])]))
  const personas = new Map<string, { switches: number; signups: number }>()
  for (const r of persona) {
    const key = str(r[1], 'unknown')
    const cur = personas.get(key) ?? { switches: 0, signups: 0 }
    if (r[0] === 'persona_switch') cur.switches += num(r[2])
    if (r[0] === 'beta_form_submit') cur.signups += num(r[2])
    personas.set(key, cur)
  }
  return webPanels.parse({
    daily: daily.map((r) => ({
      day: String(r[0]).slice(0, 10),
      pageviews: num(r[1]),
      visitors: num(r[2]),
    })),
    topPages: pages.map((r) => ({ label: str(r[0], '(unknown)'), value: num(r[1]) })),
    referrers: referrers.map((r) => ({
      label: str(r[0], '(direct)').replace('$direct', '(direct)'),
      value: num(r[1]),
    })),
    countries: countries.map((r) => ({ label: str(r[0], '??'), value: num(r[1]) })),
    devices: devices.map((r) => ({ label: str(r[0], 'unknown').toLowerCase(), value: num(r[1]) })),
    funnel: ['cta_view_hero', 'cta_click_beta', 'beta_form_submit', 'outbound_app_link'].map(
      (event) => ({
        event,
        count: f.get(event) ?? 0,
      }),
    ),
    persona: [...personas.entries()].map(([p, x]) => ({ persona: p, ...x })),
    vitals: {
      lcp_ms: v && v[0] != null ? num(v[0]) : null,
      cls: v && v[1] != null ? num(v[1]) : null,
      inp_ms: v && v[2] != null ? num(v[2]) : null,
    },
    eventsThisMonth: month[0] ? num(month[0][0]) : null,
    eventCap: 1_000_000, // PostHog free tier monthly event allowance; informational only
  })
}
