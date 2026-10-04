import type { MetadataRoute } from 'next'
import { getFeatures, getPosts, getSettings } from '@/lib/cms/content'
import { serverURL } from '@/lib/env'
import { READY_ROUTES } from '@/lib/site-config'

// Public, indexable routes. Legal pages join in S5. /blog and /changelog are listed once they have published content.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverURL()
  const [features, posts, { settings }] = await Promise.all([
    getFeatures(),
    getPosts(),
    getSettings(),
  ])
  const fixed = READY_ROUTES.filter((r) => settings.showPricing || r !== '/pricing')
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
