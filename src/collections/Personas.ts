import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { publicContentBase } from './shared'

export const Personas: CollectionConfig = {
  ...publicContentBase,
  slug: 'personas',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'accent', '_status'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'accent',
      type: 'select',
      defaultValue: 'player',
      options: [
        { label: 'Player (teal)', value: 'player' },
        { label: 'Coach (orange)', value: 'coach' },
        { label: 'Parent (rose)', value: 'parent' },
        { label: 'Team (lime)', value: 'team' },
      ],
    },
    { name: 'headline', type: 'text' },
    {
      name: 'leadWith',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Consent (parents)', value: 'consent' },
      ],
    },
    // proofPoints, featureBlocks, faqs: S4.
  ],
}
