import { DataTable, Panel } from './Panel'
import {
  SeriesChart,
  type FormatName,
  type Kind,
  type Row,
  type Series,
} from './charts/SeriesChart'
import { Legend } from './lists'
import { int, pct, usd } from '../fmt'

const tableFmt: Record<FormatName, (n: number) => string> = {
  usd: usd,
  usd4: (n) => `$${n.toFixed(4)}`,
  int: int,
  pct: (n) => pct(n),
}

/** A chart with a text alternative (hidden data table) and an optional legend. */
export function SeriesBlock({
  data,
  series,
  kind,
  format = 'int',
  ariaLabel,
  caption,
  height,
  legend = series.length > 1,
}: {
  data: Row[]
  series: Series[]
  kind?: Kind
  format?: FormatName
  ariaLabel: string
  caption: string
  height?: number
  legend?: boolean
}) {
  const f = tableFmt[format]
  return (
    <>
      {legend ? <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} /> : null}
      <SeriesChart
        data={data}
        series={series}
        kind={kind}
        format={format}
        ariaLabel={ariaLabel}
        height={height}
      />
      <DataTable
        caption={caption}
        head={['Day', ...series.map((s) => s.label)]}
        rows={data.map((r) => [r.day, ...series.map((s) => f(Number(r[s.key] ?? 0)))])}
      />
    </>
  )
}

export { Panel }
