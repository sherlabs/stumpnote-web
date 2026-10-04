import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { KineticTranscript } from '@/components/signature/KineticTranscript'
import { MStroke } from '@/components/signature/MStroke'
import { PitchHeatGrid } from '@/components/signature/PitchHeatGrid'
import { QuickLogStrip } from '@/components/signature/QuickLogStrip'
import { SeriesChart } from '@/components/signature/SeriesChart'
import { SquadGrid } from '@/components/signature/SquadGrid'
import { VoiceNoteTyper } from '@/components/signature/VoiceNoteTyper'
import { Chapter } from '@/components/site/Chapter'
import { Section } from '@/components/site/Section'
import { Badge } from '@/components/ui/Badge'
import type { BadgeLabel } from '@/components/ui/Badge'
import { Overline } from '@/components/ui/Overline'
import { TextLink } from '@/components/ui/TextLink'
import { isRouteReady } from '@/lib/site-config'
import { HowItLearns } from './HowItLearns'
import type { BlockOf } from './types'

type ChapterData = BlockOf<'chapter'>

const BADGE: Record<string, BadgeLabel> = {
  'available-web': 'Available now (web)',
  'in-beta': 'In the beta',
  preview: 'Preview',
  'coming-soon': 'Coming soon',
}

function ScenarioCard({ scenario }: { scenario: NonNullable<ChapterData['scenario']> }) {
  if (!scenario.text) return null
  return (
    <figure className="w-full max-w-[460px] rounded-3 border border-[var(--hairline-2)] bg-[var(--hairline-1)] p-5">
      <figcaption className="eyebrow !text-muted">
        Illustrative scenario{scenario.persona ? ` · ${scenario.persona}` : ''}
      </figcaption>
      <blockquote className="mt-3 text-[17px] leading-[1.5] text-text">{scenario.text}</blockquote>
    </figure>
  )
}

function stageFor(block: ChapterData): ReactNode {
  const scenario = block.scenario?.text ? <ScenarioCard scenario={block.scenario} /> : null
  switch (block.demo) {
    case 'quick-log':
      return (
        <div className="flex w-full flex-col items-center gap-5">
          <QuickLogStrip />
          {scenario}
        </div>
      )
    case 'kinetic-transcript':
      return <KineticTranscript />
    case 'series-chart':
      return <SeriesChart />
    case 'squad-grid':
      return (
        <div className="flex w-full flex-col items-center gap-5">
          <SquadGrid />
          {scenario}
        </div>
      )
    case 'heat-grid':
      return <PitchHeatGrid />
    case 'voice-typer':
      return <VoiceNoteTyper />
    case 'm-stroke':
      return (
        <div className="mx-auto w-[min(60%,260px)]">
          <MStroke mode="static" />
        </div>
      )
    default:
      return null
  }
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
