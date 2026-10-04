import type { ReactNode } from 'react'

/** One analytics card: title, optional one-line summary (also the text alternative for the chart), body, note. */
export function Panel({
  title,
  summary,
  note,
  children,
  wide,
  id,
}: {
  title: string
  summary?: ReactNode
  note?: ReactNode
  children: ReactNode
  wide?: boolean
  id?: string
}) {
  return (
    <section
      className={`sn-an__panel${wide ? ' sn-an__panel--wide' : ''}`}
      aria-labelledby={id ? `${id}-h` : undefined}
      id={id}
    >
      <h2 className="sn-an__panel-title" id={id ? `${id}-h` : undefined}>
        {title}
      </h2>
      {summary ? <p className="sn-an__panel-summary">{summary}</p> : null}
      {children}
      {note ? <p className="sn-an__note">{note}</p> : null}
    </section>
  )
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="sn-an__grid">{children}</div>
}

export function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'attention' | 'ok'
}) {
  return (
    <div className={`sn-an__tile${tone ? ` sn-an__tile--${tone}` : ''}`}>
      <p className="sn-an__tile-label">{label}</p>
      <p className="sn-an__tile-value">{value}</p>
      {hint ? <p className="sn-an__tile-hint">{hint}</p> : null}
    </div>
  )
}

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="sn-an__tiles">{children}</div>
}

/** Visually hidden data table: the accessible twin of every chart. */
export function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string
  head: string[]
  rows: Array<Array<string | number>>
}) {
  return (
    <div className="sn-an__sr">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
