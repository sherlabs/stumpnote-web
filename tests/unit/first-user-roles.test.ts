import { describe, expect, it, vi } from 'vitest'
import type { CollectionBeforeValidateHook } from 'payload'
import { firstUserRoles } from '@/hooks/firstUserRoles'

type Args = Parameters<CollectionBeforeValidateHook>[0]

const run = async (opts: {
  existingUsers: number
  operation?: 'create' | 'update'
  requester?: { roles?: string[] } | null
  data?: Record<string, unknown>
}) => {
  const count = vi.fn().mockResolvedValue({ totalDocs: opts.existingUsers })
  const args = {
    data: opts.data ?? { email: 'a@example.test', roles: ['viewer'] },
    operation: opts.operation ?? 'create',
    req: { user: opts.requester ?? null, payload: { count } },
  } as unknown as Args
  const result = (await firstUserRoles(args)) as Record<string, unknown>
  return { result, count }
}

describe('firstUserRoles', () => {
  it('forces admin for the very first user, ignoring client input', async () => {
    const { result } = await run({
      existingUsers: 0,
      data: { email: 'a@example.test', roles: ['viewer'] },
    })
    expect(result.roles).toEqual(['admin'])
  })

  it('forces admin for the first user even when no roles were sent', async () => {
    const { result } = await run({ existingUsers: 0, data: { email: 'a@example.test' } })
    expect(result.roles).toEqual(['admin'])
  })

  it('resets roles to viewer when a non-admin / anonymous caller creates a later user', async () => {
    const anon = await run({
      existingUsers: 3,
      data: { email: 'b@example.test', roles: ['admin'] },
    })
    expect(anon.result.roles).toEqual(['viewer'])
    const editor = await run({
      existingUsers: 3,
      requester: { roles: ['editor'] },
      data: { email: 'c@example.test', roles: ['admin'] },
    })
    expect(editor.result.roles).toEqual(['viewer'])
  })

  it('lets an admin choose roles for a later user', async () => {
    const { result } = await run({
      existingUsers: 3,
      requester: { roles: ['admin'] },
      data: { email: 'd@example.test', roles: ['editor'] },
    })
    expect(result.roles).toEqual(['editor'])
  })

  it('does not touch updates and does not query the database', async () => {
    const { result, count } = await run({
      existingUsers: 0,
      operation: 'update',
      data: { roles: ['viewer'] },
    })
    expect(result.roles).toEqual(['viewer'])
    expect(count).not.toHaveBeenCalled()
  })
})
