import type { Metadata } from 'next'
import { NotFoundContent } from '@/components/site/NotFoundContent'
import { SiteShell } from '@/components/site/SiteShell'
import { archivo, hanken } from '@/lib/fonts'
import { motionInitScript } from '@/lib/motion/init-script'
import '@/styles/globals.css'

export const metadata: Metadata = { title: 'Page not found | StumpNote', robots: { index: false } }

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-persona="player"
      className={`${archivo.variable} ${hanken.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionInitScript }} />
      </head>
      <body>
        <SiteShell>
          <NotFoundContent />
        </SiteShell>
      </body>
    </html>
  )
}
