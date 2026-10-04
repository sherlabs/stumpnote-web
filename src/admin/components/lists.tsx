import type { ReactNode } from 'react'
import { DataTable } from './Panel'
import { pct } from '../fmt'

/** Horizontal bar list: label, bar, value. Pure HTML/CSS (no chart library, no client JS). */
export function BarList({
  items,
  format,
  tone = 'player',
  caption,
  empty = 'No data in this range.',
}: {
  items: Array<{ label: string; value: number; share?: number }>
  format: (n: number) => string
  tone?: 'player' | 'coach' | 'parent' | 'team'
  caption: string
  empty?: string
}) {
  if (!items.length) return <p className="sn-an__muted">{empty}</p>
  const max = Math.max(...items.map((i) => i.value), 0) || 1
  return (
    <>
      <ol className="sn-an__bars" aria-hidden="true">
        {items.map((i) => (
          <li key={i.label} className="sn-an__bar">
            <span className="sn-an__bar-label" title={i.label}>
              {i.label}
            </span>
            <span className="sn-an__bar-track">
              <span
                className={`sn-an__bar-fill sn-an__bar-fill--${tone}`}
                style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }}
              />
            </span>
            <span className="sn-an__bar-value">
              {format(i.value)}
              {i.share !== undefined ? <small>{pct(i.share)}</small> : null}
            </span>
          </li>
        ))}
      </ol>
      <DataTable
        caption={caption}
        head={['Item', 'Value']}
        rows={items.map((i) => [i.label, format(i.value)])}
      />
    </>
  )
}

/** Funnel: bars sized against the first stage, with step and overall conversion. */
export function FunnelBars({
  stages,
  caption,
}: {
  stages: Array<{ label: string; count: number; pctOfTop: number | null; pctOfPrev: number | null }>
  caption: string
}) {
  const top = stages[0]?.count || 1
  return (
    <>
      <ol className="sn-an__funnel" aria-hidden="true">
        {stages.map((s) => (
          <li key={s.label} className="sn-an__funnel-row">
            <span className="sn-an__bar-label">{s.label}</span>
            <span className="sn-an__bar-track">
              <span
                className="sn-an__bar-fill sn-an__bar-fill--player"
                style={{ width: `${Math.max(1.5, (s.count / top) * 100)}%` }}
              />
            </span>
            <span className="sn-an__bar-value">
              {s.count.toLocaleString('en-AU')}
              <small>{s.pctOfPrev == null ? 'start' : `${pct(s.pctOfPrev)} of previous`}</small>
            </span>
          </li>
        ))}
      </ol>
      <DataTable
        caption={caption}
        head={['Stage', 'Count', 'Of previous', 'Of first']}
        rows={stages.map((s) => [
          s.label,
          s.count,
          s.pctOfPrev == null ? '' : pct(s.pctOfPrev, 1),
          s.pctOfTop == null ? '' : pct(s.pctOfTop, 1),
        ])}
      />
    </>
  )
}

export function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <ul className="sn-an__legend">
      {items.map((i) => (
        <li key={i.label}>
          <span className="sn-an__swatch" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

export function Hidden({ children }: { children?: ReactNode }) {
  return <span className="sn-an__hidden-cell">{children ?? 'hidden (< k)'}</span>
}
