import { Section } from '@/components/site/Section'
import type { Media } from '@/payload-types'
import type { BlockOf } from './types'

/** Screenshot with a permanent "Sample data" badge: only synthetic data may be shown (claims policy 12). */
export function MediaBlock({ block }: { block: BlockOf<'media-block'> }) {
  const m = typeof block.media === 'object' && block.media ? (block.media as Media) : null
  if (!m?.url) return null
  const src = m.sizes?.hero?.url || m.url
  return (
    <Section tight>
      <figure className="relative mx-auto max-w-[960px] overflow-hidden rounded-3 border border-[var(--hairline-2)] bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={m.alt}
          width={m.width ?? undefined}
          height={m.height ?? undefined}
          loading="lazy"
          className="block h-auto w-full"
        />
        <span className="eyebrow absolute left-4 top-4 rounded-full border border-[var(--hairline-3)] bg-[color-mix(in_oklab,var(--canvas)_80%,transparent)] px-3 py-2 !text-muted backdrop-blur">
          Sample data
        </span>
        {block.caption && (
          <figcaption className="body-sm border-t border-[var(--hairline-2)] px-5 py-4 text-muted">
            {block.caption}
          </figcaption>
        )}
      </figure>
    </Section>
  )
}
