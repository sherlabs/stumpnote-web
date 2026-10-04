import type { Access, CollectionConfig, Where } from 'payload'
import { isAdmin, isAdminField, isAnyRoleUserAccess, isEditor } from '@/access'
import { publicContentBase } from './shared'

const publishedAndApproved: Where = {
  and: [{ _status: { equals: 'published' } }, { approved: { equals: true } }],
}

const readApprovedOnly: Access = ({ req }) =>
  isAnyRoleUserAccess(req.user) ? true : publishedAndApproved

/**
 * Ships empty. Rendered only when a published record is both approved and consented.
 * Juniors require guardian consent noted in `materialConnection`.
 */
export const Testimonials: CollectionConfig = {
  ...publicContentBase,
  slug: 'testimonials',
  admin: {
    useAsTitle: 'attribution',
    defaultColumns: ['attribution', 'role', 'approved', '_status'],
  },
  access: {
    read: readApprovedOnly,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text', required: true },
    { name: 'role', type: 'text' },
    {
      name: 'consentGiven',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      validate: (value: boolean | null | undefined) =>
        value === true || 'Recorded consent is required before publishing.',
    },
    { name: 'permissionDate', type: 'date', required: true },
    {
      name: 'materialConnection',
      type: 'text',
      admin: {
        description: 'Disclosure of any material connection. Juniors: note guardian consent.',
      },
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      access: { create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar', description: 'Admin only.' },
    },
  ],
}
