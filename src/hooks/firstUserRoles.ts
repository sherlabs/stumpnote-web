import type { CollectionBeforeValidateHook } from 'payload'
import { isAdminUser } from '@/access/roles'

/**
 * Roles bootstrap for the `users` collection.
 *
 * Without this the first account (created through the admin "create first user" screen)
 * would receive the default `viewer` role and nobody could ever grant admin: lockout.
 *
 * - Empty collection: force `roles = ['admin']`.
 * - Otherwise: only an admin may choose roles; anything else is reset to `['viewer']`.
 */
export const firstUserRoles: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  })

  if (totalDocs === 0) return { ...data, roles: ['admin'] }
  if (isAdminUser(req.user)) return data
  return { ...data, roles: ['viewer'] }
}
