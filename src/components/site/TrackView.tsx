/** Marks "this page was viewed" for TrackClicks' IntersectionObserver. Server component, renders an empty hidden marker. */
export function TrackView({
  event,
  slug,
}: {
  event: 'pricing_view' | 'legal_view' | 'cta_view_hero'
  slug?: string
}) {
  return <span hidden data-track-view={event} data-track-slug={slug} />
}
