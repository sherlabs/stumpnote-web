import { Section } from '@/components/site/Section'
import type { BlockContext } from './types'

/** Renders only approved, consented records. Ships empty: no placeholder quotes, ever. */
export function Testimonials({ ctx }: { ctx: BlockContext }) {
  if (ctx.testimonials.length === 0) return null
  return (
    <Section labelledBy="quotes-h" tight>
      <h2 id="quotes-h" className="sr-only">
        What people say
      </h2>
      <ul className="grid gap-6 md:grid-cols-3">
        {ctx.testimonials.map((t) => (
          <li key={t.id}>
            <figure className="flex h-full flex-col gap-4 rounded-3 border border-[var(--hairline-2)] bg-surface p-6">
              <blockquote className="text-[18px] leading-[1.5] text-text">{t.quote}</blockquote>
              <figcaption className="body-sm text-muted">
                {t.attribution}
                {t.role ? `, ${t.role}` : ''}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  )
}
