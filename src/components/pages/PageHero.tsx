import type { ReactNode } from 'react'
import { Overline } from '@/components/ui/Overline'
import { cn } from '@/lib/cn'

/**
 * Inner-page hero: overline, one display h1 (line breaks from "\n"), sub-copy, actions and an optional visual.
 * Server component; the entrance is CSS only (html[data-motion='on'] .hero-line, home.css).
 */
export function PageHero({
  overline,
  headline,
  subcopy,
  actions,
  children,
  visual,
  className,
  headingId = 'page-h',
  size = 'xl',
}: {
  overline?: ReactNode
  headline: string
  subcopy?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  visual?: ReactNode
  className?: string
  headingId?: string
  /** `lg` steps the h1 down to display-2 for long titles (feature pages). */
  size?: 'xl' | 'lg'
}) {
  const lines = headline.split('\n').filter(Boolean)
  return (
    <section aria-labelledby={headingId} className={cn('page-hero relative z-10', className)}>
      <div aria-hidden className="page-hero-glow" />
      <div className="container-x relative">
        <div
          className={cn(
            'grid items-center gap-12',
            Boolean(visual) && 'lg:grid-cols-[1.15fr_0.85fr] lg:gap-16',
          )}
        >
          <div className="flex flex-col gap-6">
            {overline && (
              <Overline accent className="hero-line">
                {overline}
              </Overline>
            )}
            <h1
              id={headingId}
              className={cn(
                size === 'xl' ? 'display-1 max-w-[14ch]' : 'display-2 max-w-[18ch]',
                'page-h1',
              )}
            >
              {lines.map((l, i) => (
                <span
                  key={i}
                  className="hero-line block"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {l}
                </span>
              ))}
            </h1>
            {subcopy && (
              <p
                className="body-lg measure hero-line max-w-[52ch]"
                style={{ '--i': lines.length } as React.CSSProperties}
              >
                {subcopy}
              </p>
            )}
            {actions && (
              <div
                className="hero-line mt-2 flex flex-wrap items-center gap-x-6 gap-y-4"
                style={{ '--i': lines.length + 1 } as React.CSSProperties}
              >
                {actions}
              </div>
            )}
            {children}
          </div>
          {visual && <div className="page-hero-visual">{visual}</div>}
        </div>
      </div>
    </section>
  )
}
