import type { GlobalConfig } from 'payload'
import { isEditor } from '@/access'

const linkFields = [
  { name: 'label', type: 'text' as const, required: true },
  {
    name: 'url',
    type: 'text' as const,
    required: true,
    admin: { description: 'Path (/features) or full URL.' },
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: { read: () => true, update: isEditor },
  fields: [
    {
      name: 'headerItems',
      type: 'array',
      maxRows: 6,
      fields: linkFields,
    },
    {
      name: 'headerCta',
      type: 'group',
      fields: linkFields.map((f) => ({ ...f, required: false })),
    },
    {
      name: 'footerColumns',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'items', type: 'array', fields: linkFields },
      ],
    },
    {
      name: 'footerLegalItems',
      type: 'array',
      admin: { description: 'The Apple standard EULA link is added automatically by the footer.' },
      fields: linkFields,
    },
  ],
}
