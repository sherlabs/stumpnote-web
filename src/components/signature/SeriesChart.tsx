'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { useReveal } from '@/lib/motion/useReveal'
import { cn } from '@/lib/cn'
import { N, seriesData } from './data'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

const PLOT_L = 10
const PLOT_R = 630

const x = (i: number) => PLOT_L + (i / (N - 1)) * (PLOT_R - PLOT_L)

function path(points: Array<[number, number]>) {
  return points.map(([px, py], k) => `${k ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
}

/**
 * Watch series: swing speed (dots + rolling median + peak marker), heart rate with zone bands and a visible gap, and
 * a thin activity strip. Hand-built SVG, lines draw on when scrolled into view. The values live in a hidden table.
 */
export function SeriesChart({ seed = 11, reducedMotion, persona, className }: SignatureProps) {
  const d = useMemo(() => seriesData(seed), [seed])
  const { ref, replay } = useReveal<HTMLDivElement>(0.3)

  const sy = (v: number) => 130 - ((v - 380) / (680 - 380)) * 116 // swing plot: y 14..130
  const hy = (v: number) => 100 - ((v - 90) / (180 - 90)) * 88 // hr plot: y 12..100
  const medPath = path(d.median.map((v, i) => [x(i), sy(v)]))
  const peakIdx = d.swing.indexOf(Math.max(...d.swing))

  const seg = (from: number, to: number) => {
    const pts: Array<[number, number]> = []
    for (let i = from; i <= to; i++) if (d.hr[i] !== null) pts.push([x(i), hy(d.hr[i] as number)])
    return path(pts)
  }

  return (
    <figure
      data-persona={persona}
      {...staticAttr(reducedMotion)}
      className={cn('flex w-full max-w-[640px] flex-col gap-4', className)}
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow">Watch session</p>
        <Badge status="Preview" />
      </div>
      <div ref={ref} className="flex flex-col gap-5" data-series>
        <div
          role="img"
          aria-label="Swing speed per swing with a rolling median and the session peak marked. Sample data. Values are in the table below."
        >
          <p className="body-sm mb-2 font-semibold text-text">Swing speed (wrist), °/s</p>
          <svg viewBox="0 0 640 140" className="block h-auto w-full" aria-hidden>
            {[0.2, 0.55, 0.9].map((g) => (
              <line
                key={g}
                x1="0"
                x2="640"
                y1={sy(380 + g * 300)}
                y2={sy(380 + g * 300)}
                stroke="var(--hairline-2)"
              />
            ))}
            {d.swing.map((v, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={sy(v)}
                r="3.2"
                fill="var(--muted)"
                opacity="0.6"
                data-reveal="idle"
                data-reveal-style="fade"
                style={{ '--i': i, '--stagger': '28ms' } as React.CSSProperties}
              />
            ))}
            <path
              d={medPath}
              pathLength={1}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              data-reveal="idle"
              data-reveal-style="draw"
            />
            <g
              data-reveal="idle"
              data-reveal-style="fade"
              style={{ '--i': 20, '--stagger': '90ms' } as React.CSSProperties}
            >
              <circle
                cx={x(peakIdx)}
                cy={sy(d.swing[peakIdx])}
                r="9"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
            </g>
          </svg>
        </div>
        <div
          role="img"
          aria-label="Heart rate across the session with zone bands and one gap where the watch lost contact. Sample data. Values are in the table below."
        >
          <p className="body-sm mb-2 font-semibold text-text">
            Heart rate (bpm) <span className="font-normal text-muted">· zones 2 to 5</span>
          </p>
          <svg viewBox="0 0 640 110" className="block h-auto w-full" aria-hidden>
            {[0, 1, 2, 3].map((k) => (
              <rect
                key={k}
                x="0"
                y={6 + k * 24}
                width="640"
                height="24"
                fill="var(--text)"
                opacity={[0.1, 0.065, 0.04, 0.02][k]}
              />
            ))}
            <path
              d={seg(0, 24)}
              pathLength={1}
              fill="none"
              stroke="var(--text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              data-reveal="idle"
              data-reveal-style="draw"
            />
            <path
              d={seg(29, N - 1)}
              pathLength={1}
              fill="none"
              stroke="var(--text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              data-reveal="idle"
              data-reveal-style="draw"
              style={{ '--i': 6 } as React.CSSProperties}
            />
            <line
              x1={x(24.6)}
              x2={x(28.4)}
              y1="56"
              y2="56"
              stroke="var(--muted)"
              strokeWidth="2"
              strokeDasharray="4 5"
            />
          </svg>
          <p className="body-sm mt-1 text-muted">Dashed segment: no data (watch off the wrist).</p>
        </div>
        <div role="img" aria-label="Activity level across the session. Sample data.">
          <p className="body-sm mb-2 font-semibold text-text">Activity</p>
          <svg viewBox="0 0 640 34" className="block h-auto w-full" aria-hidden>
            {d.activity.map((a, i) => (
              <rect
                key={i}
                x={x(i) - 4}
                y={32 - a * 30}
                width="8"
                height={a * 30}
                rx="2.5"
                fill="var(--accent)"
                opacity={0.35 + a * 0.5}
                data-reveal="idle"
                data-reveal-style="fade"
                style={{ '--i': i, '--stagger': '24ms' } as React.CSSProperties}
              />
            ))}
          </svg>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <figcaption className="body-sm text-muted">
          Wrist speed proxy. Preview. Sample data. Session peak {d.swing[peakIdx]} °/s.
        </figcaption>
        <button
          type="button"
          onClick={replay}
          className="body-sm text-muted underline underline-offset-4 hover:text-text"
        >
          Replay
        </button>
      </div>
      <div className="sr-only">
        <table>
          <caption>
            Sample session values: swing speed in degrees per second and heart rate in bpm per
            reading
          </caption>
          <thead>
            <tr>
              <th scope="col">Reading</th>
              <th scope="col">Swing speed (wrist), °/s</th>
              <th scope="col">Heart rate, bpm</th>
            </tr>
          </thead>
          <tbody>
            {d.swing.map((v, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{v}</td>
                <td>{d.hr[i] ?? 'no data'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
