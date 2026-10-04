'use client'

import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AiMark } from './MStroke'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { cn } from '@/lib/cn'
import { DEFAULT_SCRIPT, parseScript } from './transcript'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

const WORDS_PER_SECOND = 2.8

/**
 * Text-only key-phrase transcript. Starts when half in view, at a reading pace, never plays audio. Without motion
 * (or JS) all text is visible and the beats are simply emphasised. Required AI disclosure sits under the text.
 */
export { DEFAULT_SCRIPT }

export function KineticTranscript({
  script = DEFAULT_SCRIPT,
  reducedMotion,
  persona,
  className,
}: SignatureProps & { script?: string[] }) {
  const words = useMemo(() => parseScript(script), [script])
  const osReduced = useReducedMotion()
  const off = reducedMotion || osReduced
  const rootRef = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const done = idx >= words.length - 1

  // start when 50% in view
  useEffect(() => {
    const el = rootRef.current
    if (!el || off || started) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true)
          setPlaying(true)
          io.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [off, started])

  useEffect(() => {
    if (!playing || off || done) return
    const t = window.setInterval(
      () => setIdx((i) => Math.min(i + 1, words.length - 1)),
      1000 / WORDS_PER_SECOND,
    )
    return () => window.clearInterval(t)
  }, [playing, off, done, words.length])

  const state = off ? 'done' : done ? 'done' : started ? 'play' : 'idle'

  return (
    <div
      ref={rootRef}
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('flex w-full max-w-[640px] flex-col gap-5', className)}
    >
      <div
        className="kt flex flex-col gap-3 font-display text-[clamp(22px,2.6vw,32px)] font-bold leading-[1.2] tracking-[-0.02em] text-body"
        data-kt={state}
      >
        {script.map((_, li) => {
          const lineWords = words.map((w, wi) => ({ w, wi })).filter(({ w }) => w.line === li)
          return (
            <p key={li}>
              {lineWords.map(({ w, wi }) => (
                <span
                  key={wi}
                  className={cn('kt-w inline-block', w.beat && 'kt-beat')}
                  data-on={wi <= idx ? '' : undefined}
                  data-now={wi === idx ? '' : undefined}
                >
                  {w.text}
                  {' '}
                </span>
              ))}
            </p>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (done) setIdx(-1)
            setStarted(true)
            setPlaying((p) => (done ? true : !p))
          }}
          disabled={off}
          aria-label={
            playing && !done ? 'Pause transcript' : done ? 'Replay transcript' : 'Play transcript'
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--hairline-3)] px-4 text-[14px] font-semibold text-text hover:bg-[var(--hairline-1)] disabled:opacity-40"
        >
          {done ? (
            <RotateCcw aria-hidden size={16} />
          ) : playing ? (
            <Pause aria-hidden size={16} />
          ) : (
            <Play aria-hidden size={16} />
          )}
          {done ? 'Replay' : playing ? 'Pause' : 'Play'}
        </button>
        <p className="body-sm flex items-center gap-2 text-muted">
          <AiMark size={14} className="text-accent-text" />
          Text only. No audio plays.
        </p>
      </div>
      <p className="body-sm text-muted">
        Created by StumpNote AI. AI can make mistakes. Not medical or psychological advice.
      </p>
    </div>
  )
}
