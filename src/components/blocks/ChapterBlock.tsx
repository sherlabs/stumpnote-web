import { Check } from 'lucide-react'
import { Chapter } from '@/components/site/Chapter'
import { Section } from '@/components/site/Section'
import { Badge } from '@/components/ui/Badge'
import type { BadgeLabel } from '@/components/ui/Badge'
import { Overline } from '@/components/ui/Overline'
import { TextLink } from '@/components/ui/TextLink'
import { isRouteReady } from '@/lib/site-config'
import { HowItLearns } from './HowItLearns'
import { ScenarioCard, stageFor } from './stage'
import type { BlockOf } from './types'

type ChapterData = BlockOf<'chapter'>

const BADGE: Record<string, BadgeLabel> = {
  'available-web': 'Available now (web)',
  'in-beta': 'In the beta',
  preview: 'Preview',
  'coming-soon': 'Coming soon',
}

/** Generic storytelling chapter: copy column plus a live signature stage. `learn-stage` is the pinned chapter. */
export function ChapterBlock({ block }: { block: ChapterData }) {
  if (block.demo === 'learn-stage') return <HowItLearns block={block} />
  const scoped = block.persona && block.persona !== 'inherit' ? block.persona : undefined
  const badge = block.badge && block.badge !== 'none' ? BADGE[block.badge] : null
  const link =
    block.link?.url && block.link.label && isRouteReady(block.link.url) ? block.link : null
  const headingId = block.anchor ? `${block.anchor}-h` : undefined
  return (
    <Section id={block.anchor ?? undefined} labelledBy={headingId} className="chapter-section">
      {/* Persona scoped to this chapter only (the Team chapter turns lime); the page accent is untouched. */}
      <div data-persona={scoped} className="chapter-scope">
        <div aria-hidden className="chapter-glow" />
        <Chapter
          pinned={block.pin ?? false}
          reverse={block.reverse ?? false}
          stage={<div className="chapter-stage">{stageFor(block)}</div>}
          eyebrow={
            <div className="flex flex-wrap items-center gap-3">
              {block.overline && <Overline accent>{block.overline}</Overline>}
              {badge && <Badge status={badge} />}
            </div>
          }
          title={
            <h2 id={headingId} className="display-3 max-w-[18ch] lg:max-w-[20ch]">
              {block.title}
            </h2>
          }
        >
          {block.body && <p className="body-lg measure max-w-[46ch]">{block.body}</p>}
          {block.bullets && block.bullets.length > 0 && (
            <ul className="mt-1 flex flex-col gap-3.5">
              {block.bullets.map((b, i) => (
                <li key={b.id ?? i} className="flex gap-3 text-[17px] leading-[1.5] text-body">
                  <Check
                    aria-hidden
                    size={18}
                    strokeWidth={2.5}
                    className="mt-[5px] shrink-0 text-accent-text"
                  />
                  {b.text}
                </li>
              ))}
            </ul>
          )}
          {block.teaser && (
            <p className="flex flex-wrap items-center gap-3 text-[15px] leading-[1.5] text-muted">
              <Badge status="Coming soon" />
              {block.teaser}
            </p>
          )}
          {link && <TextLink href={link.url as string}>{link.label}</TextLink>}
        </Chapter>
      </div>
    </Section>
  )
}
