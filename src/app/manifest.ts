import type { MetadataRoute } from 'next'

// Root-level like robots.ts and sitemap.ts (two root layouts in this app). The site is not an installable app, so the
// manifest only supplies name, colours and icons for browsers and home-screen bookmarks.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StumpNote',
    short_name: 'StumpNote',
    description: 'A voice-first cricket journal with an AI that remembers your game.',
    start_url: '/',
    display: 'browser',
    background_color: '#0B1114',
    theme_color: '#0B1114',
    icons: [
      { src: '/favicons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
