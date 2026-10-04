import type { BetaState } from '@/lib/cms/home'

export type BetaCta = { label: string; href: string; external: boolean }

/**
 * The one primary call to action, driven by the Beta access global (docs/spec/02-design.md section 8).
 * Never claims availability: "appstore" only links once the owner has pasted the real URL.
 */
export function betaCta(beta: BetaState, fallbackHref = '#join'): BetaCta {
  if (beta.state === 'testflight' && beta.testflightUrl) {
    return { label: 'Join the TestFlight beta', href: beta.testflightUrl, external: true }
  }
  if (beta.state === 'appstore' && beta.appStorePlayerUrl) {
    return { label: 'Get the app', href: beta.appStorePlayerUrl, external: true }
  }
  return { label: 'Join the beta', href: fallbackHref, external: false }
}
