import { RichText } from '@payloadcms/richtext-lexical/react'
import { Section } from '@/components/site/Section'
import { Overline } from '@/components/ui/Overline'
import type { FaqVM } from '@/lib/cms/content'
import type { Faq } from '@/payload-types'
import type { BlockContext, BlockOf } from './types'

/** Native <details> accordion: works with no JS, keyboard and screen-reader support come with the element. */
export function FaqAccordion({ faqs, idPrefix = 'faq' }: { faqs: FaqVM[]; idPrefix?: string }) {
  return (
    <div className="faq-list">
      {faqs.map((f) => (
        <details key={f.slug} className="faq-item" id={`${idPrefix}-${f.slug}`}>
          <summary className="faq-summary">
            <span>{f.question}</span>
            <span aria-hidden className="faq-plus" />
          </summary>
          <div className="faq-answer prose-sn">
            <RichText data={f.answer as NonNullable<Faq['answer']>} />
          </div>
        </details>
      ))}
    </div>
  )
}

export function FaqList({ block, ctx }: { block: BlockOf<'faq-list'>; ctx: BlockContext }) {
  const picked = (block.faqs ?? []).filter((f): f is Faq => typeof f === 'object' && f !== null)
  const all = ctx.faqs ?? []
  let faqs: FaqVM[] = []
  if (picked.length) {
    faqs = picked
      .map((f) => all.find((a) => a.slug === f.slug))
      .filter((f): f is FaqVM => Boolean(f))
  } else {
    faqs = block.category ? all.filter((f) => f.category === block.category) : all
  }
  if (!faqs.length) return null
  const id = `faq-h-${block.category ?? 'all'}`
  return (
    <Section labelledBy={id} tight>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
        <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          {block.overline && <Overline accent>{block.overline}</Overline>}
          <h2 id={id} className="display-3 max-w-[14ch]">
            {block.heading ?? 'Questions'}
          </h2>
        </div>
        <FaqAccordion faqs={faqs} idPrefix={block.category ?? 'all'} />
      </div>
    </Section>
  )
}
