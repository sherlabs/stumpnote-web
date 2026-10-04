import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { DEMO_OPTIONS } from '@/blocks/shared'
import { revalidateDoc } from '@/hooks/revalidate'
import { autosaveDrafts, publicContentBase, livePreviewFor } from './shared'

export const Features: CollectionConfig = {
  ...publicContentBase,
  versions: autosaveDrafts,
  slug: 'features',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'area', 'status', 'order', '_status'],
    livePreview: livePreviewFor('features'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'area',
      type: 'select',
      required: true,
      defaultValue: 'journal-memory',
      options: [
        { label: 'Journal and memory', value: 'journal-memory' },
        { label: 'Mental game', value: 'mental-game' },
        { label: 'Game day', value: 'game-day' },
        { label: 'Team', value: 'team' },
        { label: 'Coach', value: 'coach' },
        { label: 'Parent', value: 'parent' },
        { label: 'Platform', value: 'platform' },
      ],
    },
    {
      // Public vocabulary only: the four labels allowed on the site.
      name: 'status',
      type: 'select',
      // Postgres: `_status` (drafts) already owns enum_features_status; give ours its own enum name.
      enumName: 'feature_release_status',
      required: true,
      defaultValue: 'in-beta',
      options: [
        { label: 'Available now (web)', value: 'available-web' },
        { label: 'In the beta', value: 'in-beta' },
        { label: 'Preview', value: 'preview' },
        { label: 'Coming soon', value: 'coming-soon' },
      ],
    },
    { name: 'benefit', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    {
      name: 'bullets',
      type: 'array',
      maxRows: 4,
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    { name: 'howItWorks', type: 'textarea' },
    {
      name: 'scenario',
      type: 'group',
      admin: {
        description: 'Rendered under the label "Illustrative scenario". Fictional persona only.',
      },
      fields: [
        { name: 'persona', type: 'text' },
        { name: 'text', type: 'textarea' },
      ],
    },
    {
      name: 'copyRules',
      type: 'textarea',
      admin: { description: 'Internal reminder for editors. Never rendered on the site.' },
    },
    {
      name: 'demo',
      type: 'select',
      defaultValue: 'none',
      options: DEMO_OPTIONS.filter((o) => o.value !== 'learn-stage'),
      admin: { description: 'Which signature component the feature page shows.' },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Synthetic screenshots only (fictional demo data).' },
    },
    {
      name: 'personas',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Player', value: 'player' },
        { label: 'Captain', value: 'captain' },
        { label: 'Team member', value: 'member' },
        { label: 'Coach', value: 'coach' },
        { label: 'Parent', value: 'parent' },
      ],
    },
    {
      name: 'related',
      type: 'relationship',
      relationTo: 'features',
      hasMany: true,
      maxRows: 3,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'comingSoonTeaser',
      type: 'text',
      admin: {
        description: 'Allowed teaser line for the parts of this feature that are coming soon.',
      },
    },
  ],
  hooks: { afterChange: [revalidateDoc('features')], afterDelete: [revalidateDoc('features')] },
}
