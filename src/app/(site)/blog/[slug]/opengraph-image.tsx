import { getPost, getPosts } from '@/lib/cms/content'
import { ogImage, OG_SIZE, OG_TYPE } from '@/lib/seo/og'

export const alt = 'StumpNote blog'
export const size = OG_SIZE
export const contentType = OG_TYPE

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug)
  return ogImage({ kicker: 'Blog', title: post?.title ?? 'StumpNote', subtitle: post?.excerpt || undefined })
}
