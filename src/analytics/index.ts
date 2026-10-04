import 'server-only'
import { cached, TTL } from './cache'
import { fixtureAi, fixtureProduct } from './fixtures'
import { analyticsMode, type Panel } from './mode'
import {
  revenueCatConfigured,
  revenueCatFixture,
  revenueCatOverview,
  type RevenueCatOverview,
} from './revenuecat'
import { dbConfigured, liveAi, liveProduct } from './stumpnote-db'
import { rangeDays, type Range } from './types'

export { getWebPanels as getWeb, webProviderId } from './web-provider'
export { analyticsMode } from './mode'
export type { Panel } from './mode'

export type AiSpendData = ReturnType<typeof fixtureAi>
export type ProductData = ReturnType<typeof fixtureProduct>

const aiLive = cached(['ai'], TTL.ai, (days: number) => liveAi(days))
const productLive = cached(['product'], TTL.product, (days: number) => liveProduct(days))
const rcLive = cached(['revenuecat'], TTL.revenuecat, () => revenueCatOverview())

const dbMissing = ['STUMPNOTE_ANALYTICS_DATABASE_URL']

/** AI-spend datasets. The Postgres pool is touched only when ANALYTICS_MODE=live and the URL is set. */
export async function getAiSpend(range: Range): Promise<Panel<AiSpendData>> {
  const days = rangeDays(range)
  if (analyticsMode() === 'fixtures') return { status: 'ok', source: 'fixtures', data: fixtureAi() }
  if (!dbConfigured()) return { status: 'unconfigured', missing: dbMissing }
  try {
    return { status: 'ok', source: 'live', data: await aiLive(days) }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : 'AI-spend query failed' }
  }
}

export async function getProduct(
  range: Range,
): Promise<Panel<ProductData & { revenueCat: RevenueCatOverview | null }>> {
  const days = rangeDays(range)
  if (analyticsMode() === 'fixtures') {
    return {
      status: 'ok',
      source: 'fixtures',
      data: { ...fixtureProduct(), revenueCat: revenueCatFixture() },
    }
  }
  if (!dbConfigured()) return { status: 'unconfigured', missing: dbMissing }
  try {
    const data = await productLive(days)
    const revenueCat = revenueCatConfigured() ? await rcLive().catch(() => null) : null
    return { status: 'ok', source: 'live', data: { ...data, revenueCat } }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : 'Product query failed' }
  }
}
