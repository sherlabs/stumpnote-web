import { Fragment } from 'react'
import { HeroRings } from '@/components/signature/HeroRings'
import { MStroke } from '@/components/signature/MStroke'
import { PersonaChips } from '@/components/site/PersonaChips'
import { Button } from '@/components/ui/Button'
import { Overline } from '@/components/ui/Overline'
import { betaCta } from '@/lib/beta-cta'
import { isRouteReady } from '@/lib/site-config'
import type { BlockContext, BlockOf } from './types'

const ORBIT = [
  { label: 'Daily focus', cls: 'right-[17%] top-[7%]', d: '0s' },
  { label: 'AI read', cls: 'right-[12%] top-[60%]', d: '-2.4s' },
  { label: 'Memory', cls: 'left-[30%] bottom-[9%]', d: '-4.8s' },
]

/**
 * Home hero. The h1 is plain server HTML and never starts transparent (it is the LCP element); each line only
 * rises a few pixels. The M paints with CSS, the shader mounts after idle behind identical static rings.
 */
export function HeroStory({ block, ctx }: { block: BlockOf<'hero-story'>; ctx: BlockContext }) {
  const lines = block.headline.split('\n').filter(Boolean)
  const cta = betaCta(ctx.beta, block.primaryCta?.url || '#join')
  const second = block.secondaryCta
  return (
    <section aria-labelledby="hero-h" className="relative overflow-clip">
      <div className="container-x grid min-h-[calc(100svh-68px)] items-center gap-8 pb-[var(--s-8)] pt-[var(--s-6)] lg:pb-[var(--s-9)]">
        <div className="relative z-10 flex flex-col gap-7">
          {block.overline && <Overline accent>{block.overline}</Overline>}
          <h1 id="hero-h" className="display-1 hero-title lg:max-w-[10ch]">
            {lines.map((l, i) => (
              <Fragment key={i}>
                <span className="hero-line block" style={{ '--i': i } as React.CSSProperties}>
                  {l}
                </span>{' '}
              </Fragment>
            ))}
          </h1>
          {block.subcopy && (
            <p
              className="body-lg measure hero-line max-w-[50ch]"
              style={{ '--i': 3 } as React.CSSProperties}
            >
              {block.subcopy}
            </p>
          )}
          <div
            className="hero-rise flex flex-wrap items-center gap-x-5 gap-y-4"
            style={{ '--i': 4 } as React.CSSProperties}
          >
            <Button
              href={cta.href}
              arrow
              data-track="cta_click_beta"
              {...(cta.external ? { rel: 'noopener' } : {})}
            >
              {cta.label}
            </Button>
            {second?.url && second.label && isRouteReady(second.url) && (
              <Button
                variant="secondary"
                href={second.url}
                data-track={/^https?:\/\//.test(second.url) ? 'outbound_app_link' : undefined}
                rel={/^https?:\/\//.test(second.url) ? 'noopener' : undefined}
              >
                {second.label}
              </Button>
            )}
          </div>
          <p className="body-sm hero-rise text-muted" style={{ '--i': 5 } as React.CSSProperties}>
            {ctx.beta.comingSoonLine}
          </p>
          {block.showPersonaChips !== false && (
            <div className="hero-rise" style={{ '--i': 6 } as React.CSSProperties}>
              <PersonaChips scrollTo="personas" />
            </div>
          )}
        </div>
        {block.showMStroke !== false && (
          <div className="relative order-first mx-auto aspect-square w-full max-w-[220px] sm:max-w-[380px] lg:pointer-events-none lg:absolute lg:right-[-3vw] lg:top-1/2 lg:order-none lg:mx-0 lg:w-[min(46vw,660px)] lg:max-w-none lg:-translate-y-1/2">
            <HeroRings className="absolute inset-0" />
            <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-[52%]">
              <MStroke mode="paint" delay={0.15} />
            </div>
            <ul aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
              {ORBIT.map((o) => (
                <li
                  key={o.label}
                  className={`orbit-chip absolute ${o.cls}`}
                  style={{ '--d': o.d } as React.CSSProperties}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div aria-hidden className="scroll-cue" />
    </section>
  )
}
