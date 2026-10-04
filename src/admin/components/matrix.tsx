import { DataTable } from './Panel'
import { Hidden } from './lists'
import { dayLabel, int, pct } from '../fmt'

/** Feature x week heat table. `null` cells are suppressed (< k) and render as "hidden (< k)". */
export function HeatTable({
  features,
  weeks,
  cells,
  max,
  caption,
}: {
  features: string[]
  weeks: string[]
  cells: Array<Array<number | null>>
  max: number
  caption: string
}) {
  if (!features.length)
    return <p className="sn-an__muted">No cells clear the privacy threshold in this range.</p>
  return (
    <>
      <div className="sn-an__scroll" tabIndex={0} role="region" aria-label={caption}>
        <table className="sn-an__heat">
          <caption className="sn-an__sr">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {weeks.map((w) => (
                <th key={w} scope="col">
                  {dayLabel(w)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={f}>
                <th scope="row">{f.replace(/_/g, ' ')}</th>
                {(cells[i] ?? []).map((v, j) =>
                  v == null ? (
                    <td key={j} className="sn-an__heat-cell sn-an__heat-cell--hidden">
                      <Hidden />
                    </td>
                  ) : (
                    <td
                      key={j}
                      className="sn-an__heat-cell"
                      style={{ ['--v' as string]: String(max > 0 ? v / max : 0) }}
                    >
                      {int(v)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/** Persona x feature user counts with suppressed cells called out. */
export function PersonaMatrix({
  personas,
  features,
  matrix,
  hidden,
}: {
  personas: string[]
  features: string[]
  matrix: Array<Array<number | null>>
  hidden: number
}) {
  if (!features.length) return <p className="sn-an__muted">No cells clear the privacy threshold.</p>
  return (
    <>
      <div
        className="sn-an__scroll"
        tabIndex={0}
        role="region"
        aria-label="Feature adoption by persona, last 30 days"
      >
        <table className="sn-an__heat">
          <caption className="sn-an__sr">Users per feature by persona, last 30 days</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {personas.map((p) => (
                <th key={p} scope="col">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={f}>
                <th scope="row">{f.replace(/_/g, ' ')}</th>
                {(matrix[i] ?? []).map((v, j) =>
                  v == null ? (
                    <td key={j} className="sn-an__heat-cell sn-an__heat-cell--hidden">
                      <Hidden />
                    </td>
                  ) : (
                    <td
                      key={j}
                      className="sn-an__heat-cell"
                      style={{ ['--v' as string]: String(Math.min(1, v / 60)) }}
                    >
                      {int(v)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hidden > 0 ? (
        <p className="sn-an__note">{hidden} cell(s) hidden: fewer than k users (or none).</p>
      ) : null}
    </>
  )
}

/** Weekly cohort triangle: share of the cohort active in week N. */
export function CohortTriangle({
  cohorts,
  maxWeek,
}: {
  cohorts: Array<{ cohort: string; size: number; cells: Array<number | null> }>
  maxWeek: number
}) {
  if (!cohorts.length)
    return <p className="sn-an__muted">No cohort clears the privacy threshold yet.</p>
  return (
    <div className="sn-an__scroll" tabIndex={0} role="region" aria-label="Weekly retention cohorts">
      <table className="sn-an__heat">
        <caption className="sn-an__sr">
          Share of each weekly signup cohort active in week N after signup
        </caption>
        <thead>
          <tr>
            <th scope="col">Cohort (week of)</th>
            <th scope="col">Size</th>
            {Array.from({ length: maxWeek + 1 }, (_, w) => (
              <th key={w} scope="col">
                W{w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.cohort}>
              <th scope="row">{dayLabel(c.cohort)}</th>
              <td className="sn-an__heat-cell sn-an__heat-cell--plain">{int(c.size)}</td>
              {c.cells.map((v, j) =>
                v == null ? (
                  <td
                    key={j}
                    className="sn-an__heat-cell sn-an__heat-cell--empty"
                    aria-label="not yet observed"
                  />
                ) : (
                  <td
                    key={j}
                    className="sn-an__heat-cell"
                    style={{ ['--v' as string]: String(Math.min(1, v)) }}
                  >
                    {pct(v)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { DataTable }
