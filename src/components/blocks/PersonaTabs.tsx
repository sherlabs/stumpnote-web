'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { usePersona } from '@/components/site/PersonaProvider'
import { Section } from '@/components/site/Section'
import { Overline } from '@/components/ui/Overline'
import { PERSONA_TABS } from '@/content/home-fallbacks'
import type { PersonaTab } from '@/content/home-fallbacks'
import { isRouteReady } from '@/lib/site-config'
import { cn } from '@/lib/cn'
import type { Persona } from '@/payload-types'
import type { BlockOf } from './types'

type CmsPersona = Pick<Persona, 'title' | 'slug' | 'accent' | 'headline'> & {
  proofPoints?: Array<{ text?: string | null }> | null
}

function fromCms(docs: Array<number | Persona>): PersonaTab[] {
  return docs
    .filter((d): d is Persona & CmsPersona => typeof d === 'object' && d !== null)
    .map((d) => ({
      id: d.slug,
      label: d.title,
      accent: (d.accent ?? 'player') as PersonaTab['accent'],
      headline: d.headline ?? d.title,
      proof: (d.proofPoints ?? []).map((p) => p.text ?? '').filter(Boolean),
      href: `/${d.slug}`,
      linkLabel: `See the ${d.title} page`,
    }))
}

/**
 * "Who it's for" tabs. Neutral tab styling (selected = brighter, never accent-filled). Selecting a tab re-themes the
 * whole page through PersonaProvider; the page accent also moves the selected tab when a hero chip is used.
 */
export function PersonaTabs({ block }: { block: BlockOf<'persona-tabs'> }) {
  const cms = block.personas?.length ? fromCms(block.personas) : []
  const tabs = cms.length ? cms : PERSONA_TABS
  const { persona, setPersona } = usePersona()
  const [selected, setSelected] = useState(0)
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  // The selected tab follows the page persona when a hero chip changed it (derived, no effect needed).
  const active =
    tabs[selected]?.accent === persona
      ? selected
      : Math.max(
          0,
          tabs.findIndex((t) => t.accent === persona),
        )

  const select = (i: number, focus = false) => {
    setSelected(i)
    setPersona(tabs[i].accent)
    if (focus) refs.current[i]?.focus()
  }
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = tabs.length
    if (e.key === 'ArrowRight') select((i + 1) % n, true)
    else if (e.key === 'ArrowLeft') select((i - 1 + n) % n, true)
    else if (e.key === 'Home') select(0, true)
    else if (e.key === 'End') select(n - 1, true)
    else return
    e.preventDefault()
  }
  const t = tabs[Math.min(active, tabs.length - 1)]

  return (
    <Section id="personas" labelledBy="personas-h">
      <div className="flex flex-col gap-4">
        {block.overline && <Overline>{block.overline}</Overline>}
        <h2 id="personas-h" className="display-2 max-w-[16ch]">
          {block.heading}
        </h2>
      </div>
      <div className="mt-10 lg:mt-14">
        <div
          role="tablist"
          aria-label="Who StumpNote is for"
          className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none]"
        >
          {tabs.map((tab, i) => {
            const on = i === active
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  refs.current[i] = el
                }}
                role="tab"
                id={`ptab-${tab.id}`}
                aria-selected={on}
                aria-controls="ptab-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  'min-h-11 shrink-0 rounded-full border px-5 text-[15px] font-semibold transition-colors duration-[var(--dur-1)]',
                  on
                    ? 'border-[var(--hairline-3)] bg-[var(--hairline-2)] text-text'
                    : 'border-transparent text-muted hover:text-text',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <div
          role="tabpanel"
          id="ptab-panel"
          aria-labelledby={`ptab-${t.id}`}
          className="persona-panel relative mt-6 overflow-hidden rounded-3 border border-[var(--hairline-2)] bg-surface p-7 md:p-12"
        >
          <div aria-hidden className="persona-orb" />
          <div
            key={t.id}
            className="persona-swap relative grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16"
          >
            <h3 className="display-3 max-w-[16ch] lg:max-w-[14ch]">{t.headline}</h3>
            <div className="flex flex-col gap-6">
              <ul className="flex flex-col gap-4">
                {t.proof.map((p) => (
                  <li key={p} className="flex gap-3 text-[17px] leading-[1.5] text-body">
                    <Check
                      aria-hidden
                      size={18}
                      strokeWidth={2.5}
                      className="mt-[5px] shrink-0 text-accent-text"
                    />
                    {p}
                  </li>
                ))}
              </ul>
              {isRouteReady(t.href) && (
                <Link
                  href={t.href}
                  className="group/link inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-semibold text-text underline decoration-[var(--hairline-3)] underline-offset-[6px] hover:decoration-current"
                >
                  {t.linkLabel}
                  <ArrowRight
                    aria-hidden
                    size={16}
                    className="transition-transform group-hover/link:translate-x-0.5"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
