import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Section } from '@/components/site/Section'
import type { PostVM } from '@/lib/cms/content'
import { PageHero } from './PageHero'

/** One blog post. Author is a display name only. Shared by /blog/[slug] and Live Preview. */
export function PostView({ post }: { post: PostVM }) {
  const when = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : ''
  return (
    <>
      <PageHero
        size="lg"
        headingId="post-h"
        overline={`${when} · ${post.authorName}`}
        headline={post.title}
        subcopy={post.excerpt}
      />
      <Section tight>
        {post.content && <RichText data={post.content} className="prose-sn measure" />}
        <p className="mt-12">
          <Link href="/blog" className="text-muted underline underline-offset-4 hover:text-text">
            All posts
          </Link>
        </p>
      </Section>
    </>
  )
}
