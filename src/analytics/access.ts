import 'server-only'
import { notFound } from 'next/navigation'
import type { InitPageResult } from 'payload'
import { isAdminUser } from '@/access'

/** Views per user per rolling minute before the "slow down" state replaces the query (docs/spec/01 section 8.2). */
export const THROTTLE_LIMIT = 30

export const isThrottled = (recentViews: number, limit: number = THROTTLE_LIMIT): boolean =>
  recentViews >= limit

export type ViewAction = 'view:web' | 'view:ai-spend' | 'view:product' | 'view:ai-spend:over-pace'

const cut = (v: string | null | undefined, n: number): string | undefined =>
  v ? v.slice(0, n) : undefined

/**
 * Admin gate for every analytics view. Custom admin views are reachable without a session (Payload treats them as
 * public routes), so this runs first: anyone who is not an admin gets a 404, not a hint that the view exists.
 * Then it throttles (counting the user's audit rows from the last 60 s) and writes the audit row.
 */
export async function requireAdmin(
  initPageResult: InitPageResult,
  action: ViewAction,
  extra: { panel?: string; range?: string } = {},
): Promise<{ throttled: boolean; userId: number | string }> {
  const { req } = initPageResult
  const user = req.user
  if (!user || !isAdminUser(user)) notFound()

  const payload = req.payload
  const since = new Date(Date.now() - 60_000).toISOString()
  let recent = 0
  try {
    const res = await payload.count({
      collection: 'audit-log',
      overrideAccess: true,
      where: {
        and: [
          { user: { equals: user.id } },
          { action: { like: 'view:' } },
          { createdAt: { greater_than: since } },
        ],
      },
    })
    recent = res.totalDocs
  } catch {
    recent = 0 // an audit-count failure must not take the view down
  }
  if (isThrottled(recent)) return { throttled: true, userId: user.id }

  try {
    const h = req.headers
    await payload.create({
      collection: 'audit-log',
      overrideAccess: true,
      data: {
        user: user.id,
        action,
        panel: extra.panel,
        range: extra.range,
        ip: cut(h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip'), 64),
        userAgent: cut(h.get('user-agent'), 200),
      },
    })
  } catch {
    /* audit writes are best effort; the throttle degrades to allow */
  }
  return { throttled: false, userId: user.id }
}

/** Dashboard tiles and nav links: show only to admins, render nothing otherwise (no 404 inside a nav). */
export const canSeeAnalytics = (user: unknown): boolean => isAdminUser(user as { roles?: unknown })
