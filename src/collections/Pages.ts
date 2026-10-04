import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { pageBlocks, linkGroup } from '@/blocks'
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
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None (the home page uses a Hero (story) block instead)', value: 'none' },
            { label: 'Standard', value: 'standard' },
            { label: 'Persona', value: 'persona' },
            { label: 'Legal', value: 'legal' },
          ],
        },
        { name: 'overline', type: 'text' },
        { name: 'headline', type: 'textarea' },
        { name: 'subcopy', type: 'textarea' },
        linkGroup('primaryCta', 'Primary CTA'),
        linkGroup('secondaryCta', 'Secondary CTA'),
        {
          name: 'persona',
          type: 'select',
          defaultValue: 'player',
          options: PERSONAS.filter((p) => p.value !== 'none'),
        },
      ],
    },
    { name: 'layout', type: 'blocks', blocks: pageBlocks },
  ],
}
