'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { Section } from '@/components/site/Section'
import { Badge } from '@/components/ui/Badge'
import type { BadgeLabel } from '@/components/ui/Badge'
import { Overline } from '@/components/ui/Overline'
import { FEATURE_CARDS } from '@/content/home-fallbacks'
import type { FeatureCard } from '@/content/home-fallbacks'
import { isRouteReady } from '@/lib/site-config'
import type { Feature } from '@/payload-types'
import { BlockIcon } from './icons'
import type { BlockOf } from './types'

const STATUS: Record<string, BadgeLabel> = {
  'available-web': 'Available now (web)',
  'in-beta': 'In the beta',
  preview: 'Preview',
  'coming-soon': 'Coming soon',
}
const AREA_ICON: Record<string, string> = {
  'journal-memory': 'Brain',
  'mental-game': 'Headphones',
  'game-day': 'Target',
  team: 'Users',
  coach: 'MessageCircle',
  parent: 'ShieldCheck',
  platform: 'GalleryHorizontal',
}

function fromCms(docs: Array<number | Feature>, area?: string | null): FeatureCard[] {
  return docs
    .filter((d): d is Feature => typeof d === 'object' && d !== null)
    .filter((d) => !area || area === 'all' || d.area === area)
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      benefit: d.benefit ?? '',
      status: STATUS[d.status] ?? 'In the beta',
      icon: AREA_ICON[d.area] ?? 'Mic',
    }))
}

/**
 * Scroll-snap carousel. The scroller is a focusable region (arrow keys step one card), with prev/next buttons for
 * pointer users. Icon parallax is CSS-only and gated by html[data-motion='on'] (home.css).
 */
export function FeatureCarousel({ block }: { block: BlockOf<'feature-carousel'> }) {
  const cms = block.features?.length ? fromCms(block.features, block.filterByArea) : []
  const cards = cms.length ? cms : FEATURE_CARDS
  const scroller = useRef<HTMLUListElement>(null)

  const step = useCallback((dir: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    const card = el.querySelector('li')
    const w = (card?.getBoundingClientRect().width ?? 320) + 20
    el.scrollBy({
      left: dir * w,
      behavior: document.documentElement.getAttribute('data-motion') === 'off' ? 'auto' : 'smooth',
    })
  }, [])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  return (
    <Section labelledBy="features-h" className="overflow-clip">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          {block.overline && <Overline>{block.overline}</Overline>}
          <h2 id="features-h" className="display-2 max-w-[16ch]">
            {block.heading}
          </h2>
        </div>
        <div className="flex gap-2" role="group" aria-label="Scroll features">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous features"
            className="grid h-12 w-12 place-items-center rounded-full border border-[var(--hairline-3)] text-text transition-colors hover:bg-[var(--hairline-2)]"
          >
            <ArrowLeft aria-hidden size={18} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next features"
            className="grid h-12 w-12 place-items-center rounded-full border border-[var(--hairline-3)] text-text transition-colors hover:bg-[var(--hairline-2)]"
          >
            <ArrowRight aria-hidden size={18} />
          </button>
        </div>
      </div>
      <ul
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Features"
        onKeyDown={onKey}
        className="carousel bleed mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] lg:mt-14"
      >
        {cards.map((f, n) => {
          const href = `/features/${f.slug}`
          const linked = isRouteReady(href)
          return (
            <li key={f.slug} className="feature-card snap-start">
              <article className="feature-card-inner">
                <div className="flex items-start justify-between gap-3">
                  <span className="feature-icon" aria-hidden>
                    <BlockIcon name={f.icon} size={24} />
                  </span>
                  <Badge status={f.status} />
                </div>
                <h3 className="title mt-10">{f.title}</h3>
                <p className="mt-3 text-[16px] leading-[1.5] text-body">{f.benefit}</p>
                <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                  <span aria-hidden className="feature-num mono-num">
                    {String(n + 1).padStart(2, '0')}
                  </span>
                  {linked && (
                    <Link
                      href={href}
                      className="feature-card-link inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-text"
                    >
                      Learn more
                      <ArrowRight aria-hidden size={16} />
                      <span className="absolute inset-0" aria-hidden />
                    </Link>
                  )}
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
