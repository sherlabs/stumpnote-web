import type { CollectionConfig } from 'payload'
import { isAdmin, nobody } from '@/access'

/** Append-only record of admin analytics views and publishes. Written by hooks/views via the Local API. */
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  admin: { useAsTitle: 'action', defaultColumns: ['action', 'panel', 'user', 'createdAt'] },
  access: { create: nobody, read: isAdmin, update: nobody, delete: nobody },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'action', type: 'text', required: true },
    { name: 'panel', type: 'text' },
    { name: 'range', type: 'text' },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
}
