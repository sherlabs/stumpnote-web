import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { richText } from '@/fields/richText'
import { publicContentBase } from './shared'

export const Posts: CollectionConfig = {
  ...publicContentBase,
  slug: 'posts',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'publishedAt', '_status'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'excerpt', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', editor: richText },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    // author (display name only; never email) and tags: S4.
  ],
}
