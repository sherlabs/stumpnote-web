import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { FeatureView } from '@/components/pages/FeatureView'
import { PageView } from '@/components/pages/PageView'
import { PersonaView } from '@/components/pages/PersonaView'
import { PostView } from '@/components/pages/PostView'
import { PreviewRefresh } from '@/components/pages/PreviewRefresh'
import { isAnyRoleUser } from '@/access'
import { getContentPage, getFeature, getPersona, getPost } from '@/lib/cms/content'
import { getPayloadOrNull } from '@/lib/cms/payload'
import { getBlockContext } from '@/lib/cms/route-context'

// Live Preview target: always dynamic, never indexed (X-Robots-Tag is set for /next/* in next.config), and visible only
// to a signed-in staff user (their own admin session cookie; same origin, so it is sent inside the preview iframe).
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } }

type Props = { params: Promise<{ collection: string; slug: string }> }

async function isStaff(): Promise<boolean> {
  const payload = await getPayloadOrNull()
  if (!payload) return false
  try {
    const { user } = await payload.auth({ headers: await headers() })
    return isAnyRoleUser(user)
  } catch {
    return false
  }
}

export default async function PreviewPage({ params }: Props) {
  if (!(await isStaff())) notFound()
  const { collection, slug: raw } = await params
  const slug = decodeURIComponent(raw)
  const draft = { draft: true }
  const ctx = await getBlockContext(draft)
  let body: React.ReactNode = null
  if (collection === 'pages') {
    const page = await getContentPage(slug, draft)
    if (page) body = <PageView page={page} ctx={ctx} />
  } else if (collection === 'features') {
    const hit = await getFeature(slug, draft)
    if (hit) body = <FeatureView feature={hit.feature} related={hit.related} ctx={ctx} />
  } else if (collection === 'personas') {
    const persona = await getPersona(slug, draft)
    if (persona) body = <PersonaView persona={persona} ctx={ctx} />
  } else if (collection === 'posts') {
    const post = await getPost(slug, draft)
    if (post) body = <PostView post={post} />
  }
  if (!body) notFound()
  return (
    <>
      <PreviewRefresh />
      {body}
    </>
  )
}
