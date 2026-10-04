import type { Access, FieldAccess } from 'payload'
import { isAnyRoleUser, isEditorUser } from './roles'

/** Admin or editor. */
export const isEditor: Access = ({ req }) => isEditorUser(req.user)
export const isEditorField: FieldAccess = ({ req }) => isEditorUser(req.user)
/** Any signed-in admin-panel user (admin, editor, viewer). */
export const isStaff: Access = ({ req }) => isAnyRoleUser(req.user)
