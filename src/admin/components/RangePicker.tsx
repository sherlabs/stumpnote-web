import { RANGES, type Range } from '@/analytics/types'

/** 7d / 30d / 90d as plain links (works without JavaScript; state lives in the URL). */
export function RangePicker({
  basePath,
  range,
  keep = {},
}: {
  basePath: string
  range: Range
  keep?: Record<string, string | undefined>
}) {
  const href = (r: Range) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(keep)) if (v) q.set(k, v)
    q.set('range', r)
    return `${basePath}?${q.toString()}`
  }
  return (
    <nav className="sn-an__range" aria-label="Date range">
      {RANGES.map((r) => (
        <a
          key={r}
          href={href(r)}
          aria-current={r === range ? 'page' : undefined}
          className="sn-an__range-link"
        >
          {r}
        </a>
      ))}
    </nav>
  )
}
