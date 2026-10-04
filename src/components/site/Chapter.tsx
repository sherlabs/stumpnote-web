import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Stage + copy pair. Below lg: stacked cards. At lg+ with `pinned`, the stage column is position:sticky so it stays
 * in view while the copy column scrolls: layout is reserved by CSS (zero CLS) and needs no JS, so reduced-motion and
 * no-JS users get the same readable page. Scroll progress for scrubbed stages comes from the useChapterProgress hook.
 */
export function Chapter({
  id,
  eyebrow,
  title,
  stage,
  children,
  pinned = false,
  reverse = false,
  className,
}: {
  id?: string
  eyebrow?: ReactNode
  title?: ReactNode
  stage: ReactNode
  children: ReactNode
  pinned?: boolean
  reverse?: boolean
  className?: string
}) {
  return (
    <div
      id={id}
      data-chapter
      className={cn('grid items-start gap-10 lg:grid-cols-2 lg:gap-16', className)}
    >
      <div
        className={cn(
          'min-w-0',
          reverse && 'lg:order-2',
          pinned && 'lg:sticky lg:top-[calc(50svh-var(--chapter-stage-h,260px))] lg:self-start',
        )}
      >
        {stage}
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        {eyebrow}
        {title}
        {children}
      </div>
    </div>
  )
}
