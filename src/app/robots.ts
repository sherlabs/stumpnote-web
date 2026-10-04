import type { MetadataRoute } from 'next'
import { serverURL } from '@/lib/env'

// Lives at the app root, not inside a route group: in this app (two root layouts) Next 16.3.8
// did not emit /robots.txt from `(site)/robots.ts` (404) while the root-level file works.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/lab', '/next/'] }],
    sitemap: `${serverURL()}/sitemap.xml`,
  }
}
