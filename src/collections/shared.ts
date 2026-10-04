import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor, isStaff, publishedOnly } from '@/access'
import { serverURL } from '@/lib/env'

/** Access + versioning shared by every public-facing content collection. */
export const publicContentBase = {
  access: {
    read: publishedOnly,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  versions: { drafts: true, maxPerDoc: 25 },
} satisfies Partial<CollectionConfig>

export const staffRead = isStaff
export const adminOnly = isAdmin

/** Autosave drafts (800 ms) for the collections editors work in most (pages, features, posts). */
export const autosaveDrafts = { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 } as const

/**
 * Live Preview target: a dynamic, noindex route that renders the draft with the same templates as the public page.
 * Auth is the editor's own admin session cookie (same origin), so no preview secret is exposed.
 */
export const livePreviewFor = (collection: 'pages' | 'features' | 'personas' | 'posts') => ({
  url: ({ data }: { data: { slug?: string | null } }) =>
    `${serverURL()}/next/preview/${collection}/${encodeURIComponent(data?.slug || 'home')}`,
})
