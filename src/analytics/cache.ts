import 'server-only'
import { unstable_cache } from 'next/cache'

/** TTLs in seconds (docs/spec/04: web 5 min, AI spend 10, product 15, RevenueCat 30). */
export const TTL = { web: 5 * 60, ai: 10 * 60, product: 15 * 60, revenuecat: 30 * 60 } as const

/** Live results only. Fixtures are in-process JSON and need no cache. Values must be JSON-serialisable. */
export function cached<A extends unknown[], R>(
  keyParts: string[],
  revalidate: number,
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return unstable_cache(fn, ['stumpnote-admin-analytics', ...keyParts], { revalidate })
}
