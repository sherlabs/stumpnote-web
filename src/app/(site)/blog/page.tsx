import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/site/Section'
import { Overline } from '@/components/ui/Overline'
import { getPosts } from '@/lib/cms/content'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPosts()
  return {
    title: { absolute: 'Blog | StumpNote' },
    description: 'Notes from the StumpNote team.',
    alternates: { canonical: '/blog', types: { 'application/rss+xml': '/blog/rss.xml' } },
    // An empty blog is not worth indexing; it starts counting once the first post is published.
    robots: posts.length ? undefined : { index: false },
  }
}

const date = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : ''

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <>
      <PageHero
        overline="Blog"
        headline={'Notes from\nthe team.'}
        subcopy="Product updates and thinking about how players learn."
      />
      <Section tight labelledBy="posts-h">
        <h2 id="posts-h" className="sr-only">
          Posts
        </h2>
        {posts.length === 0 ? (
          <div className="empty-state">
            <p className="title">No posts yet.</p>
            <p className="text-body">The first one is on its way.</p>
          </div>
        ) : (
          <ul className="post-grid" role="list">
            {posts.map((p) => (
              <li key={p.slug} className="feature-card-inner" style={{ minHeight: 240 }}>
                <Overline>{date(p.publishedAt)}</Overline>
                <h3 className="title mt-5">
                  <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-3 text-[16px] leading-[1.5] text-body">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
