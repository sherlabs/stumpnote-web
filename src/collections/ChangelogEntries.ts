import type { CollectionConfig } from 'payload'
import { richText } from '@/fields/richText'
import { publicContentBase } from './shared'

export const ChangelogEntries: CollectionConfig = {
  ...publicContentBase,
  slug: 'changelog-entries',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date', 'kind', '_status'] },
  defaultSort: '-date',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'date', type: 'date', required: true },
    {
      name: 'app',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Player', value: 'player' },
        { label: 'Coach', value: 'coach' },
        { label: 'Parent', value: 'parent' },
        { label: 'Web', value: 'web' },
        { label: 'Site', value: 'site' },
      ],
    },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Improved', value: 'improved' },
        { label: 'Fixed', value: 'fixed' },
      ],
    },
    {
      name: 'publicStatus',
      type: 'select',
      defaultValue: 'in-beta',
      options: [
        { label: 'In the beta', value: 'in-beta' },
        { label: 'Available now (web)', value: 'available-web' },
      ],
    },
    {
      name: 'summary',
      type: 'richText',
      editor: richText,
      admin: { description: 'Never reference internal issue numbers.' },
    },
  ],
}
