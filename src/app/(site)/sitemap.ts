import type { MetadataRoute } from 'next'
import { serverURL } from '@/lib/env'

// Static routes only for now. CMS-driven routes join in S4/S5.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = serverURL()
  return [{ url: `${base}/`, changeFrequency: 'weekly', priority: 1 }]
}
