import { HeroRings } from '@/components/signature/HeroRings'
import { MStroke } from '@/components/signature/MStroke'
import { PersonaChips } from '@/components/site/PersonaChips'
import { Button } from '@/components/ui/Button'
import { Overline } from '@/components/ui/Overline'
import { WEB_APP_URL } from '@/lib/site-config'

// S2 hero preview: shell + signature pieces on a static page. S3 replaces this with the CMS-driven story.
export const dynamic = 'force-static'

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-x grid min-h-[calc(100svh-68px)] items-center gap-10 py-[var(--s-8)]">
        <div className="relative z-10 flex flex-col gap-7">
          <Overline accent>Voice-first cricket journal</Overline>
          <h1 className="display-1 lg:max-w-[11ch]">Your cricket, remembered.</h1>
          <p className="body-lg measure max-w-[48ch]">
            Talk for a minute after a session. StumpNote turns it into a journal entry, then uses
            everything you have logged so every brief, drill, plan and answer is about your game.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button href={WEB_APP_URL} arrow>
              Open the web app
            </Button>
            <p className="body-sm text-muted">
              iPhone apps are in TestFlight beta, coming to the App Store.
            </p>
          </div>
          <PersonaChips className="pt-2" />
        </div>
        <div className="relative order-first mx-auto aspect-square w-full max-w-[300px] sm:max-w-[380px] lg:pointer-events-none lg:absolute lg:right-[-3vw] lg:top-1/2 lg:order-none lg:mx-0 lg:w-[min(46vw,660px)] lg:max-w-none lg:-translate-y-1/2">
          <HeroRings className="absolute inset-0" />
          <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-[52%]">
            <MStroke mode="paint" delay={0.15} />
          </div>
        </div>
      </div>
    </section>
  )
}
