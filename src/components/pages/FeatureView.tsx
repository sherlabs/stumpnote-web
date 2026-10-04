import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { BlockIcon } from '@/components/blocks/icons'
import { ScenarioCard, stageFor } from '@/components/blocks/stage'
import { CtaBeta } from '@/components/blocks/CtaBeta'
import type { BlockContext } from '@/components/blocks/types'
import { Section } from '@/components/site/Section'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Overline } from '@/components/ui/Overline'
import type { FeatureVM } from '@/lib/cms/content'
import { AREA_LABELS } from '@/seed/data/features'
import { AiDisclosure } from './AiDisclosure'
import { FeatureCardLink } from './FeatureCardLink'
import { PageHero } from './PageHero'
import { STATUS_LABEL } from './status'

const PERSONA_LABEL: Record<string, string> = {
  player: 'Players',
  captain: 'Captains',
  member: 'Team members',
  coach: 'Coaches',
  parent: 'Parents',
}

/** One feature: hero with its live demo, what it does, how it works, a labelled scenario, related features, CTA. */
export function FeatureView({
  feature: f,
  related,
  ctx,
}: {
  feature: FeatureVM
  related: FeatureVM[]
  ctx: BlockContext
}) {
  const demo = stageFor({ demo: f.demo, scenario: null })
  const visual = demo ? (
    <div className="feature-stage">{demo}</div>
  ) : f.media ? (
    <figure className="feature-shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={f.media.url}
        alt={f.media.alt}
        width={f.media.width}
        height={f.media.height}
        className="block h-auto w-full"
      />
      <span className="eyebrow feature-shot-badge">Sample data</span>
    </figure>
  ) : (
    <div className="feature-stage feature-glyph" aria-hidden>
      <span className="feature-glyph-icon">
        <BlockIcon name={f.icon} size={72} />
      </span>
    </div>
  )
  return (
    <>
      <PageHero
        size="lg"
        headingId="feature-h"
        overline={
          <span className="flex flex-wrap items-center gap-3">
            <span>{AREA_LABELS[f.area]}</span>
            <Badge status={STATUS_LABEL[f.status]} />
          </span>
        }
        headline={f.title}
        subcopy={f.benefit}
        actions={
          <>
            <Button href="/join" arrow>
              Join the beta
            </Button>
            <Link
              href="/features"
              className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-muted transition-colors hover:text-text"
            >
              <ArrowLeft aria-hidden size={16} />
              All features
            </Link>
          </>
        }
        visual={visual}
      />

      <Section labelledBy="feature-what-h" tight>
        <div className="feature-facts">
          <div>
            <Overline>What it does</Overline>
            <h2 id="feature-what-h" className="sr-only">
              What {f.title} does
            </h2>
            <ul className="mt-6 flex flex-col gap-4" role="list">
              {f.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-[17px] leading-[1.5] text-body">
                  <Check
                    aria-hidden
                    size={18}
                    strokeWidth={2.5}
                    className="mt-[5px] shrink-0 text-accent-text"
                  />
                  {b}
                </li>
              ))}
            </ul>
            {f.personas.length > 0 && (
              <p className="mt-8 text-[14px] text-muted">
                Made for {f.personas.map((p) => PERSONA_LABEL[p] ?? p).join(', ')}.
              </p>
            )}
          </div>
          <div>
            <Overline>How it works</Overline>
            <p className="title mt-6 !font-semibold !leading-[1.35]">{f.howItWorks}</p>
            {f.comingSoonTeaser && (
              <p className="mt-8 flex flex-wrap items-center gap-3 text-[15px] leading-[1.5] text-muted">
                <Badge status="Coming soon" />
                {f.comingSoonTeaser}
              </p>
            )}
          </div>
          <div>{f.scenario.text && <ScenarioCard scenario={f.scenario} />}</div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section labelledBy="related-h" tight>
          <h2 id="related-h" className="display-3 max-w-[14ch]">
            Works with
          </h2>
          <ul className="features-grid mt-8" role="list">
            {related.map((r) => (
              <li key={r.slug}>
                <FeatureCardLink f={r} compact />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tight>
        <AiDisclosure />
      </Section>
      <CtaBeta
        block={{
          blockType: 'cta-beta',
          heading: 'Join the beta',
          subcopy: 'The web app is live now.',
        }}
        ctx={ctx}
      />
    </>
  )
}
