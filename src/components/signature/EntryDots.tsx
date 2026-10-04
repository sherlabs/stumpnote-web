'use client'

import { useMemo } from 'react'
import { MStroke } from './MStroke'
import { useReveal } from '@/lib/motion/useReveal'
import { cn } from '@/lib/cn'
import { rng, staticAttr } from './types'
import type { SignatureProps } from './types'

/** Journal entries landing around the M, one dot per entry, on two loose rings. Deterministic by seed. */
export function EntryDots({
  seed = 3,
  count = 28,
  reducedMotion,
  persona,
  className,
}: SignatureProps & { count?: number }) {
  const { ref } = useReveal<HTMLDivElement>(0.3)
  const dots = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }, (_, i) => {
      const ring = i % 2 === 0 ? 118 : 158
      const a = (i / count) * Math.PI * 2 + r() * 0.35
      const jitter = (r() - 0.5) * 22
      return {
        x: 200 + Math.cos(a) * (ring + jitter),
        y: 200 + Math.sin(a) * (ring + jitter),
        r: 2.5 + r() * 3.2,
        o: 0.4 + r() * 0.6,
      }
    })
  }, [seed, count])
  return (
    <div
      ref={ref}
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('relative mx-auto aspect-square w-full max-w-[420px]', className)}
      role="img"
      aria-label={`The StumpNote M surrounded by ${count} journal entries`}
    >
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="200" cy="200" r="118" fill="none" stroke="var(--hairline-2)" />
        <circle cx="200" cy="200" r="158" fill="none" stroke="var(--hairline-1)" />
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill="var(--accent)"
            opacity={d.o}
            data-reveal="idle"
            data-reveal-style="scale"
            style={
              {
                '--i': i,
                '--stagger': '45ms',
                transformBox: 'fill-box',
                transformOrigin: 'center',
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2">
        <MStroke mode="static" reducedMotion={reducedMotion} />
      </div>
    </div>
  )
}
