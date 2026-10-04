import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostView } from '@/components/pages/PostView'
import { getPost, getPosts } from '@/lib/cms/content'

export const revalidate = 300

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return { title: 'Post not found', robots: { index: false } }
  return {
    title: { absolute: `${post.title} | StumpNote` },
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  return <PostView post={post} />
}
