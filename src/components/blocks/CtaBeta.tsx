import { Button } from '@/components/ui/Button'
import { TextLink } from '@/components/ui/TextLink'
import { WEB_APP_URL } from '@/lib/site-config'
import { betaCta } from '@/lib/beta-cta'
import { CtaMark } from './CtaMark'
import { WaitlistForm } from './WaitlistForm'
import type { BlockContext, BlockOf } from './types'

/** State-driven beta call to action (Beta access global). No App Store badge or availability claim before launch. */
export function CtaBeta({ block, ctx }: { block: BlockOf<'cta-beta'>; ctx: BlockContext }) {
  const { beta } = ctx
  const cta = betaCta(beta, '')
  const direct = beta.state !== 'waitlist' && cta.href
  return (
    <section
      id="join"
      aria-labelledby="join-h"
      className="relative z-10 py-[var(--s-8)] lg:py-[var(--s-10)]"
    >
      <div className="container-x">
        <div className="cta-panel">
          <div aria-hidden className="cta-glow" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="flex flex-col gap-6">
              <h2 id="join-h" className="display-2 max-w-[10ch]">
                {block.heading}
              </h2>
              {block.subcopy && <p className="body-lg measure max-w-[44ch]">{block.subcopy}</p>}
              {direct ? (
                <div className="flex flex-wrap items-center gap-4">
                  <Button href={cta.href} arrow rel="noopener" data-track="cta_click_beta">
                    {cta.label}
                  </Button>
                </div>
              ) : beta.waitlistEnabled ? (
                <WaitlistForm consentText={beta.consentText} successMessage={beta.successMessage} />
              ) : (
                <p className="text-[17px] text-text">Beta sign-up opens soon.</p>
              )}
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
                {beta.comingSoonLine}
                <TextLink href={WEB_APP_URL} data-track="outbound_app_link" rel="noopener">
                  Open the web app
                </TextLink>
              </p>
            </div>
            <CtaMark />
          </div>
        </div>
      </div>
    </section>
  )
}
