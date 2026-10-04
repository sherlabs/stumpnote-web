import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { serverURL } from '@/lib/env'
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
    <html lang="en" data-theme="dark" data-persona="player">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-2 focus:bg-surface focus:px-4 focus:py-3 focus:text-text"
        >
          Skip to content
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  )
}
