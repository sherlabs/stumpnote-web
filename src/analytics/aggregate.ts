import { addDays, diffDays, sinceDay } from './dates'
import type {
  ActiveUsersDailyRow,
  AiBudgetMonthRow,
  AiCacheLayerDailyRow,
  AiDailyRow,
  AiLatencyDailyRow,
  FeatureAdoptionByPersonaRow,
  FeatureAdoptionDailyRow,
  FunnelWeeklyRow,
  RetentionWeeklyRow,
  SignupsDailyRow,
  SubscriptionStatusRow,
  WebPanels,
} from './types'

/** Pure aggregation over view rows. No I/O, so every panel's maths is unit-tested. */

export type AiFilters = { model?: string; fn?: string; scope?: string }

export function filterAiDaily(
  rows: AiDailyRow[],
  days: number,
  f: AiFilters = {},
  now?: Date,
): AiDailyRow[] {
  const since = sinceDay(days, now)
  return rows.filter(
    (r) =>
      r.day >= since &&
      (!f.model || r.model === f.model) &&
      (!f.fn || r.function_name === f.fn) &&
      (!f.scope || r.scope === f.scope),
  )
}

/** Every day in the window, zero-filled, so a quiet day shows as zero rather than a gap. */
export function dayAxis(days: number, now?: Date): string[] {
  const start = sinceDay(days, now)
  return Array.from({ length: days }, (_, i) => addDays(start, i))
}

export function dailyCost(
  rows: AiDailyRow[],
  days: number,
  now?: Date,
): Array<{ day: string; cost: number }> {
  const m = new Map<string, number>()
  for (const r of rows) m.set(r.day, (m.get(r.day) ?? 0) + r.cost_usd)
  return dayAxis(days, now).map((day) => ({ day, cost: m.get(day) ?? 0 }))
}

export type Ranked = { label: string; value: number; share: number }

export function rank(entries: Array<[string, number]>, limit: number): Ranked[] {
  const total = entries.reduce((s, [, v]) => s + v, 0)
  return entries
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value, share: total > 0 ? value / total : 0 }))
}

export function costByFunction(rows: AiDailyRow[], limit = 12): Ranked[] {
  const m = new Map<string, number>()
  for (const r of rows) m.set(r.function_name, (m.get(r.function_name) ?? 0) + r.cost_usd)
  return rank([...m.entries()], limit)
}

export function costByModelPerDay(rows: AiDailyRow[], days: number, now?: Date) {
  const models = [...new Set(rows.map((r) => r.model))].sort()
  const byDay = new Map<string, Record<string, number>>()
  for (const r of rows) {
    const cur = byDay.get(r.day) ?? {}
    cur[r.model] = (cur[r.model] ?? 0) + r.cost_usd
    byDay.set(r.day, cur)
  }
  return {
    models,
    rows: dayAxis(days, now).map((day) => ({
      day,
      ...Object.fromEntries(models.map((m) => [m, byDay.get(day)?.[m] ?? 0])),
    })) as Array<{ day: string } & Record<string, number | string>>,
  }
}

export function cacheSavings(
  layers: AiCacheLayerDailyRow[],
  ai: AiDailyRow[],
  days: number,
  now?: Date,
) {
  const since = sinceDay(days, now)
  const inWindow = layers.filter((l) => l.day >= since)
  const names = [...new Set(inWindow.map((l) => l.cache_layer))].sort()
  const byDay = new Map<string, Record<string, number>>()
  for (const l of inWindow) {
    const cur = byDay.get(l.day) ?? {}
    cur[l.cache_layer] = (cur[l.cache_layer] ?? 0) + l.saved_cost_usd
    byDay.set(l.day, cur)
  }
  const saved = inWindow.reduce((s, l) => s + l.saved_cost_usd, 0)
  const spent = ai.filter((r) => r.day >= since).reduce((s, r) => s + r.cost_usd, 0)
  return {
    layers: names,
    rows: dayAxis(days, now).map((day) => ({
      day,
      ...Object.fromEntries(names.map((n) => [n, byDay.get(day)?.[n] ?? 0])),
    })) as Array<{ day: string } & Record<string, number | string>>,
    saved,
    spent,
    /** saved / (saved + spent): the share of would-be spend that caching avoided. */
    ratio: saved + spent > 0 ? saved / (saved + spent) : null,
  }
}

export function waste(rows: AiDailyRow[], days: number, now?: Date) {
  const m = new Map<string, { wasted: number; errors: number; timeouts: number; retries: number }>()
  for (const r of rows) {
    const c = m.get(r.day) ?? { wasted: 0, errors: 0, timeouts: 0, retries: 0 }
    c.wasted += r.wasted_cost_usd
    c.errors += r.errors
    c.timeouts += r.timeouts
    c.retries += r.retries
    m.set(r.day, c)
  }
  const series = dayAxis(days, now).map((day) => ({
    day,
    ...(m.get(day) ?? { wasted: 0, errors: 0, timeouts: 0, retries: 0 }),
  }))
  const sum = (k: 'wasted' | 'errors' | 'timeouts' | 'retries') =>
    series.reduce((s, r) => s + r[k], 0)
  return {
    series,
    totals: {
      wasted: sum('wasted'),
      errors: sum('errors'),
      timeouts: sum('timeouts'),
      retries: sum('retries'),
    },
  }
}

/** Call-weighted mean of the daily percentiles per function. An approximation (percentiles do not average exactly). */
export function latencyByFunction(rows: AiLatencyDailyRow[], days: number, now?: Date) {
  const since = sinceDay(days, now)
  const m = new Map<string, { calls: number; p50: number; p95: number }>()
  for (const r of rows) {
    if (r.day < since) continue
    const c = m.get(r.function_name) ?? { calls: 0, p50: 0, p95: 0 }
    c.calls += r.calls
    c.p50 += r.p50_ms * r.calls
    c.p95 += r.p95_ms * r.calls
    m.set(r.function_name, c)
  }
  return [...m.entries()]
    .filter(([, c]) => c.calls > 0)
    .map(([label, c]) => ({ label, calls: c.calls, p50: c.p50 / c.calls, p95: c.p95 / c.calls }))
    .sort((a, b) => b.p95 - a.p95)
}

export type BudgetState = {
  mtd: number
  projected: number
  daysRemaining: number
  budget: number | null
  /** mtd as a share of budget, 0..1+ */
  usedPct: number | null
  state: 'no-budget' | 'on-track' | 'over-pace'
}

export function budgetState(row: AiBudgetMonthRow, budget: number | null | undefined): BudgetState {
  const b = typeof budget === 'number' && budget > 0 ? budget : null
  return {
    mtd: row.mtd_cost_usd,
    projected: row.projected_eom_usd,
    daysRemaining: row.days_remaining,
    budget: b,
    usedPct: b ? row.mtd_cost_usd / b : null,
    state: b === null ? 'no-budget' : row.projected_eom_usd > b ? 'over-pace' : 'on-track',
  }
}

export function aiFilterOptions(rows: AiDailyRow[]) {
  const uniq = (xs: string[]) => [...new Set(xs)].sort()
  return {
    models: uniq(rows.map((r) => r.model)),
    functions: uniq(rows.map((r) => r.function_name)),
    scopes: uniq(rows.map((r) => r.scope)),
  }
}

// ------------------------------------------------------------------ product
export const weekStart = (iso: string): string => {
  const dow = new Date(`${iso}T00:00:00Z`).getUTCDay()
  return addDays(iso, -((dow + 6) % 7))
}

export function activeSeries(rows: ActiveUsersDailyRow[]) {
  return [...rows].sort((a, b) => a.day.localeCompare(b.day))
}

export function signupsByDay(rows: SignupsDailyRow[], days: number, now?: Date) {
  const since = sinceDay(days, now)
  const personas = [...new Set(rows.map((r) => r.persona))].sort()
  const inWin = rows.filter((r) => r.day >= since)
  const byDay = new Map<string, Record<string, number>>()
  for (const r of inWin) {
    const c = byDay.get(r.day) ?? {}
    c[r.persona] = (c[r.persona] ?? 0) + r.accounts
    byDay.set(r.day, c)
  }
  const accounts = inWin.reduce((s, r) => s + r.accounts, 0)
  const onboarded = inWin.reduce((s, r) => s + r.onboarded, 0)
  return {
    personas,
    rows: dayAxis(days, now).map((day) => ({
      day,
      ...Object.fromEntries(personas.map((p) => [p, byDay.get(day)?.[p] ?? 0])),
    })) as Array<{ day: string } & Record<string, number | string>>,
    accounts,
    onboarded,
    onboardingPct: accounts > 0 ? onboarded / accounts : null,
  }
}

/** Feature x week matrix of events. `null` = the cell is suppressed below k (or has no activity). */
export function featureHeat(rows: FeatureAdoptionDailyRow[], days: number, now?: Date) {
  const since = sinceDay(days, now)
  const inWin = rows.filter((r) => r.day >= since)
  const features = [...new Set(inWin.map((r) => r.feature))].sort()
  const weeks = [...new Set(dayAxis(days, now).map(weekStart))].sort()
  const cell = new Map<string, number>()
  for (const r of inWin) {
    const key = `${r.feature}|${weekStart(r.day)}`
    cell.set(key, (cell.get(key) ?? 0) + r.events)
  }
  let max = 0
  for (const v of cell.values()) max = Math.max(max, v)
  return {
    features,
    weeks,
    max,
    cells: features.map((f) => weeks.map((w) => cell.get(`${f}|${w}`) ?? null)),
  }
}

export function adoptionByPersona(rows: FeatureAdoptionByPersonaRow[]) {
  const personas = [...new Set(rows.map((r) => r.persona))].sort()
  const features = [...new Set(rows.map((r) => r.feature))].sort()
  const v = new Map(rows.map((r) => [`${r.feature}|${r.persona}`, r.users]))
  const matrix = features.map((f) => personas.map((p) => v.get(`${f}|${p}`) ?? null))
  const hidden = matrix.reduce((s, row) => s + row.filter((c) => c === null).length, 0)
  return { personas, features, matrix, hidden }
}

export function retentionTriangle(rows: RetentionWeeklyRow[]) {
  const cohorts = [...new Set(rows.map((r) => r.cohort))].sort()
  const maxWeek = rows.reduce((m, r) => Math.max(m, r.week_n), 0)
  const idx = new Map(rows.map((r) => [`${r.cohort}|${r.week_n}`, r]))
  return {
    maxWeek,
    cohorts: cohorts.map((c) => {
      const size = rows.find((r) => r.cohort === c)?.cohort_size ?? 0
      return {
        cohort: c,
        size,
        cells: Array.from({ length: maxWeek + 1 }, (_, w) => {
          const r = idx.get(`${c}|${w}`)
          return r && r.cohort_size > 0 ? r.active_users / r.cohort_size : null
        }),
      }
    }),
  }
}

export const FUNNEL_STAGES = [
  ['signed_up', 'Signed up'],
  ['onboarded', 'Onboarded'],
  ['first_entry', 'First entry'],
  ['first_entry_7d', 'First entry within 7 days'],
  ['three_plus_entries', '3+ entries'],
  ['trial_started', 'Trial started'],
  ['store_subscribed', 'Store subscribed'],
] as const

export function funnel(
  rows: FunnelWeeklyRow[],
  opts: { persona?: string; cohortDays?: number; now?: Date } = {},
) {
  const from = opts.cohortDays ? weekStart(sinceDay(opts.cohortDays, opts.now)) : null
  const sel = rows.filter(
    (r) => (!from || r.cohort >= from) && (!opts.persona || r.persona === opts.persona),
  )
  const totals = FUNNEL_STAGES.map(([key, label]) => ({
    key,
    label,
    count: sel.reduce((s, r) => s + r[key], 0),
  }))
  const top = totals[0]?.count ?? 0
  return totals.map((t, i) => ({
    ...t,
    pctOfTop: top > 0 ? t.count / top : null,
    pctOfPrev:
      i === 0
        ? null
        : (totals[i - 1]?.count ?? 0) > 0
          ? t.count / (totals[i - 1]?.count ?? 1)
          : null,
  }))
}

export function subscriptionMix(rows: SubscriptionStatusRow[]) {
  const total = rows.reduce((s, r) => s + r.users, 0)
  const group = (label: (r: SubscriptionStatusRow) => string) => {
    const m = new Map<string, number>()
    for (const r of rows) m.set(label(r), (m.get(label(r)) ?? 0) + r.users)
    return rank([...m.entries()], 12)
  }
  return {
    total,
    byTier: group((r) => r.tier),
    byProvider: group((r) => r.provider),
    byTrial: group((r) => r.trial_state.replace('_', ' ')),
  }
}

// --------------------------------------------------------------------- web
export function webFunnel(panels: WebPanels) {
  const first = panels.funnel[0]?.count ?? 0
  return panels.funnel.map((f, i) => ({
    ...f,
    pctOfTop: first > 0 ? f.count / first : null,
    pctOfPrev:
      i === 0
        ? null
        : (panels.funnel[i - 1]?.count ?? 0) > 0
          ? f.count / (panels.funnel[i - 1]?.count ?? 1)
          : null,
  }))
}

export const totalOf = (xs: Array<{ value: number }>): number => xs.reduce((s, x) => s + x.value, 0)

export const rankedFromList = (xs: Array<{ label: string; value: number }>): Ranked[] => {
  const total = totalOf(xs)
  return xs.map((x) => ({ ...x, share: total > 0 ? x.value / total : 0 }))
}

/** Used by tests and views to render "N days ago" freshness. */
export const minutesBetween = (a: string, b: string): number =>
  Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 60_000))
export { diffDays }
