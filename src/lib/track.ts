/**
 * Product-analytics seam. Events fire through here so call sites never import a provider. Without a provider this is a
 * no-op. When one is configured, `AnalyticsLoader` installs a queue on `window.__snTrack` immediately and swaps in the
 * real sender once the provider has loaded after idle, so early events are not lost. Props never carry personal data.
 */
export type TrackEvent =
  | 'cta_view_hero'
  | 'cta_click_beta'
  | 'beta_form_submit'
  | 'outbound_app_link'
  | 'persona_switch'
  | 'motion_toggle'
  | 'pricing_view'
  | 'legal_view'

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
