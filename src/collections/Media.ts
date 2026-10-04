import type { CollectionConfig } from 'payload'
import { isEditor } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'alt', defaultColumns: ['alt', 'filename', 'isSynthetic', 'updatedAt'] },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  upload: {
    mimeTypes: ['image/*', 'video/mp4'],
    imageSizes: [
      { name: 'thumb', width: 400, formatOptions: { format: 'webp' } },
      { name: 'card', width: 800, formatOptions: { format: 'webp' } },
      { name: 'hero', width: 1600, formatOptions: { format: 'webp' } },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
    {
      name: 'isSynthetic',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Screenshots must use the fictional demo data only.' },
    },
  ],
}
