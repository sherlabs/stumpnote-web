import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor, isStaff, publishedOnly } from '@/access'

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
