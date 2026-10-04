import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'viewer'

type MaybeUser = { roles?: unknown } | null | undefined

/** True when the user carries the given role. Tolerates legacy/partial user docs. */
export const hasRole = (user: MaybeUser, role: Role): boolean =>
  Array.isArray(user?.roles) && (user.roles as string[]).includes(role)

export const isAdminUser = (user: MaybeUser): boolean => hasRole(user, 'admin')
export const isEditorUser = (user: MaybeUser): boolean =>
  hasRole(user, 'admin') || hasRole(user, 'editor')
export const isAnyRoleUser = (user: MaybeUser): boolean =>
  isEditorUser(user) || hasRole(user, 'viewer')

export const nobody: Access = () => false
export const nobodyField: FieldAccess = () => false

/** Alias used by collections that compose their own read filter. */
export const isAnyRoleUserAccess = isAnyRoleUser
