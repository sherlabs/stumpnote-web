'use client'

import { Mic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { cn } from '@/lib/cn'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

const NOTE =
  'Net session, felt good against the short ball. My front foot was late in the last ten minutes. I want to stay side-on and trust my hands.'
const CHIPS = ['Batting', 'Timing', 'Focus: front foot']

/**
 * A voice note that types itself out, then settles into a structured entry. Full text is always in the DOM for
 * assistive tech and for no-motion visitors. Sample copy.
 */
export function VoiceNoteTyper({ text = NOTE, reducedMotion, persona, className }: SignatureProps & { text?: string }) {
  const osReduced = useReducedMotion()
  const off = reducedMotion || osReduced
  const ref = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)
  const [go, setGo] = useState(false)
  const finished = off || n >= text.length

  useEffect(() => {
    const el = ref.current
    if (!el || off) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setGo(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [off])

  useEffect(() => {
    if (!go || off || n >= text.length) return
    const t = window.setTimeout(() => setN((v) => Math.min(v + 2, text.length)), 34)
    return () => window.clearTimeout(t)
  }, [go, off, n, text.length])

  const shown = go && !off ? text.slice(0, n) : text
  const typing = go && !off && !finished

  return (
    <div
      ref={ref}
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('flex w-full max-w-[460px] flex-col gap-4 rounded-3 border border-[var(--hairline-2)] bg-surface p-5', className)}
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow flex items-center gap-2">
          <Mic aria-hidden size={14} />
          Voice note
        </p>
        <Badge status="Preview" />
      </div>
      <div aria-hidden className="flex h-8 items-center gap-[3px]" data-typing={typing ? '' : undefined}>
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className="vnt-bar w-[3px] rounded-full bg-accent"
            style={{ '--d': `${(i * 83) % 700}ms`, '--h': `${30 + ((i * 37) % 70)}%` } as React.CSSProperties}
          />
        ))}
      </div>
      <p className="sr-only">{text}</p>
      <p aria-hidden className="min-h-[7.5em] text-[17px] leading-[1.55] text-text">
        {shown}
        {typing && <span className="vnt-caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-accent" />}
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="Entry created">
        {CHIPS.map((c, i) => (
          <li
            key={c}
            data-done={finished ? '' : undefined}
            style={{ '--i': i } as React.CSSProperties}
            className="vnt-chip rounded-full border border-[var(--hairline-3)] bg-[var(--hairline-1)] px-3 py-1 text-[13px] font-semibold text-text"
          >
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}
