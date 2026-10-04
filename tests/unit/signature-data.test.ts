import { describe, expect, it } from 'vitest'
import { parseScript } from '@/components/signature/transcript'
import { pitchData, seriesData } from '@/components/signature/data'

describe('KineticTranscript parse', () => {
  it('marks beats and attaches punctuation after a closing marker to the previous word', () => {
    const w = parseScript(['Slow down and [[trust your first ten balls]].'])
    expect(w.map((x) => x.text).join(' ')).toBe('Slow down and trust your first ten balls.')
    expect(w.filter((x) => x.beat).map((x) => x.text)).toEqual([
      'trust',
      'your',
      'first',
      'ten',
      'balls.',
    ])
  })
  it('does not glue words that follow an opening marker to the previous word', () => {
    const w = parseScript(['then [[soft hands]] now'])
    expect(w.map((x) => x.text)).toEqual(['then', 'soft', 'hands', 'now'])
  })
})

describe('generated demo data is deterministic', () => {
  it('pitch data sums to 1 and peaks on good length, off', () => {
    const a = pitchData(7)
    expect(pitchData(7)).toEqual(a)
    expect(a.reduce((x, y) => x + y, 0)).toBeCloseTo(1, 6)
    expect(a.indexOf(Math.max(...a))).toBe(3)
  })
  it('series data is stable and has a heart-rate gap', () => {
    const d = seriesData(11)
    expect(seriesData(11)).toEqual(d)
    expect(d.hr.filter((v) => v === null).length).toBeGreaterThan(0)
    expect(d.swing).toHaveLength(d.activity.length)
  })
})
