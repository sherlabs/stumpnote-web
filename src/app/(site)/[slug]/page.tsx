import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageView } from '@/components/pages/PageView'
import { getContentPage } from '@/lib/cms/content'
import { getBlockContext } from '@/lib/cms/route-context'

export const revalidate = 300
// Pages that exist only in the CMS render on demand; with no database every unknown slug is a clean 404.
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

// Slugs owned by dedicated routes or reserved: never served from the generic template.
const RESERVED = new Set(['home', 'lab', 'admin', 'api', 'next'])

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = RESERVED.has(slug) ? null : await getContentPage(slug)
  if (!page) return { title: 'Page not found', robots: { index: false } }
  return {
    title: { absolute: page.metaTitle ?? `${page.title} | StumpNote` },
    description: page.metaDescription,
    alternates: { canonical: `/${page.slug}` },
    robots: page.noindex ? { index: false } : undefined,
  }
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params
  if (RESERVED.has(slug)) notFound()
  const [page, ctx] = await Promise.all([getContentPage(slug), getBlockContext()])
  if (!page) notFound()
  return <PageView page={page} ctx={ctx} />
}
