import { afterEach, describe, expect, it } from 'vitest'
import { canSeeAnalytics, isThrottled, THROTTLE_LIMIT } from '@/analytics/access'
import { analyticsCsp, clientAnalytics } from '@/lib/analytics-config'

describe('throttle', () => {
  it('allows up to the limit per rolling minute and blocks at it', () => {
    expect(THROTTLE_LIMIT).toBe(30)
    expect(isThrottled(0)).toBe(false)
    expect(isThrottled(29)).toBe(false)
    expect(isThrottled(30)).toBe(true)
    expect(isThrottled(500)).toBe(true)
  })
})

describe('role gate helper', () => {
  it('only admins see tiles and nav links', () => {
    expect(canSeeAnalytics({ roles: ['admin'] })).toBe(true)
    expect(canSeeAnalytics({ roles: ['editor'] })).toBe(false)
    expect(canSeeAnalytics({ roles: ['viewer'] })).toBe(false)
    expect(canSeeAnalytics(null)).toBe(false)
    expect(canSeeAnalytics(undefined)).toBe(false)
  })
})

const setMode = (v: string) => {
  ;(process.env as Record<string, string | undefined>).ANALYTICS_MODE = v
}

describe('analytics mode', () => {
  const orig = process.env.ANALYTICS_MODE
  afterEach(async () => {
    if (orig === undefined) delete process.env.ANALYTICS_MODE
    else setMode(orig)
  })
  it('defaults to fixtures; only the exact value live goes live', async () => {
    const { analyticsMode } = await import('@/analytics/mode')
    delete process.env.ANALYTICS_MODE
    expect(analyticsMode()).toBe('fixtures')
    setMode('')
    expect(analyticsMode()).toBe('fixtures')
    setMode('prod')
    expect(analyticsMode()).toBe('fixtures')
    setMode('live')
    expect(analyticsMode()).toBe('live')
  })
})

describe('site snippet selection (cookieless, one provider, opt-in)', () => {
  it('loads nothing unless a provider is chosen and its public values are set', () => {
    expect(clientAnalytics({})).toBeNull()
    expect(clientAnalytics({ WEB_ANALYTICS_PROVIDER: 'none' })).toBeNull()
    expect(clientAnalytics({ WEB_ANALYTICS_PROVIDER: 'posthog' })).toBeNull()
    expect(
      clientAnalytics({
        WEB_ANALYTICS_PROVIDER: 'nouance-plugin',
        NEXT_PUBLIC_POSTHOG_KEY: 'k',
        NEXT_PUBLIC_POSTHOG_HOST: 'https://h',
      }),
    ).toBeNull()
    expect(
      clientAnalytics({
        WEB_ANALYTICS_PROVIDER: 'posthog',
        NEXT_PUBLIC_POSTHOG_KEY: 'k',
        NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com/',
      }),
    ).toEqual({ provider: 'posthog', token: 'k', host: 'https://eu.i.posthog.com' })
    expect(
      clientAnalytics({
        WEB_ANALYTICS_PROVIDER: 'plausible',
        PLAUSIBLE_SITE_ID: 'a.test',
        PLAUSIBLE_API_HOST: 'https://plausible.io',
      }),
    ).toEqual({ provider: 'plausible', domain: 'a.test', host: 'https://plausible.io' })
  })
  it('server-only keys never appear in the client config', () => {
    const c = clientAnalytics({
      WEB_ANALYTICS_PROVIDER: 'posthog',
      NEXT_PUBLIC_POSTHOG_KEY: 'pub',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://h',
      POSTHOG_PERSONAL_API_KEY: 'secret',
      PLAUSIBLE_API_KEY: 'secret2',
    })
    expect(JSON.stringify(c)).not.toContain('secret')
  })
  it('adds CSP origins only for the configured provider', () => {
    expect(analyticsCsp({})).toEqual({ connect: [], script: [] })
    const ph = analyticsCsp({
      WEB_ANALYTICS_PROVIDER: 'posthog',
      NEXT_PUBLIC_POSTHOG_KEY: 'k',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com',
    })
    expect(ph.connect).toEqual(['https://eu.i.posthog.com'])
    expect(ph.script).toEqual(['https://eu-assets.i.posthog.com'])
    const pl = analyticsCsp({
      WEB_ANALYTICS_PROVIDER: 'plausible',
      PLAUSIBLE_SITE_ID: 'a',
      PLAUSIBLE_API_HOST: 'https://plausible.io',
    })
    expect(pl).toEqual({ connect: ['https://plausible.io'], script: ['https://plausible.io'] })
  })
})
