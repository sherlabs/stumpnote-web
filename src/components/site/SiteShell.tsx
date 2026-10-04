import type { ReactNode } from 'react'
import { clientAnalytics } from '@/lib/analytics-config'
import { getChrome } from '@/lib/cms/content'
import { AnalyticsLoader } from './AnalyticsLoader'
import { AmbientRings } from './AmbientRings'
import { Footer } from './Footer'
import { MotionRoot } from './MotionRoot'
import { Nav } from './Nav'
import { PersonaProvider } from './PersonaProvider'
import { SkipLink } from './SkipLink'
import { TrackClicks } from './TrackClicks'

/** Everything inside <body>: shared by the site layout and the global 404 so both look identical. */
export async function SiteShell({ children }: { children: ReactNode }) {
  const chrome = await getChrome()
  const analytics = clientAnalytics()
  return (
    <PersonaProvider>
      <SkipLink />
      <AmbientRings />
      <Nav items={chrome.primaryNav} ctaItem={chrome.cta} />
      <main id="main" className="relative z-10">
        {children}
      </main>
      <Footer
        columns={chrome.footerColumns}
        copyright={chrome.settings.copyrightLine}
        disclosure={chrome.settings.footerDisclosure}
      />
      <MotionRoot />
      <TrackClicks />
      {analytics && <AnalyticsLoader {...analytics} />}
    </PersonaProvider>
  )
}
