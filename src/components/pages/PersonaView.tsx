import { Check } from 'lucide-react'
import { CtaBeta } from '@/components/blocks/CtaBeta'
import type { BlockContext } from '@/components/blocks/types'
import { Section } from '@/components/site/Section'
import { Button } from '@/components/ui/Button'
import { Overline } from '@/components/ui/Overline'
import { TextLink } from '@/components/ui/TextLink'
import type { PersonaVM } from '@/lib/cms/content'
import { WEB_APP_URL } from '@/lib/site-config'
import { FaqAccordion } from '@/components/blocks/FaqList'
import { AiDisclosure } from './AiDisclosure'
import { FeatureCardLink } from './FeatureCardLink'
import { PageAccent } from './PageAccent'
import { PageHero } from './PageHero'

function Lead({ lead }: { lead: NonNullable<PersonaVM['lead']> }) {
  return (
    <Section labelledBy="lead-h" tight>
      <div className="lead-panel">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <Overline accent>Consent and sharing</Overline>
            <h2 id="lead-h" className="display-2 max-w-[10ch]">
              {lead.heading}
            </h2>
            <p className="body-lg max-w-[40ch]">{lead.body}</p>
          </div>
          <ol className="lead-steps" role="list">
            {lead.items.map((i, n) => (
              <li key={i.title} className="lead-step">
                <span
                  aria-hidden
                  className="feature-num mono-num"
                  data-n={String(n + 1).padStart(2, '0')}
                />
                <div>
                  <h3 className="title">{i.title}</h3>
                  <p className="mt-2 text-[16px] leading-[1.5] text-body">{i.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}

/** One template for /players /captains /coaches /parents. `members` renders as an extra section on /captains. */
export function PersonaView({
  persona: p,
  members,
  ctx,
}: {
  persona: PersonaVM
  members?: PersonaVM | null
  ctx: BlockContext
}) {
  const consentFirst = p.leadWith === 'consent' && p.lead
  return (
    <>
      <PageAccent persona={p.accent} />
      <PageHero
        headingId="persona-h"
        size="lg"
        overline={p.eyebrow}
        headline={p.headline}
        subcopy={p.subcopy}
        actions={
          <>
            <Button href="/join" arrow>
              Join the beta
            </Button>
            <TextLink href={WEB_APP_URL} rel="noopener">
              Open the web app
            </TextLink>
          </>
        }
      />

      {consentFirst && <Lead lead={p.lead as NonNullable<PersonaVM['lead']>} />}

      <Section labelledBy="proof-h" tight>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <Overline>Highlights</Overline>
            <h2 id="proof-h" className="display-3 max-w-[12ch]">
              What you get.
            </h2>
          </div>
          <ul className="proof-list" role="list">
            {p.proofPoints.map((t, n) => (
              <li key={t} className="proof-item">
                <span
                  aria-hidden
                  className="proof-n mono-num"
                  data-n={String(n + 1).padStart(2, '0')}
                />
                <span className="flex gap-3 text-[18px] leading-[1.45] text-text">
                  <Check
                    aria-hidden
                    size={19}
                    strokeWidth={2.5}
                    className="mt-[5px] shrink-0 text-accent-text"
                  />
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {members && (
        <Section labelledBy="members-h" tight>
          <div className="members-panel">
            <Overline accent>{members.eyebrow}</Overline>
            <h2 id="members-h" className="display-3 mt-4 max-w-[18ch]">
              {members.headline}
            </h2>
            <p className="body-lg mt-4 max-w-[52ch]">{members.subcopy}</p>
            <ul className="mt-8 grid gap-4 md:grid-cols-2" role="list">
              {members.proofPoints.map((t) => (
                <li key={t} className="flex gap-3 text-[16px] leading-[1.5] text-body">
                  <Check
                    aria-hidden
                    size={18}
                    strokeWidth={2.5}
                    className="mt-[4px] shrink-0 text-accent-text"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {p.features.length > 0 && (
        <Section labelledBy="pfeatures-h" tight>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="pfeatures-h" className="display-3 max-w-[14ch]">
              Features you will use.
            </h2>
            <TextLink href="/features">All features</TextLink>
          </div>
          <ul className="features-grid features-grid-2 mt-8" role="list">
            {p.features.map((f) => (
              <li key={f.slug}>
                <FeatureCardLink f={f} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!consentFirst && p.lead && <Lead lead={p.lead} />}

      {p.faqList.length > 0 && (
        <Section labelledBy="pfaq-h" tight>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
            <h2 id="pfaq-h" className="display-3 max-w-[12ch] lg:sticky lg:top-28 lg:self-start">
              Common questions.
            </h2>
            <FaqAccordion faqs={p.faqList} idPrefix={`${p.slug}-faq`} />
          </div>
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
