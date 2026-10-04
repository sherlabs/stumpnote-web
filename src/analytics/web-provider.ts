import 'server-only'
import { cached, TTL } from './cache'
import { fixtureWeb } from './fixtures'
import { plausibleConfigured, plausibleMissing, plausiblePanels } from './plausible'
import { umamiConfigured, umamiMissing, umamiPanels } from './umami'
import { posthogConfigured, posthogMissing, posthogPanels } from './posthog'
import { analyticsMode, type Panel } from './mode'
import { rangeDays, type Range, type WebPanels, type WebProviderId } from './types'

export const webProviderId = (): WebProviderId => {
  const v = (process.env.WEB_ANALYTICS_PROVIDER ?? '').trim().toLowerCase()
  return v === 'posthog' || v === 'plausible' || v === 'umami' ? v : 'none'
}

const livePosthog = cached(['web', 'posthog'], TTL.web, (days: number) => posthogPanels(days))
const liveUmami = cached(['web', 'umami'], TTL.web, (days: number) => umamiPanels(days))
const livePlausible = cached(['web', 'plausible'], TTL.web, (days: number) => plausiblePanels(days))

/** Provider-neutral web panels for the range. Fixtures unless ANALYTICS_MODE=live AND a provider is fully configured. */
export async function getWebPanels(range: Range): Promise<Panel<WebPanels>> {
  const days = rangeDays(range)
  if (analyticsMode() === 'fixtures')
    return { status: 'ok', source: 'fixtures', data: fixtureWeb(days) }
  const provider = webProviderId()
  try {
    if (provider === 'posthog') {
      if (!posthogConfigured()) return { status: 'unconfigured', missing: posthogMissing() }
      return { status: 'ok', source: 'live', data: await livePosthog(days) }
    }
    if (provider === 'plausible') {
      if (!plausibleConfigured()) return { status: 'unconfigured', missing: plausibleMissing() }
      return { status: 'ok', source: 'live', data: await livePlausible(days) }
    }
    if (provider === 'umami') {
      if (!umamiConfigured()) return { status: 'unconfigured', missing: umamiMissing() }
      return { status: 'ok', source: 'live', data: await liveUmami(days) }
    }
    return {
      status: 'unconfigured',
      missing: ['WEB_ANALYTICS_PROVIDER (umami, posthog or plausible)'],
    }
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'Web analytics query failed',
    }
  }
}
