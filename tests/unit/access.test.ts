import { describe, expect, it } from 'vitest'
import { hasRole, isAdminUser, isAnyRoleUser, isEditorUser } from '@/access/roles'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { publishedOnly } from '@/access/publishedOnly'
import type { Access } from 'payload'

const call = (fn: Access, user: unknown) =>
  fn({ req: { user } } as unknown as Parameters<Access>[0])

describe('role helpers', () => {
  it('detects roles and tolerates bad shapes', () => {
    expect(hasRole({ roles: ['admin'] }, 'admin')).toBe(true)
    expect(hasRole({ roles: 'admin' }, 'admin')).toBe(false)
    expect(hasRole(null, 'admin')).toBe(false)
    expect(hasRole(undefined, 'viewer')).toBe(false)
  })
  it('admin implies editor; viewer is staff only', () => {
    expect(isEditorUser({ roles: ['admin'] })).toBe(true)
    expect(isEditorUser({ roles: ['editor'] })).toBe(true)
    expect(isEditorUser({ roles: ['viewer'] })).toBe(false)
    expect(isAdminUser({ roles: ['editor'] })).toBe(false)
    expect(isAnyRoleUser({ roles: ['viewer'] })).toBe(true)
    expect(isAnyRoleUser({ roles: [] })).toBe(false)
  })
})

describe('access functions', () => {
  it('isAdmin: only admins', () => {
    expect(call(isAdmin, null)).toBe(false)
    expect(call(isAdmin, { roles: ['editor'] })).toBe(false)
    expect(call(isAdmin, { roles: ['admin'] })).toBe(true)
  })
  it('isAdminOrSelf: admin all, others only themselves, anon nothing', () => {
    expect(call(isAdminOrSelf, null)).toBe(false)
    expect(call(isAdminOrSelf, { id: 1, roles: ['admin'] })).toBe(true)
    expect(call(isAdminOrSelf, { id: 7, roles: ['viewer'] })).toEqual({ id: { equals: 7 } })
  })
  it('publishedOnly: anon sees published only; staff see all', () => {
    expect(call(publishedOnly, null)).toEqual({ _status: { equals: 'published' } })
    expect(call(publishedOnly, { roles: ['viewer'] })).toBe(true)
    expect(call(publishedOnly, { roles: [] })).toEqual({ _status: { equals: 'published' } })
  })
})
