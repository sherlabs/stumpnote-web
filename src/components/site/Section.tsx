import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Page section with the standard vertical rhythm (128px desktop, 64px mobile) and an optional labelled heading. */
export function Section({
  id,
  labelledBy,
  children,
  className,
  tight,
}: {
  id?: string
  labelledBy?: string
  children: ReactNode
  className?: string
  tight?: boolean
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative z-10',
        tight ? 'py-[var(--s-8)]' : 'py-[var(--s-8)] lg:py-[var(--s-10)]',
        className,
      )}
    >
      <div className="container-x">{children}</div>
    </section>
  )
}
