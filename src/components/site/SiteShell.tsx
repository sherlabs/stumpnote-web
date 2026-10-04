import type { ReactNode } from 'react'
import { AmbientRings } from './AmbientRings'
import { Footer } from './Footer'
import { MotionRoot } from './MotionRoot'
import { Nav } from './Nav'
import { PersonaProvider } from './PersonaProvider'
import { SkipLink } from './SkipLink'

/** Everything inside <body>: shared by the site layout and the global 404 so both look identical. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
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
  )
}
