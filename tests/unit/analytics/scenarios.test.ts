import { describe, expect, it } from 'vitest'
import { priceScenario, priceScenarios } from '@/analytics/scenarios'
import type { AiTokenVolumeRow } from '@/analytics/types'

// Rates here are round TEST numbers, not real prices.
const vol = (over: Partial<AiTokenVolumeRow>): AiTokenVolumeRow => ({
  function_name: 'f',
  model: 'alpha-1',
  calls: 1,
  input_text: 1_000_000,
  input_audio: 0,
  input_image: 0,
  input_video: 0,
  cached: 0,
  output: 1_000_000,
  thinking: 0,
  tts_chars: 0,
  logged_cost_usd: 4,
  ...over,
})

describe('price scenarios', () => {
  it('computes tokens / 1e6 x rate per modality', () => {
    const r = priceScenario({ label: 'x', inputPerMillionUsd: 1, outputPerMillionUsd: 2 }, [
      vol({}),
    ])
    expect(r.projectedUsd).toBeCloseTo(3)
    expect(r.loggedUsd).toBe(4)
    expect(r.deltaPct).toBeCloseTo(-25)
  })
  it('audio falls back to the input rate; thinking bills at the output rate; tts by chars', () => {
    const r = priceScenario(
      { label: 'x', inputPerMillionUsd: 1, outputPerMillionUsd: 2, ttsPerMillionCharsUsd: 10 },
      [
        vol({
          input_text: 0,
          input_audio: 1_000_000,
          output: 0,
          thinking: 1_000_000,
          tts_chars: 500_000,
        }),
      ],
    )
    expect(r.projectedUsd).toBeCloseTo(1 + 2 + 5)
  })
  it('cached tokens are priced only when a cached rate is set', () => {
    expect(
      priceScenario({ label: 'x', inputPerMillionUsd: 1 }, [vol({ output: 0, cached: 1_000_000 })])
        .projectedUsd,
    ).toBeCloseTo(1)
    expect(
      priceScenario({ label: 'x', inputPerMillionUsd: 1, cachedPerMillionUsd: 0.5 }, [
        vol({ output: 0, cached: 1_000_000 }),
      ]).projectedUsd,
    ).toBeCloseTo(1.5)
  })
  it('model patterns support * and only count matching rows', () => {
    const rows = [vol({ model: 'alpha-1' }), vol({ model: 'beta-2', logged_cost_usd: 10 })]
    const r = priceScenario(
      { label: 'x', appliesToModelPattern: 'alpha*', inputPerMillionUsd: 1 },
      rows,
    )
    expect(r.matchedRows).toBe(1)
    expect(r.loggedUsd).toBe(4)
    expect(
      priceScenario({ label: 'x', appliesToModelPattern: 'a.pha*', inputPerMillionUsd: 1 }, rows)
        .matchedRows,
    ).toBe(0) // '.' is literal
  })
  it('ships empty: no scenarios, no output; unlabeled rows are skipped; zero logged cost gives null delta', () => {
    expect(priceScenarios([], [vol({})])).toEqual([])
    expect(priceScenarios([{ label: ' ' }], [vol({})])).toEqual([])
    expect(
      priceScenario({ label: 'x', inputPerMillionUsd: 1 }, [vol({ logged_cost_usd: 0 })]).deltaPct,
    ).toBeNull()
  })
})
