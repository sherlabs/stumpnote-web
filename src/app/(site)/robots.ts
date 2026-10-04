import type { MetadataRoute } from 'next'
import { serverURL } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/lab'] }],
    sitemap: `${serverURL()}/sitemap.xml`,
  }
}
