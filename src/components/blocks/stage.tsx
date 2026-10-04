import type { ReactNode } from 'react'
import { KineticTranscript } from '@/components/signature/KineticTranscript'
import { MStroke } from '@/components/signature/MStroke'
import { PitchHeatGrid } from '@/components/signature/PitchHeatGrid'
import { QuickLogStrip } from '@/components/signature/QuickLogStrip'
import { SeriesChart } from '@/components/signature/SeriesChart'
import { SquadGrid } from '@/components/signature/SquadGrid'
import { VoiceNoteTyper } from '@/components/signature/VoiceNoteTyper'

export type Scenario = { persona?: string | null; text?: string | null }

/** Fictional persona, always labelled (docs/spec/05-content-brief.md claims policy 12). */
export function ScenarioCard({ scenario }: { scenario: Scenario }) {
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

export function stageFor(block: { demo?: string | null; scenario?: Scenario | null }): ReactNode {
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
