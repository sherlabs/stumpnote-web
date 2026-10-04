import type { Access } from 'payload'
import { isAnyRoleUser } from './roles'

/**
 * Anonymous callers read published documents only. Signed-in staff read everything
 * (drafts included) so the admin panel and Live Preview keep working.
 */
export const publishedOnly: Access = ({ req }) => {
  if (isAnyRoleUser(req.user)) return true
  return { _status: { equals: 'published' } }
}
