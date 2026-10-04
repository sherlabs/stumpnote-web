import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageView } from '@/components/pages/PageView'
import { getContentPage } from '@/lib/cms/content'
import { getBlockContext } from '@/lib/cms/route-context'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage('security')
  if (!page) return { title: 'Not found', robots: { index: false } }
  return {
    title: { absolute: page.metaTitle ?? `${page.title} | StumpNote` },
    description: page.metaDescription,
    alternates: { canonical: '/security' },
  }
}

export default async function Page() {
  const [page, ctx] = await Promise.all([getContentPage('security'), getBlockContext()])
  if (!page) notFound()
  return <PageView page={page} ctx={ctx} />
}
