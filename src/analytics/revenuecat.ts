import 'server-only'

/**
 * RevenueCat v2 metrics overview (phase 2, optional). Until the owner supplies a read-only key this returns
 * `unconfigured` and nothing is fetched. The live call is intentionally minimal and untested against a real account.
 */
export type RevenueCatOverview = {
  metrics: Array<{ id: string; name: string; value: number; unit: string | null }>
}

export const revenueCatConfigured = (): boolean =>
  Boolean(process.env.REVENUECAT_SECRET_API_KEY && process.env.REVENUECAT_PROJECT_ID)

export const revenueCatFixture = (): RevenueCatOverview => ({
  metrics: [
    { id: 'mrr', name: 'MRR', value: 412, unit: 'USD' },
    { id: 'active_trials', name: 'Active trials', value: 47, unit: null },
    { id: 'active_subscriptions', name: 'Active subscriptions', value: 54, unit: null },
  ],
})

export async function revenueCatOverview(
  fetchImpl: typeof fetch = fetch,
): Promise<RevenueCatOverview> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10_000)
  try {
    const res = await fetchImpl(
      `https://api.revenuecat.com/v2/projects/${encodeURIComponent(process.env.REVENUECAT_PROJECT_ID as string)}/metrics/overview`,
      {
        headers: { authorization: `Bearer ${process.env.REVENUECAT_SECRET_API_KEY}` },
        signal: ctrl.signal,
        cache: 'no-store',
      },
    )
    if (!res.ok) throw new Error(`RevenueCat request failed (HTTP ${res.status})`)
    const json = (await res.json()) as {
      metrics?: Array<{ id?: string; name?: string; value?: number; unit?: string | null }>
    }
    return {
      metrics: (json.metrics ?? []).map((m) => ({
        id: String(m.id ?? ''),
        name: String(m.name ?? m.id ?? ''),
        value: Number(m.value ?? 0),
        unit: m.unit ?? null,
      })),
    }
  } finally {
    clearTimeout(timer)
  }
}
