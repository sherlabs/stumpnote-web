'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type Series = { key: string; label: string; color: string }
export type Kind = 'line' | 'area' | 'stackedArea' | 'stackedBars'
export type Row = { day: string } & Record<string, number | string>

const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

/** Currency / count / duration formatting is chosen by name so the props stay serialisable (server to client). */
const formats: Record<string, (n: number) => string> = {
  usd: (n) => `$${n >= 100 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n.toFixed(3)}`,
  usd4: (n) => `$${n.toFixed(4)}`,
  int: (n) => Math.round(n).toLocaleString('en-AU'),
  pct: (n) => `${(n * 100).toFixed(0)}%`,
}
export type FormatName = keyof typeof formats

type TipProps = {
  active?: boolean
  label?: string
  payload?: Array<{ name?: string; value?: number; color?: string }>
  fmt: (n: number) => string
}
function Tip({ active, label, payload, fmt }: TipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="sn-an__tip">
      <p className="sn-an__tip-head">{label ? fmtDay(label) : ''}</p>
      {payload.map((p) => (
        <p key={p.name} className="sn-an__tip-row">
          <span className="sn-an__swatch" style={{ background: p.color }} aria-hidden="true" />
          {p.name}
          <b>{fmt(Number(p.value ?? 0))}</b>
        </p>
      ))}
    </div>
  )
}

export function SeriesChart({
  data,
  series,
  kind = 'line',
  format = 'int',
  height = 240,
  ariaLabel,
}: {
  data: Row[]
  series: Series[]
  kind?: Kind
  format?: FormatName
  height?: number
  ariaLabel: string
}) {
  const fmt = formats[format] ?? formats.int!
  const common = { data, margin: { top: 8, right: 8, bottom: 0, left: 0 } }
  const axes = (
    <>
      <CartesianGrid vertical={false} stroke="var(--theme-elevation-100)" />
      <XAxis
        dataKey="day"
        tickFormatter={fmtDay}
        tickLine={false}
        axisLine={false}
        minTickGap={36}
        tick={{ fill: 'var(--theme-elevation-600)', fontSize: 11 }}
      />
      <YAxis
        tickFormatter={fmt}
        tickLine={false}
        axisLine={false}
        width={52}
        tick={{ fill: 'var(--theme-elevation-600)', fontSize: 11 }}
      />
      <Tooltip content={<Tip fmt={fmt} />} cursor={{ stroke: 'var(--theme-elevation-300)' }} />
    </>
  )
  return (
    <div className="sn-an__chart" role="img" aria-label={ariaLabel} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height }}>
        {kind === 'stackedBars' ? (
          <BarChart {...common}>
            {axes}
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId="a"
                fill={s.color}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        ) : kind === 'line' ? (
          <LineChart {...common}>
            {axes}
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart {...common}>
            {axes}
            {series.map((s) => (
              <Area
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                fill={s.color}
                fillOpacity={kind === 'area' ? 0.18 : 0.55}
                strokeWidth={kind === 'area' ? 2 : 1}
                stackId={kind === 'stackedArea' ? 'a' : undefined}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
