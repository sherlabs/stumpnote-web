import type { CollectionConfig } from 'payload'
import { richText } from '@/fields/richText'
import { slugField } from '@/fields/slug'
import { revalidateDoc } from '@/hooks/revalidate'
import { publicContentBase } from './shared'

export const Faqs: CollectionConfig = {
  ...publicContentBase,
  slug: 'faqs',
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'category', 'order', '_status'] },
  fields: [
    { name: 'question', type: 'text', required: true },
    slugField('question'),
    { name: 'answer', type: 'richText', editor: richText, required: true },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'general',
      options: [
        'general',
        'availability',
        'privacy',
        'pricing',
        'team',
        'coach',
        'parent',
        'support',
      ].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value })),
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
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
  hooks: { afterChange: [revalidateDoc('faqs')], afterDelete: [revalidateDoc('faqs')] },
}
