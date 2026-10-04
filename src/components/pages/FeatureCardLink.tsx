import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BlockIcon } from '@/components/blocks/icons'
import { Badge } from '@/components/ui/Badge'
import type { FeatureVM } from '@/lib/cms/content'
import { STATUS_LABEL } from './status'

/** Feature card used by the index, persona pages and "related" rows. The whole card is one link (stretched anchor). */
export function FeatureCardLink({
  f,
  n,
  compact,
}: {
  f: Pick<FeatureVM, 'slug' | 'title' | 'benefit' | 'status' | 'icon'>
  n?: number
  compact?: boolean
}) {
  return (
    <article className="feature-card-inner" data-compact={compact ? 'true' : undefined}>
      <div className="flex items-start justify-between gap-3">
        <span className="feature-icon" aria-hidden>
          <BlockIcon name={f.icon} size={24} />
        </span>
        <Badge status={STATUS_LABEL[f.status]} />
      </div>
      <h3 className="title mt-9">{f.title}</h3>
      <p className="mt-3 text-[16px] leading-[1.5] text-body">{f.benefit}</p>
      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        {n !== undefined ? (
          <span
            aria-hidden
            className="feature-num mono-num"
            data-n={String(n + 1).padStart(2, '0')}
          />
        ) : (
          <span />
        )}
        <Link
          href={`/features/${f.slug}`}
          className="feature-card-link inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-text"
        >
          Learn more
          <span className="sr-only"> about {f.title}</span>
          <ArrowRight aria-hidden size={16} />
          <span className="absolute inset-0" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
