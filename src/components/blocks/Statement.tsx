'use client'

import { useRef } from 'react'
import { Section } from '@/components/site/Section'
import { useScrollProgress } from '@/lib/motion/useScrollProgress'
import type { BlockOf } from './types'

// Loose scatter positions (percent of the section) for the drifting "lost note" fragments, md and up.
const SPOTS = [
  { x: 3, y: 4, d: 1.0 },
  { x: 38, y: 2, d: 1.6 },
  { x: 72, y: 9, d: 0.8 },
  { x: 80, y: 38, d: 1.4 },
  { x: 82, y: 62, d: 1.1 },
  { x: 62, y: 88, d: 1.8 },
  { x: 26, y: 90, d: 1.2 },
  { x: 4, y: 84, d: 0.9 },
]

/** Problem statement. Fragments drift up and dim with scroll (scrub via --p); static final state is 40% opacity. */
export function Statement({ block }: { block: BlockOf<'statement'> }) {
  const ref = useRef<HTMLDivElement>(null)
  useScrollProgress(ref, { from: 0.95, to: 0.2 })
  const words = block.text.split(' ')
  const tail = Math.max(1, Math.min(3, Math.floor(words.length / 3)))
  const lead = words.slice(0, words.length - tail).join(' ')
  const end = words.slice(words.length - tail).join(' ')
  return (
    <Section labelledBy="statement-h" className="overflow-clip">
      <div ref={ref} className="statement relative flex min-h-[56svh] items-center">
        <ul aria-hidden className="statement-frags">
          {(block.fragments ?? []).slice(0, SPOTS.length).map((f, i) => (
            <li
              key={f.id ?? i}
              className="statement-frag"
              style={
                {
                  '--x': `${SPOTS[i].x}%`,
                  '--y': `${SPOTS[i].y}%`,
                  '--d': SPOTS[i].d,
                } as React.CSSProperties
              }
            >
              {f.text}
            </li>
          ))}
        </ul>
        <h2 id="statement-h" className="display-2 relative z-10 max-w-[19ch]">
          {lead} <span className="text-muted">{end}</span>
        </h2>
      </div>
    </Section>
  )
}
