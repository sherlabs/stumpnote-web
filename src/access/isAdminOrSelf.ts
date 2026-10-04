import type { Access } from 'payload'
import { isAdminUser } from './roles'

/** Admins see/update everyone; everybody else only their own user document. */
export const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (isAdminUser(req.user)) return true
  return { id: { equals: req.user.id } }
}
