import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { serverURL } from '@/lib/env'
import { archivo, hanken } from '@/lib/fonts'
import { motionInitScript } from '@/lib/motion/init-script'
import { AmbientRings } from '@/components/site/AmbientRings'
import { Footer } from '@/components/site/Footer'
import { MotionRoot } from '@/components/site/MotionRoot'
import { Nav } from '@/components/site/Nav'
import { PersonaProvider } from '@/components/site/PersonaProvider'
import { SkipLink } from '@/components/site/SkipLink'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(serverURL()),
  title: { default: 'StumpNote', template: '%s | StumpNote' },
  description:
    'StumpNote is a voice-first cricket journal. Talk after a session, get a personal brief, drills and game plans built from your own history.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: '#0B1114',
  colorScheme: 'dark',
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script sets data-motion (and an optional theme) before first paint.
    <html lang="en" data-theme="dark" data-persona="player" className={`${archivo.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionInitScript }} />
      </head>
      <body>
        <PersonaProvider>
          <SkipLink />
          <AmbientRings />
          <Nav />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
          <MotionRoot />
        </PersonaProvider>
      </body>
    </html>
  )
}
