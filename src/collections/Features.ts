import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { publicContentBase } from './shared'

export const Features: CollectionConfig = {
  ...publicContentBase,
  slug: 'features',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'area', 'status', 'order', '_status'],
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
    // bullets, howItWorks, scenario, demo, media, personas, related: S4.
  ],
}
