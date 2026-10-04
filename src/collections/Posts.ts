import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { richText } from '@/fields/richText'
import { revalidateDoc } from '@/hooks/revalidate'
import { autosaveDrafts, publicContentBase, livePreviewFor } from './shared'

export const Posts: CollectionConfig = {
  ...publicContentBase,
  versions: autosaveDrafts,
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', '_status'],
    livePreview: livePreviewFor('posts'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'excerpt', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', editor: richText },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'authorName',
      type: 'text',
      defaultValue: 'The StumpNote team',
      admin: { description: 'Display name only. Never an email address.' },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 6,
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
  ],
  hooks: { afterChange: [revalidateDoc('posts')], afterDelete: [revalidateDoc('posts')] },
}
