'use client'

import { Badge } from '@/components/ui/Badge'
import { useReveal } from '@/lib/motion/useReveal'
import { cn } from '@/lib/cn'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

const SLOTS: Array<{ n: number; role: string; tag?: string }> = [
  { n: 1, role: 'Opener' },
  { n: 2, role: 'Opener' },
  { n: 3, role: 'Number 3', tag: 'C' },
  { n: 4, role: 'Middle order' },
  { n: 5, role: 'Middle order' },
  { n: 6, role: 'All-rounder', tag: 'VC' },
  { n: 7, role: 'Keeper' },
  { n: 8, role: 'Spinner' },
  { n: 9, role: 'Seamer' },
  { n: 10, role: 'Seamer' },
  { n: 11, role: 'Seamer' },
  { n: 12, role: 'Twelfth' },
]

/** Squad of twelve (3x4), staggering in. Roles only: no names, so nothing here can be a real person. Team accent by default. */
export function SquadGrid({ reducedMotion, persona = 'team', className }: SignatureProps) {
  const { ref } = useReveal<HTMLDivElement>(0.25)
  return (
    <div
      ref={ref}
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('flex w-full max-w-[520px] flex-col gap-4', className)}
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow">Squad</p>
        <Badge status="In the beta" />
      </div>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" aria-label="Squad of twelve, sample roles">
        {SLOTS.map((s, i) => (
          <li
            key={s.n}
            data-reveal="idle"
            data-reveal-style="scale"
            style={{ '--i': i, '--stagger': '30ms' } as React.CSSProperties}
            className="relative flex aspect-[4/3] flex-col justify-between rounded-2 border border-[var(--hairline-2)] bg-surface p-3"
          >
            <span className="flex items-start justify-between">
              <span className="font-display text-[22px] font-black leading-none tracking-[-0.04em] text-text mono-num">{s.n}</span>
              {s.tag && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-canvas">{s.tag}</span>
              )}
            </span>
            <span className="text-[12px] font-semibold leading-tight text-muted">{s.role}</span>
          </li>
        ))}
      </ul>
      <p className="eyebrow">Sample squad. Roles only.</p>
    </div>
  )
}
