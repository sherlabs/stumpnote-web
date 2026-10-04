import type { Access, FieldAccess } from 'payload'
import { isAdminUser } from './roles'

export const isAdmin: Access = ({ req }) => isAdminUser(req.user)
export const isAdminField: FieldAccess = ({ req }) => isAdminUser(req.user)
