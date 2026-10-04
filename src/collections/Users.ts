import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isAdminOrSelf } from '@/access'
import { firstUserRoles } from '@/hooks/firstUserRoles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', defaultColumns: ['name', 'email', 'roles'] },
  auth: {
    tokenExpiration: 7200,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' },
  },
  access: {
    // Self-registration is closed. Payload's first-register endpoint bypasses this
    // (it only runs while the collection is empty); see decisions.md.
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: { beforeValidate: [firstUserRoles] },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['viewer'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      saveToJWT: true,
      // `create` stays open: the collection hook decides (first user => admin, otherwise viewer).
      access: { create: () => true, update: isAdminField },
      admin: {
        description: 'Admin: everything incl. analytics. Editor: content. Viewer: read-only.',
      },
    },
  ],
}
