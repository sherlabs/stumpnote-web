'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

const KEYS = ['0', '1', '2', '4', '6', 'W'] as const
type Ball = (typeof KEYS)[number]

const WORD: Record<Ball, string> = { '0': 'dot ball', '1': 'one run', '2': 'two runs', '4': 'four', '6': 'six', W: 'wicket' }

/** A demo of the ball-by-ball quick-log strip: tap a key to log the next ball of the over. Sample only, nothing saved. */
export function QuickLogStrip({ reducedMotion, persona, className }: SignatureProps) {
  const [balls, setBalls] = useState<Ball[]>(['1', '0', '4'])
  const [pulse, setPulse] = useState(0)
  const log = (b: Ball) => {
    setBalls((cur) => (cur.length >= 6 ? [b] : [...cur, b]))
    setPulse((n) => n + 1)
  }
  const last = balls[balls.length - 1]
  return (
    <div
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('flex w-full max-w-[460px] flex-col gap-5 rounded-3 border border-[var(--hairline-2)] bg-surface p-5', className)}
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow">This over</p>
        <Badge status="Preview" />
      </div>
      <ol className="grid grid-cols-6 gap-2" aria-label="Balls this over">
        {Array.from({ length: 6 }, (_, i) => {
          const b = balls[i]
          const isNew = i === balls.length - 1
          return (
            <li
              key={i}
              data-new={isNew ? pulse : undefined}
              className={cn(
                'qls-slot grid aspect-square place-items-center rounded-full border text-[17px] font-bold mono-num',
                b ? 'border-[var(--hairline-3)] bg-[var(--hairline-2)] text-text' : 'border-dashed border-[var(--hairline-3)] text-tertiary',
                b === 'W' && 'border-text',
              )}
            >
              {b ?? <span aria-label="not yet bowled">{'·'}</span>}
            </li>
          )
        })}
      </ol>
      <div className="grid grid-cols-6 gap-2" role="group" aria-label="Log the next ball">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => log(k)}
            aria-label={`Log ${WORD[k]}`}
            className="qls-key grid min-h-11 place-items-center rounded-2 border border-[var(--hairline-3)] bg-transparent text-[17px] font-bold text-text mono-num transition-colors hover:bg-[var(--hairline-2)] active:bg-accent active:text-canvas"
          >
            {k}
          </button>
        ))}
      </div>
      <p className="body-sm text-muted" aria-live="polite">
        Ball {balls.length} of 6 logged: {WORD[last]}. Sample data, nothing is saved.
      </p>
    </div>
  )
}
