import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { publicContentBase } from './shared'

const PERSONAS = [
  { label: 'Player', value: 'player' },
  { label: 'Coach', value: 'coach' },
  { label: 'Parent', value: 'parent' },
  { label: 'Team', value: 'team' },
  { label: 'None', value: 'none' },
]

export const Pages: CollectionConfig = {
  ...publicContentBase,
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'persona',
      type: 'select',
      defaultValue: 'none',
      options: PERSONAS,
      admin: { position: 'sidebar', description: 'Sets the page accent (data-persona).' },
    },
    { name: 'showInNav', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Forced on for legal pages in notice mode.' },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    // hero group and layout blocks arrive in S3.
  ],
}
