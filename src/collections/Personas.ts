import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { revalidateDoc } from '@/hooks/revalidate'
import { publicContentBase, livePreviewFor } from './shared'

export const Personas: CollectionConfig = {
  ...publicContentBase,
  slug: 'personas',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'accent', '_status'],
    livePreview: livePreviewFor('personas'),
  },
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
    { name: 'eyebrow', type: 'text', admin: { description: 'e.g. "For players".' } },
    { name: 'subcopy', type: 'textarea' },
    {
      name: 'proofPoints',
      type: 'array',
      maxRows: 6,
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'lead',
      type: 'group',
      admin: {
        description:
          'Optional lead section (the Parents page uses it for guardian consent and the sharing switches). Rendered before the feature blocks when "Lead with" is Consent.',
      },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          maxRows: 4,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'featureBlocks',
      type: 'relationship',
      relationTo: 'features',
      hasMany: true,
      maxRows: 4,
    },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true, maxRows: 4 },
  ],
  hooks: { afterChange: [revalidateDoc('personas')], afterDelete: [revalidateDoc('personas')] },
}
