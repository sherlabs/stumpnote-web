import { cn } from '@/lib/cn'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

/**
 * NEW asset (not an existing brand mark): three stumps, two bails. The bails lift, spin and drop to the ground
 * (CSS only, once). Motion off or no JS: the bails already lie on the ground ("Bowled."). Used on the 404 page.
 */
export function BailsLoader({
  reducedMotion,
  persona,
  className,
  replayKey,
}: SignatureProps & { replayKey?: number }) {
  return (
    <svg
      key={replayKey}
      viewBox="0 0 120 96"
      role="img"
      aria-label="Three stumps with both bails knocked off"
      data-bails
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('bails block h-auto w-full overflow-visible', className)}
    >
      <line x1="2" y1="88" x2="118" y2="88" stroke="var(--hairline-3)" strokeWidth="1.5" strokeLinecap="round" />
      {[24, 55, 86].map((x) => (
        <rect key={x} x={x - 5} y="22" width="10" height="66" rx="3" fill="var(--text)" />
      ))}
      <g className="bail bail-a">
        <rect x="21" y="15" width="30" height="5" rx="2.5" fill="var(--accent)" />
      </g>
      <g className="bail bail-b">
        <rect x="58" y="15" width="30" height="5" rx="2.5" fill="var(--accent)" />
      </g>
    </svg>
  )
}
