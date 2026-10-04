import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { serverURL } from '@/lib/env'
import { archivo, hanken } from '@/lib/fonts'
import { motionInitScript } from '@/lib/motion/init-script'
import { SiteShell } from '@/components/site/SiteShell'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(serverURL()),
  title: { default: 'StumpNote', template: '%s | StumpNote' },
  description:
    'StumpNote is a voice-first cricket journal. Talk after a session, get a personal brief, drills and game plans built from your own history.',
  applicationName: 'StumpNote',
  openGraph: { siteName: 'StumpNote', type: 'website', locale: 'en_AU' },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/favicons/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0B1114',
  colorScheme: 'dark',
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script sets data-motion (and an optional theme) before first paint.
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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
