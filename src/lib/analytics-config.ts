/**
 * Which browser analytics snippet to load, resolved on the server from env. Only PUBLIC values reach the client
 * (PostHog project token and ingest host, Plausible site domain and script host, Umami website id and script host); server query keys never do.
 * Returns null (no snippet, no cookie, no request) unless the owner has chosen a provider AND set its public values.
 */
/** Umami Cloud serves the tracker and collects from here; self-hosters set UMAMI_SCRIPT_HOST to their own origin. */
export const UMAMI_CLOUD_SCRIPT_HOST = 'https://cloud.umami.is'

export type ClientAnalytics =
  | { provider: 'posthog'; token: string; host: string }
  | { provider: 'plausible'; domain: string; host: string }
  | { provider: 'umami'; websiteId: string; host: string }

export function clientAnalytics(
  env: Record<string, string | undefined> = process.env,
): ClientAnalytics | null {
  const provider = (env.WEB_ANALYTICS_PROVIDER ?? '').trim().toLowerCase()
  if (provider === 'posthog') {
    const token = env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
    const host = env.NEXT_PUBLIC_POSTHOG_HOST?.trim().replace(/\/+$/, '')
    return token && host ? { provider, token, host } : null
  }
  if (provider === 'umami') {
    const websiteId = env.UMAMI_WEBSITE_ID?.trim()
    const host = (env.UMAMI_SCRIPT_HOST?.trim() || UMAMI_CLOUD_SCRIPT_HOST).replace(/\/+$/, '')
    return websiteId && /^[0-9a-f-]{36}$/i.test(websiteId) && /^https:\/\/[^\s/]+$/.test(host)
      ? { provider, websiteId, host }
      : null
  }
  if (provider === 'plausible') {
    const domain = env.PLAUSIBLE_SITE_ID?.trim()
    const host = env.PLAUSIBLE_API_HOST?.trim().replace(/\/+$/, '')
    return domain && host ? { provider, domain, host } : null
  }
  return null
}

/** Extra CSP origins the chosen provider needs (connect-src and script-src). Evaluated at build time. */
export function analyticsCsp(env: Record<string, string | undefined> = process.env): {
  connect: string[]
  script: string[]
} {
  const c = clientAnalytics(env)
  if (!c) return { connect: [], script: [] }
  if (c.provider === 'plausible' || c.provider === 'umami') return { connect: [c.host], script: [c.host] }
  // posthog-js lazy-loads optional modules (web vitals) from the matching assets host.
  const assets = c.host
    .replace('://eu.i.posthog.com', '://eu-assets.i.posthog.com')
    .replace('://us.i.posthog.com', '://us-assets.i.posthog.com')
  return { connect: [c.host], script: assets !== c.host ? [assets] : [] }
}
