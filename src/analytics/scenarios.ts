import type { AiTokenVolumeRow } from './types'

/**
 * What-if re-pricing of the last 30 days of token volume (docs/spec/04 section 2). Pure and rate-agnostic: rates come
 * only from the admin-edited `price-scenarios` global and are never seeded in the repository.
 * cost = sum(tokens / 1e6 x rate) per modality. Cached tokens are priced only when a cached rate is given
 * (otherwise they are assumed to be inside the input counts); a missing audio rate falls back to the input rate.
 */
export type Scenario = {
  label: string
  appliesToModelPattern?: string | null
  inputPerMillionUsd?: number | null
  outputPerMillionUsd?: number | null
  cachedPerMillionUsd?: number | null
  audioInputPerMillionUsd?: number | null
  ttsPerMillionCharsUsd?: number | null
}

export type ScenarioResult = {
  label: string
  appliesTo: string
  projectedUsd: number
  loggedUsd: number
  deltaPct: number | null
  matchedRows: number
}

const matches = (model: string, pattern?: string | null): boolean => {
  const p = (pattern ?? '').trim()
  if (!p || p === '*') return true
  const re = new RegExp(
    '^' +
      p
        .split('*')
        .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*') +
      '$',
    'i',
  )
  return re.test(model)
}

const per = (tokens: number, rate: number | null | undefined) => (rate ? (tokens / 1e6) * rate : 0)

export function priceScenario(s: Scenario, rows: AiTokenVolumeRow[]): ScenarioResult {
  const scoped = rows.filter((r) => matches(r.model, s.appliesToModelPattern))
  let projected = 0
  let logged = 0
  for (const r of scoped) {
    const audioRate = s.audioInputPerMillionUsd ?? s.inputPerMillionUsd
    projected +=
      per(r.input_text + r.input_image + r.input_video, s.inputPerMillionUsd) +
      per(r.input_audio, audioRate) +
      per(r.cached, s.cachedPerMillionUsd) +
      per(r.output + r.thinking, s.outputPerMillionUsd) +
      per(r.tts_chars, s.ttsPerMillionCharsUsd)
    logged += r.logged_cost_usd
  }
  return {
    label: s.label,
    appliesTo: (s.appliesToModelPattern ?? '').trim() || 'all models',
    projectedUsd: projected,
    loggedUsd: logged,
    deltaPct: logged > 0 ? ((projected - logged) / logged) * 100 : null,
    matchedRows: scoped.length,
  }
}

export const priceScenarios = (list: Scenario[], rows: AiTokenVolumeRow[]): ScenarioResult[] =>
  list.filter((s) => s.label?.trim()).map((s) => priceScenario(s, rows))
