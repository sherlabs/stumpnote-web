/**
 * Thin product-analytics seam. Events fire through here so call sites never import a provider. It is a no-op until a
 * provider registers itself on `window.__snTrack` (PostHog, S6, only after the owner picks one and consent rules allow).
 */
export type TrackEvent =
  'motion_toggle' | 'persona_switch' | 'cta_click_beta' | 'beta_form_submit' | 'outbound_app_link'

type Props = Record<string, string | number | boolean>

declare global {
  interface Window {
    __snTrack?: (event: TrackEvent, props?: Props) => void
  }
}

export function track(event: TrackEvent, props?: Props) {
  if (typeof window === 'undefined') return
  try {
    window.__snTrack?.(event, props)
  } catch {
    /* analytics must never break the page */
  }
}
