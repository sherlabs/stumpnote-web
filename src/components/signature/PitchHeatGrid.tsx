'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { useReveal } from '@/lib/motion/useReveal'
import { cn } from '@/lib/cn'
import { rng, staticAttr } from './types'
import type { SignatureProps } from './types'

const LENGTHS = ['Full', 'Good', 'Short'] as const
const LINES = ['Off', 'Stumps', 'Leg'] as const
const LINE_WORDS = { Off: 'outside off', Stumps: 'on the stumps', Leg: 'on the leg side' } as const

/** Synthetic share of dismissals per cell. The default seed lands the peak on good length, outside off. */
export function pitchData(seed: number): number[] {
  const r = rng(seed)
  const raw = Array.from({ length: 9 }, () => 0.35 + r() * 0.65)
  raw[3] = 1.9 // Good length (row 1), Off (col 0)
  const sum = raw.reduce((a, b) => a + b, 0)
  return raw.map((v) => v / sum)
}

/**
 * 3x3 pitch map: lengths (Full, Good, Short) by lines (Off, Stumps, Leg). Every cell carries its percentage as real
 * text and is focusable. Cells fill in reading order on view; the peak cell pulses once. Always labelled sample data.
 */
export function PitchHeatGrid({ seed = 7, reducedMotion, persona, className }: SignatureProps) {
  const values = useMemo(() => pitchData(seed), [seed])
  const max = Math.max(...values)
  const peak = values.indexOf(max)
  const { ref, replay } = useReveal<HTMLDivElement>(0.3)
  const pct = (v: number) => Math.round(v * 100)
  const peakLen = LENGTHS[Math.floor(peak / 3)]
  const peakLine = LINES[peak % 3]
  return (
    <figure
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('flex w-full max-w-[440px] flex-col gap-4', className)}
    >
      <div className="flex items-center justify-between">
        <figcaption className="eyebrow">Pitch map · dismissals</figcaption>
        <Badge status="Preview" />
      </div>
      <div ref={ref} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2" data-heat>
        <span aria-hidden />
        <div className="grid grid-cols-3 gap-2 text-center">
          {LINES.map((l) => (
            <span key={l} className="eyebrow">
              {l}
            </span>
          ))}
        </div>
        {LENGTHS.map((len, row) => (
          <div key={len} className="contents">
            <span className="eyebrow flex items-center [writing-mode:horizontal-tb] pr-1">{len}</span>
            <div className="grid grid-cols-3 gap-2">
              {LINES.map((line, col) => {
                const i = row * 3 + col
                const v = values[i]
                const isPeak = i === peak
                return (
                  <button
                    key={line}
                    type="button"
                    data-reveal="idle"
                    data-reveal-style="scale"
                    data-peak={isPeak ? '' : undefined}
                    aria-label={`${len} length, ${line}: ${pct(v)}% of dismissals`}
                    style={
                      {
                        '--v': (v / max).toFixed(3),
                        '--i': i,
                        '--stagger': '70ms',
                      } as React.CSSProperties
                    }
                    className="heat-cell relative grid aspect-square place-items-center rounded-2 border border-[var(--hairline-2)] text-[15px] font-semibold text-text mono-num data-[peak]:text-canvas transition-[border-color] hover:border-[var(--hairline-3)]"
                  >
                    {pct(v)}%
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="body-sm text-body">
        Most dismissals: <strong className="font-semibold text-text">{peakLen.toLowerCase()} length, {LINE_WORDS[peakLine]}</strong>.
      </p>
      <div className="flex items-center justify-between">
        <p className="eyebrow">Sample data</p>
        <button
          type="button"
          onClick={replay}
          className="body-sm text-muted underline underline-offset-4 hover:text-text"
        >
          Replay
        </button>
      </div>
    </figure>
  )
}
