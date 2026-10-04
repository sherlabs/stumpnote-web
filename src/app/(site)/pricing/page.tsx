import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TrackView } from '@/components/site/TrackView'
import { PageView } from '@/components/pages/PageView'
import { getContentPage, getSettings } from '@/lib/cms/content'
import { getBlockContext } from '@/lib/cms/route-context'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [page, { settings }] = await Promise.all([getContentPage('pricing'), getSettings()])
  if (!page || !settings.showPricing) return { title: 'Not found', robots: { index: false } }
  return {
    title: { absolute: page.metaTitle ?? `${page.title} | StumpNote` },
    description: page.metaDescription,
    alternates: { canonical: '/pricing' },
  }
}

export default async function Page() {
  const [page, ctx, { settings }] = await Promise.all([
    getContentPage('pricing'),
    getBlockContext(),
    getSettings(),
  ])
  // D-14: the owner can switch pricing off in Site settings; the route then 404s and the nav link disappears.
  if (!page || !settings.showPricing) notFound()
  return (
    <>
      <TrackView event="pricing_view" />
      <PageView page={page} ctx={ctx} />
    </>
  )
}
