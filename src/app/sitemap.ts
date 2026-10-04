import type { MetadataRoute } from 'next'
import { getFeatures, getPosts, getSettings } from '@/lib/cms/content'
import { getIndexableLegalSlugs } from '@/lib/cms/legal'
import { serverURL } from '@/lib/env'
import { READY_ROUTES } from '@/lib/site-config'

// Public, indexable routes. Legal pages join in S5. /blog and /changelog are listed once they have published content.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverURL()
  const [features, posts, { settings }, legalSlugs] = await Promise.all([
    getFeatures(),
    getPosts(),
    getSettings(),
    getIndexableLegalSlugs(),
  ])
  // Legal routes are listed only when they render the full page (never notice mode); /legal itself is the index.
  const LEGAL = new Set(['/privacy', '/terms', '/cookies', '/account-deletion', '/data-safety'])
  const legalOk = new Set(legalSlugs.map((s) => `/${s}`))
  const fixed = READY_ROUTES.filter(
    (r) => (settings.showPricing || r !== '/pricing') && (!LEGAL.has(r) || legalOk.has(r)),
  )
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    ...fixed.map((r) => ({
      url: `${base}${r}`,
      changeFrequency: 'monthly' as const,
      priority: r === '/features' || r === '/join' ? 0.9 : 0.7,
    })),
    ...features.map((f) => ({
      url: `${base}/features/${f.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...(posts.length
      ? [
          { url: `${base}/blog`, changeFrequency: 'weekly' as const, priority: 0.5 },
          ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, priority: 0.5 })),
        ]
      : []),
  ]
}
