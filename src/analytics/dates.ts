/** Small UTC date helpers shared by fixtures, adapters and aggregation (pure, no server-only so tests can import it). */
export const todayUtc = (now: Date = new Date()): string => now.toISOString().slice(0, 10)

export const addDays = (iso: string, d: number): string => {
  const t = new Date(`${iso}T00:00:00Z`)
  t.setUTCDate(t.getUTCDate() + d)
  return t.toISOString().slice(0, 10)
}

export const diffDays = (a: string, b: string): number =>
  Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000)

/** First day included in a window of `days` days ending today (inclusive). */
export const sinceDay = (days: number, now: Date = new Date()): string =>
  addDays(todayUtc(now), -(days - 1))

export const monthStart = (now: Date = new Date()): string => `${todayUtc(now).slice(0, 7)}-01`

export const daysLeftInMonth = (now: Date = new Date()): number => {
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const end = Date.UTC(y, m + 1, 1)
  const today = Date.UTC(y, m, now.getUTCDate())
  return Math.round((end - today) / 86_400_000)
}
