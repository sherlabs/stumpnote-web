import { getFeature, getFeatures } from '@/lib/cms/content'
import { ogImage, OG_SIZE, OG_TYPE } from '@/lib/seo/og'

export const alt = 'StumpNote feature'
export const size = OG_SIZE
export const contentType = OG_TYPE

export async function generateStaticParams() {
  return (await getFeatures()).map((f) => ({ slug: f.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const hit = await getFeature((await params).slug)
  return ogImage({
    kicker: hit ? `Feature, ${hit.feature.area}` : 'Feature',
    title: hit?.feature.title ?? 'StumpNote',
    subtitle: hit?.feature.benefit,
  })
}
