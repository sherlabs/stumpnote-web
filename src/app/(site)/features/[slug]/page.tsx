import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FeatureView } from '@/components/pages/FeatureView'
import { getFeature, getFeatures } from '@/lib/cms/content'
import { getBlockContext } from '@/lib/cms/route-context'

export const revalidate = 300

export async function generateStaticParams() {
  return (await getFeatures()).map((f) => ({ slug: f.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const hit = await getFeature(slug)
  if (!hit) return { title: 'Feature not found', robots: { index: false } }
  const { feature } = hit
  return {
    title: { absolute: `${feature.title} | StumpNote` },
    description: feature.benefit,
    alternates: { canonical: `/features/${feature.slug}` },
  }
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params
  const hit = await getFeature(slug)
  if (!hit) notFound()
  const ctx = await getBlockContext()
  return <FeatureView feature={hit.feature} related={hit.related} ctx={ctx} />
}
