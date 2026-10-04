'use client'

import { forwardRef, useId } from 'react'
import { MARK_CENTRELINE, MARK_PATHS, MARK_VIEWBOX } from './mark-paths'
import { cn } from '@/lib/cn'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

type Mode = 'static' | 'paint' | 'loop' | 'scrub'

type Props = SignatureProps & {
  /** static: complete mark. paint: brush paints on once (CSS, no JS). loop: 2.4s loader cycle. scrub: driven by --p (0..1). */
  mode?: Mode
  /** Seconds before the paint starts. */
  delay?: number
  /** loop mode only: pause control. */
  paused?: boolean
  /** scrub mode initial progress (the parent updates the --p custom property on the svg element). */
  progress?: number
  title?: string
}

/**
 * The StumpNote "M" painted along its brush centreline. The five fill paths sit inside a mask whose only content is
 * one round-capped stroke; dashoffset is the paint. Pure CSS animation: nothing here waits for hydration, and
 * motion-off (or no JS) shows the complete mark.
 */
export const MStroke = forwardRef<SVGSVGElement, Props>(function MStroke(
  { mode = 'static', delay = 0, paused, progress, reducedMotion, persona, className, title },
  ref,
) {
  const uid = useId().replace(/:/g, '')
  const mask = `m-${uid}`
  const clip = `c-${uid}`
  const grad = `g-${uid}`
  const shine = `s-${uid}`
  const style =
    mode === 'scrub'
      ? // An explicit progress wins; otherwise inherit --p from an ancestor (the page scrubs it).
        progress === undefined
        ? undefined
        : ({ '--p': progress } as React.CSSProperties)
      : delay
        ? ({ '--mdelay': `${delay}s` } as React.CSSProperties)
        : undefined
  return (
    <svg
      ref={ref}
      viewBox={MARK_VIEWBOX}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-mstroke
      data-mode={mode}
      data-paused={paused ? '' : undefined}
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      style={style}
      className={cn('mstroke block h-auto w-full overflow-visible', className)}
    >
      <defs>
        <linearGradient id={grad} gradientUnits="userSpaceOnUse" x1="92" y1="80" x2="160" y2="158">
          <stop offset="0" style={{ stopColor: 'var(--accent-hi)' }} />
          <stop offset="1" style={{ stopColor: 'var(--accent)' }} />
        </linearGradient>
        <linearGradient id={shine} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.7" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="60" y="56" width="130" height="130">
          <path
            d={MARK_CENTRELINE}
            pathLength={1}
            fill="none"
            stroke="white"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mstroke-brush"
          />
        </mask>
        <clipPath id={clip}>
          {MARK_PATHS.map((p, i) => (
            <path key={i} d={p.d} />
          ))}
        </clipPath>
      </defs>
      <g mask={`url(#${mask})`} className="mstroke-ink">
        {MARK_PATHS.map((p, i) => (
          <path key={i} d={p.d} fill={`url(#${grad})`} opacity={p.opacity} />
        ))}
        {(mode === 'paint' || mode === 'loop') && (
          <g clipPath={`url(#${clip})`}>
            <rect
              x="-40"
              y="60"
              width="34"
              height="130"
              fill={`url(#${shine})`}
              className="mstroke-shine"
            />
          </g>
        )}
      </g>
    </svg>
  )
})

/** Static flat M for "AI" labels (inner fold at .6). Colour follows currentColor. */
export function AiMark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={MARK_VIEWBOX}
      width={size}
      height={Math.round(size * 1.017)}
      fill="currentColor"
      className={cn('inline-block shrink-0', className)}
    >
      {MARK_PATHS.map((p, i) => (
        <path key={i} d={p.d} opacity={p.opacity} />
      ))}
    </svg>
  )
}
