import { cn } from '@/lib/cn'

/** The only four status labels allowed on the site (docs/spec/05-content-brief.md claims policy). */
export const BADGE_LABELS = ['Available now (web)', 'In the beta', 'Preview', 'Coming soon'] as const
export type BadgeLabel = (typeof BADGE_LABELS)[number]

// Status is neutral plus words and a glyph shape, never colour alone.
const glyph: Record<BadgeLabel, string> = {
  'Available now (web)': '●',
  'In the beta': '◐',
  Preview: '◇',
  'Coming soon': '○',
}

export function Badge({ status, className }: { status: BadgeLabel; className?: string }) {
  return (
    <span
      className={cn(
        'eyebrow inline-flex min-h-6 items-center gap-1.5 rounded-full border border-[var(--hairline-3)] bg-[var(--hairline-1)] px-2.5 !text-muted',
        className,
      )}
    >
      <span aria-hidden className="text-[9px] text-text">
        {glyph[status]}
      </span>
      {status}
    </span>
  )
}
