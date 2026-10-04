'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { EntryDots } from '@/components/signature/EntryDots'
import { MStroke } from '@/components/signature/MStroke'
import { PitchHeatGrid } from '@/components/signature/PitchHeatGrid'
import { VoiceNoteTyper } from '@/components/signature/VoiceNoteTyper'
import { Section } from '@/components/site/Section'
import { Overline } from '@/components/ui/Overline'
import { useScrollProgress } from '@/lib/motion/useScrollProgress'
import { cn } from '@/lib/cn'
import type { BlockOf } from './types'

type Chapter = BlockOf<'chapter'>

function ActionCard({ scenario }: { scenario?: Chapter['scenario'] }) {
  return (
    <div className="flex w-full max-w-[460px] flex-col gap-5 rounded-3 border border-[var(--hairline-2)] bg-surface p-6">
      <p className="eyebrow">Today&apos;s focus</p>
      <p className="display-3 text-text">
        {scenario?.text ? scenario.text : 'One thing to work on today.'}
      </p>
      <p className="eyebrow !text-muted">
        Illustrative scenario{scenario?.persona ? ` · ${scenario.persona}` : ''}
      </p>
    </div>
  )
}

function StageFor({ index, scenario }: { index: number; scenario?: Chapter['scenario'] }) {
  switch (index) {
    case 0:
      return <VoiceNoteTyper />
    case 1:
      return <EntryDots />
    case 2:
      return <PitchHeatGrid />
    default:
      return <ActionCard scenario={scenario} />
  }
}

/**
 * Pinned "How it learns" chapter. lg+ with motion on: a sticky stage swaps as each step crosses the middle of the
 * viewport (CSS sticky, D-28; layout is reserved so no CLS) and the M beside the step counter paints with scroll.
 * Everywhere else (mobile, motion off, no JS): four stacked cards, each with its own stage. Pure DOM + IntersectionObserver.
 */
export function HowItLearns({ block }: { block: Chapter }) {
  const steps = block.steps ?? []
  const [active, setActive] = useState(0)
  // Bumped each time a stage becomes active, so its intro (typing, dots landing) plays again.
  const [plays, setPlays] = useState<number[]>(() => steps.map(() => 0))
  const grid = useRef<HTMLDivElement>(null)
  const stepEls = useRef<Array<HTMLLIElement | null>>([])
  useScrollProgress(grid, { from: 0.8, to: 0.2 })

  useEffect(() => {
    const els = stepEls.current.filter(Boolean) as HTMLLIElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.step)
            setActive((cur) => {
              if (cur !== i) setPlays((p) => p.map((n, k) => (k === i ? n + 1 : n)))
              return i
            })
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [steps.length])

  const stage = (i: number): ReactNode => (
    <div key={`${i}-${plays[i]}`} className="grid w-full place-items-center">
      <StageFor index={i} scenario={block.scenario} />
    </div>
  )

  return (
    <Section id={block.anchor ?? 'how-it-learns'} labelledBy="learn-h">
      <div className="flex flex-col gap-5">
        {block.overline && <Overline>{block.overline}</Overline>}
        <h2 id="learn-h" className="display-2 max-w-[14ch]">
          {block.title}
        </h2>
        {block.body && <p className="body-lg measure max-w-[48ch]">{block.body}</p>}
      </div>

      <div ref={grid} className="learn-grid mt-12 lg:mt-20">
        <div className="learn-pinned">
          <div className="learn-stage">
            <div className="learn-stage-head">
              <div className="w-10" aria-hidden>
                <MStroke mode="scrub" />
              </div>
              <p className="eyebrow mono-num" aria-hidden>
                {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')} ·{' '}
                {steps[active]?.title}
              </p>
            </div>
            <div className="learn-stage-body">
              {steps.map((s, i) => (
                <div
                  key={s.id ?? i}
                  className={cn('learn-layer', i === active && 'is-active')}
                  aria-hidden={i === active ? undefined : true}
                  {...(i === active ? {} : { inert: true })}
                >
                  {stage(i)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ol className="learn-steps">
          {steps.map((s, i) => (
            <li
              key={s.id ?? i}
              ref={(el) => {
                stepEls.current[i] = el
              }}
              data-step={i}
              data-active={i === active ? '' : undefined}
              className="learn-step"
              style={{ '--i': i } as CSSProperties}
            >
              <div className="learn-card">
                <p className="eyebrow mono-num">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="display-3 mt-4">{s.title}</h3>
                <p className="mt-4 text-[17px] leading-[1.6] text-body">{s.text}</p>
                <div className="learn-inline mt-8">
                  <StageFor index={i} scenario={block.scenario} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
