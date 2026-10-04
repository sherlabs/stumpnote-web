import type { Field } from 'payload'
import { slugify } from '@/lib/slugify'

/**
 * Unique, indexed slug. Auto-filled from `title` when empty, always normalised.
 * Editable in the admin sidebar.
 */
export const slugField = (source: string = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'URL segment. Auto-generated from the title when empty.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const raw =
          typeof value === 'string' && value.trim() ? value : (data?.[source] as string | undefined)
        return typeof raw === 'string' ? slugify(raw) : value
      },
    ],
  },
})
