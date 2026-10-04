import 'server-only'

/** `fixtures` (default, also when unset or anything else) serves synthetic data; only the exact value `live` goes live. */
export type AnalyticsMode = 'fixtures' | 'live'
export const analyticsMode = (): AnalyticsMode =>
  process.env.ANALYTICS_MODE?.trim().toLowerCase() === 'live' ? 'live' : 'fixtures'

export type Panel<T> =
  | { status: 'ok'; source: 'fixtures' | 'live'; data: T }
  | { status: 'unconfigured'; missing: string[] }
  | { status: 'error'; message: string }
