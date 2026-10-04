import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Legal "notice mode" banner and general callouts. Neutral, never traffic-light. */
export function Notice({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <aside
      role="note"
      className={cn(
        'flex gap-3 rounded-2 border border-[var(--hairline-3)] bg-[var(--hairline-1)] p-4 text-[15px] leading-normal text-body',
        className,
      )}
    >
      <Info aria-hidden size={18} className="mt-0.5 shrink-0 text-muted" />
      <div>
        {title && <p className="mb-1 font-semibold text-text">{title}</p>}
        <div>{children}</div>
      </div>
    </aside>
  )
}
