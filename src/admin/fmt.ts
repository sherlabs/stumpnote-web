const nf0 = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1 })
const compact = new Intl.NumberFormat('en-AU', { notation: 'compact', maximumFractionDigits: 1 })

export const int = (v: number | null | undefined): string => (v == null ? 'n/a' : nf0.format(v))
export const dec1 = (v: number | null | undefined): string => (v == null ? 'n/a' : nf1.format(v))
export const short = (v: number | null | undefined): string =>
  v == null ? 'n/a' : compact.format(v)
export const pct = (v: number | null | undefined, dp = 0): string =>
  v == null ? 'n/a' : `${(v * 100).toFixed(dp)}%`
export const usd = (v: number | null | undefined): string => {
  if (v == null) return 'n/a'
  const a = Math.abs(v)
  const dp = a >= 100 ? 0 : a >= 1 ? 2 : a >= 0.01 ? 3 : 4
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
}
export const ms = (v: number | null | undefined): string =>
  v == null ? 'n/a' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`
export const dayLabel = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
export const label = (s: string): string => s.replace(/[-_]/g, ' ')
