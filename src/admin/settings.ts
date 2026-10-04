import 'server-only'
import type { Payload } from 'payload'
import { parseRange, type Range } from '@/analytics/types'

/** Admin-entered analytics settings. Never throws: a settings read failure falls back to safe defaults. */
export async function loadSettings(
  payload: Payload,
): Promise<{ defaultRange: Range; monthlyBudgetUsd: number | null }> {
  try {
    const g = await payload.findGlobal({ slug: 'analytics-settings', overrideAccess: true })
    return {
      defaultRange: parseRange(g.defaultRange, '30d'),
      monthlyBudgetUsd: typeof g.monthlyBudgetUsd === 'number' ? g.monthlyBudgetUsd : null,
    }
  } catch {
    return { defaultRange: '30d', monthlyBudgetUsd: null }
  }
}

export const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v
