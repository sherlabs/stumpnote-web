import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

type Slug =
  'pages' | 'features' | 'personas' | 'posts' | 'faqs' | 'changelog-entries' | 'legal-pages'

/** Routes affected by a document of this collection. Listing pages and the home carousel always refresh with it. */
export function pathsFor(collection: Slug, doc?: { slug?: string | null } | null): string[] {
  const slug = doc?.slug ?? ''
  switch (collection) {
    case 'pages':
      return slug === 'home' ? ['/'] : slug ? [`/${slug}`] : []
    case 'features':
      return [
        '/',
        '/features',
        ...(slug ? [`/features/${slug}`] : []),
        '/players',
        '/captains',
        '/coaches',
        '/parents',
      ]
    case 'personas':
      return ['/', ...(slug ? [`/${slug}`] : [])]
    case 'posts':
      return ['/blog', '/blog/rss.xml', ...(slug ? [`/blog/${slug}`] : [])]
    case 'faqs':
      return ['/support', '/pricing', '/players', '/captains', '/coaches', '/parents']
    case 'changelog-entries':
      return ['/changelog']
    case 'legal-pages':
      return ['/legal', '/sitemap.xml', ...(slug ? [`/${slug}`, `/${slug}/history`] : [])]
  }
}

function run(paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p)
    } catch {
      // Outside a Next request (seed script, tests) there is no cache to refresh: nothing to do.
    }
  }
}

/** afterChange / afterDelete hook factory: on-demand ISR for the routes a document appears on. Never throws. */
export const revalidateDoc = (
  collection: Slug,
): CollectionAfterChangeHook & CollectionAfterDeleteHook =>
  (async ({
    doc,
    previousDoc,
  }: {
    doc: { slug?: string | null }
    previousDoc?: { slug?: string | null }
  }) => {
    run(pathsFor(collection, doc))
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) run(pathsFor(collection, previousDoc))
    return doc
  }) as CollectionAfterChangeHook & CollectionAfterDeleteHook

/** Globals (navigation, site settings, beta access) can change any page's chrome: refresh the whole site layout. */
export const revalidateGlobal: GlobalAfterChangeHook = ({ doc }) => {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // see above
  }
  return doc
}
