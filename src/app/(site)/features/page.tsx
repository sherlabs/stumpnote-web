import type { Metadata } from 'next'
import { CtaBeta } from '@/components/blocks/CtaBeta'
import { AiDisclosure } from '@/components/pages/AiDisclosure'
import { ComingSoonStrip, FeatureIndex } from '@/components/pages/FeatureIndex'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/site/Section'
import { Overline } from '@/components/ui/Overline'
import { getFeatures } from '@/lib/cms/content'
import { getBlockContext } from '@/lib/cms/route-context'

export const revalidate = 300

export const metadata: Metadata = {
  title: { absolute: 'Features | StumpNote' },
  description:
    'Voice journal, an AI read on every entry, a memory that keeps learning, measured goals, mindset audio, game plans and more. Everything reads the same memory.',
  alternates: { canonical: '/features' },
}

export default async function FeaturesPage() {
  const [features, ctx] = await Promise.all([getFeatures(), getBlockContext()])
  return (
    <>
      <PageHero
        overline="Features"
        headline={'Everything reads\nthe same memory.'}
        subcopy="Log once and every brief, drill, plan and answer starts from your game. Twenty-two features, one profile that keeps learning."
      />
      <Section labelledBy="all-features-h" tight>
        <h2 id="all-features-h" className="sr-only">
          All features
        </h2>
        <FeatureIndex features={features} />
      </Section>
      <Section labelledBy="soon-h" tight>
        <div className="flex flex-col gap-4">
          <Overline>On the way</Overline>
          <h2 id="soon-h" className="display-3 max-w-[16ch]">
            Preview and coming soon.
          </h2>
        </div>
        <div className="mt-8">
          <ComingSoonStrip />
        </div>
      </Section>
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
