import { rng } from './types'

export const N = 44

/** Synthetic share of dismissals per cell. The default seed lands the peak on good length, outside off. */
export function pitchData(seed: number): number[] {
  const r = rng(seed)
  const raw = Array.from({ length: 9 }, () => 0.35 + r() * 0.65)
  raw[3] = 1.9 // Good length (row 1), Off (col 0)
  const sum = raw.reduce((a, b) => a + b, 0)
  return raw.map((v) => v / sum)
}

export type SeriesData = {
  swing: number[]
  median: number[]
  hr: Array<number | null>
  activity: number[]
}

/** Deterministic synthetic session (never copied from real data): swing speed proxy, heart rate with a gap, activity. */
export function seriesData(seed: number): SeriesData {
  const r = rng(seed)
  const swing = Array.from({ length: N }, (_, i) => {
    const warm = Math.min(1, i / 14)
    return Math.round(430 + warm * 150 + Math.sin(i / 3.1) * 26 + (r() - 0.5) * 70)
  })
  const median = swing.map((_, i) => {
    const w = swing.slice(Math.max(0, i - 4), i + 1).sort((a, b) => a - b)
    return w[Math.floor(w.length / 2)]
  })
  const hr = Array.from({ length: N }, (_, i) => {
    if (i >= 25 && i <= 28) return null // visible data gap (watch off wrist)
    return Math.round(98 + Math.min(1, i / 12) * 54 + Math.sin(i / 4.2) * 9 + (r() - 0.5) * 8)
  })
  const activity = Array.from({ length: N }, (_, i) => (i % 11 < 2 ? 0.15 : 0.35 + r() * 0.65))
  return { swing, median, hr, activity }
}
