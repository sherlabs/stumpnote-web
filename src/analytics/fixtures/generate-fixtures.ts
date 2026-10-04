/**
 * Deterministic SYNTHETIC fixtures for the admin analytics views (docs/spec/04 section 10).
 * Run: pnpm analytics:fixtures   (writes ./*.json; commit the output, never generate at build).
 * Every number here is invented from a seeded PRNG. None of it describes real usage, spend, people or prices.
 * Dates are anchored at ANCHOR_END; the loader rebases them so "today" is always the newest day.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const ANCHOR_END = '2026-09-30' // a Wednesday; weekly cohorts below are Mondays
const DAYS = 120
const K = 5

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const r = rng(20261004)
const jitter = (base: number, pct: number) => base * (1 + (r() * 2 - 1) * pct)
const int = (x: number) => Math.max(0, Math.round(x))
const money = (x: number, dp = 6) => Number(x.toFixed(dp))

const addDays = (iso: string, d: number) => {
  const t = new Date(`${iso}T00:00:00Z`)
  t.setUTCDate(t.getUTCDate() + d)
  return t.toISOString().slice(0, 10)
}
const days = Array.from({ length: DAYS }, (_, i) => addDays(ANCHOR_END, i - (DAYS - 1)))
const dow = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay()
/** Weekly seasonality: busier Sat/Sun (matches, journaling after play). */
const season = (iso: string) => [1.25, 0.85, 0.9, 0.95, 1.0, 1.05, 1.3][dow(iso)]
/** Slow growth across the window. */
const growth = (i: number) => 0.55 + (i / DAYS) * 0.9

// ---------------------------------------------------------------- AI spend
const FUNCTIONS: Array<[string, string, string, number, number]> = [
  // name, model, scope, base calls/day, avg cost per call USD (synthetic)
  ['generate-entry-insights', 'gemini-3-flash-preview', 'player', 34, 0.0021],
  ['parse-voice-entry', 'gemini-3.5-flash', 'player', 28, 0.0036],
  ['ask-coach', 'gemini-3-flash-preview', 'player', 19, 0.0028],
  ['generate-game-plan', 'gemini-3-flash-preview', 'player', 7, 0.0049],
  ['generate-drills', 'gemini-3-flash-preview', 'player', 9, 0.0032],
  ['analyze-scorecard', 'gemini-3-flash-preview', 'player', 5, 0.0054],
  ['generate-mindset-session', 'gemini-3-flash-preview', 'player', 6, 0.0026],
  ['generate-weekly-brief', 'gemini-3-flash-preview', 'player', 4, 0.0041],
  ['generate-team-insights', 'gemini-3-flash-preview', 'team', 3, 0.0058],
  ['embed-entry', 'gemini-embedding-2', 'player', 41, 0.00006],
  ['tts-brief', 'google-cloud-tts', 'player', 5, 0.0017],
  ['filter-ritual-rules', 'gemini-3.5-flash', 'player', 2, 0.0031],
]
const aiDaily: unknown[] = []
const cacheLayer: unknown[] = []
const latency: unknown[] = []
const quality: unknown[] = []
days.forEach((d, i) => {
  let rowsToday = 0
  for (const [fn, model, scope, base, unit] of FUNCTIONS) {
    const calls = int(jitter(base * growth(i) * season(d), 0.22))
    if (calls === 0) continue
    const errors = int(calls * (fn.startsWith('parse') ? 0.04 : 0.015) * r() * 2)
    const timeouts = int(errors * 0.35 * r())
    const retries = int(errors * 0.8)
    const cost = calls * unit * jitter(1, 0.12)
    const wasted = errors * unit * 0.6
    const cacheHits = fn.startsWith('generate-') || fn === 'ask-coach' ? int(calls * 0.3 * r()) : 0
    const subjects = int(calls * 0.35) + 1
    const promptTokens = int(calls * jitter(model === 'gemini-embedding-2' ? 380 : 3100, 0.1))
    aiDaily.push({
      day: d,
      function_name: fn,
      model,
      scope,
      calls,
      subjects: subjects >= K ? subjects : null,
      prompt_tokens: promptTokens,
      cached_tokens: int(promptTokens * (cacheHits ? 0.22 : 0.04)),
      completion_tokens: model === 'gemini-embedding-2' ? 0 : int(calls * jitter(310, 0.15)),
      thoughts_tokens: model.startsWith('gemini-3') ? int(calls * jitter(420, 0.2)) : 0,
      tts_chars: fn === 'tts-brief' ? int(calls * jitter(900, 0.2)) : 0,
      cost_usd: money(cost),
      wasted_cost_usd: money(wasted),
      cache_hits: cacheHits,
      saved_cost_usd: money(cacheHits * unit * 0.85),
      retries,
      errors,
      timeouts,
    })
    rowsToday += calls
    if (cacheHits) {
      const split = r()
      cacheLayer.push({
        day: d,
        function_name: fn,
        cache_layer: 'dossier',
        hits: int(cacheHits * split),
        saved_cost_usd: money(cacheHits * split * unit * 0.85),
      })
      cacheLayer.push({
        day: d,
        function_name: fn,
        cache_layer: 'context',
        hits: cacheHits - int(cacheHits * split),
        saved_cost_usd: money((cacheHits - int(cacheHits * split)) * unit * 0.85),
      })
    }
    if (scope === 'player' && model.startsWith('gemini-3') && cacheHits !== undefined) {
      latency.push({
        day: d,
        function_name: fn,
        model,
        calls,
        p50_ms: int(jitter(fn === 'ask-coach' ? 2300 : fn.startsWith('parse') ? 1700 : 3400, 0.12)),
        p95_ms: int(jitter(fn === 'ask-coach' ? 6100 : fn.startsWith('parse') ? 4300 : 8200, 0.18)),
      })
    }
  }
  quality.push({
    day: d,
    rows: rowsToday,
    rows_no_subject: int(rowsToday * 0.004 * r()),
    pricing_unknown_rows: i > 80 && i < 86 ? int(rowsToday * 0.01) : 0,
    zero_token_rows: int(rowsToday * 0.006 * r()),
  })
})

const voiceFlow = days.map((d, i) => {
  const flows = int(jitter(15 * growth(i) * season(d), 0.2))
  return {
    day: d,
    flows,
    p50_usd: money(jitter(0.0062, 0.1), 5),
    p90_usd: money(jitter(0.0118, 0.12), 5),
    mean_usd: money(jitter(0.0079, 0.1), 5),
    mean_calls: Number(jitter(3.4, 0.08).toFixed(2)),
  }
})

const totalMonth = (aiDaily as Array<{ day: string; cost_usd: number }>)
  .filter((x) => x.day.slice(0, 7) === ANCHOR_END.slice(0, 7))
  .reduce((s, x) => s + x.cost_usd, 0)
const daysRemaining = 0
const last7 =
  (aiDaily as Array<{ day: string; cost_usd: number }>)
    .filter((x) => x.day > addDays(ANCHOR_END, -7))
    .reduce((s, x) => s + x.cost_usd, 0) / 7
const budgetMonth = [
  {
    month_start: `${ANCHOR_END.slice(0, 7)}-01`,
    mtd_cost_usd: money(totalMonth, 4),
    last7_daily_avg_usd: money(last7, 4),
    days_remaining: daysRemaining,
    projected_eom_usd: money(totalMonth + last7 * daysRemaining, 4),
  },
]

const last30 = (aiDaily as Array<Record<string, number | string>>).filter(
  (x) => (x.day as string) > addDays(ANCHOR_END, -30),
)
const volMap = new Map<string, Record<string, number | string>>()
for (const x of last30) {
  const key = `${x.function_name}|${x.model}`
  const cur = volMap.get(key) ?? {
    function_name: x.function_name,
    model: x.model,
    calls: 0,
    input_text: 0,
    input_audio: 0,
    input_image: 0,
    input_video: 0,
    cached: 0,
    output: 0,
    thinking: 0,
    tts_chars: 0,
    logged_cost_usd: 0,
  }
  const audio = x.function_name === 'parse-voice-entry' ? 0.7 : 0
  cur.calls = (cur.calls as number) + (x.calls as number)
  cur.input_text = (cur.input_text as number) + int((x.prompt_tokens as number) * (1 - audio))
  cur.input_audio = (cur.input_audio as number) + int((x.prompt_tokens as number) * audio)
  cur.cached = (cur.cached as number) + (x.cached_tokens as number)
  cur.output = (cur.output as number) + (x.completion_tokens as number)
  cur.thinking = (cur.thinking as number) + (x.thoughts_tokens as number)
  cur.tts_chars = (cur.tts_chars as number) + (x.tts_chars as number)
  cur.logged_cost_usd = money((cur.logged_cost_usd as number) + (x.cost_usd as number))
  volMap.set(key, cur)
}
const tokenVolume = [...volMap.values()]

const subjectDist = [
  {
    subjects: 38,
    p50_usd: 0.1412,
    p90_usd: 0.4126,
    p99_usd: 0.9871,
    max_usd: 1.2034,
    mean_usd: 0.2203,
  },
]
// Shown only when the subject count clears 4 x k; synthetic cohort is large enough.
const topSpenders = [
  { rank: 1, cost_usd: 1.2034, calls: 311, pct_of_subject_spend: 14.4 },
  { rank: 2, cost_usd: 0.9871, calls: 262, pct_of_subject_spend: 11.8 },
  { rank: 3, cost_usd: 0.7412, calls: 198, pct_of_subject_spend: 8.9 },
  { rank: 4, cost_usd: 0.6633, calls: 174, pct_of_subject_spend: 7.9 },
  { rank: 5, cost_usd: 0.5204, calls: 151, pct_of_subject_spend: 6.2 },
]

// ---------------------------------------------------------------- Product
const PERSONAS = ['player', 'coach', 'parent']
const FEATURES = [
  'entry_net',
  'entry_match',
  'watch_session',
  'gameday_plan',
  'mindset_session',
  'mindset_completed',
  'mindset_takeaway',
  'mindset_checkin',
  'guided_session',
  'entry_clip',
  'ask_coach',
]
const featureBase: Record<string, number> = {
  entry_net: 14,
  entry_match: 8,
  watch_session: 6,
  gameday_plan: 5,
  mindset_session: 7,
  mindset_completed: 5,
  mindset_takeaway: 4,
  mindset_checkin: 9,
  guided_session: 3,
  entry_clip: 2,
  ask_coach: 11,
}
const active = days.map((d, i) => {
  const base = 18 * growth(i)
  const dau = int(jitter(base * season(d), 0.1))
  const wau = int(base * 2.4 * jitter(1, 0.05))
  const mau = int(base * 4.8 * jitter(1, 0.03))
  return { day: d, dau, wau: Math.max(wau, dau), mau: Math.max(mau, wau) }
})

const signups: unknown[] = []
for (const d of days) {
  const weekendBoost = dow(d) === 0 || dow(d) === 6 ? 1.6 : 1
  for (const p of PERSONAS) {
    const share = p === 'player' ? 1.5 : p === 'coach' ? 0.55 : 0.4
    const accounts = int(jitter(share * weekendBoost * (days.indexOf(d) / DAYS + 0.4), 0.5) * 2)
    // Day x persona cells with fewer than k accounts are suppressed in SQL.
    if (accounts < K) continue
    signups.push({ day: d, persona: p, accounts, onboarded: int(accounts * jitter(0.78, 0.08)) })
  }
}

const featureDaily: unknown[] = []
days.forEach((d, i) => {
  for (const f of FEATURES) {
    const users = int(jitter(featureBase[f] * growth(i) * season(d), 0.3))
    if (users < K) continue // suppressed below k, as in SQL
    featureDaily.push({ day: d, feature: f, events: int(users * jitter(1.9, 0.2)), users })
  }
})
const personaScale: Record<string, number> = { player: 1, coach: 0.46, parent: 0.2 }
const byPersona: unknown[] = []
for (const f of FEATURES) {
  for (const p of PERSONAS) {
    if (p === 'parent' && !['entry_net', 'mindset_checkin', 'watch_session'].includes(f)) continue
    const users = int(jitter(featureBase[f] * 2.6 * personaScale[p], 0.25))
    if (users >= K) byPersona.push({ feature: f, persona: p, users })
  }
}

// Weekly cohorts (Mondays), 14 weeks back from the anchor.
const mondayOf = (iso: string) => addDays(iso, -((dow(iso) + 6) % 7))
const lastMonday = mondayOf(ANCHOR_END)
const cohorts = Array.from({ length: 14 }, (_, i) => addDays(lastMonday, -7 * (13 - i)))
const retention: unknown[] = []
cohorts.forEach((c, ci) => {
  const size = int(jitter(22 + ci * 1.4, 0.2))
  const weeks = 13 - ci
  for (let w = 0; w <= weeks; w++) {
    const pct = w === 0 ? 1 : Math.max(0.18, 0.7 * Math.pow(0.86, w - 1) * jitter(1, 0.06))
    retention.push({ cohort: c, week_n: w, cohort_size: size, active_users: int(size * pct) })
  }
})
const funnel: unknown[] = []
cohorts.forEach((c, ci) => {
  for (const p of PERSONAS) {
    const share = p === 'player' ? 0.62 : p === 'coach' ? 0.24 : 0.14
    const signed = int(jitter(22 + ci * 1.4, 0.2) * share * 1.6)
    if (signed < K) continue
    const onboarded = int(signed * 0.8)
    const firstEntry = int(onboarded * (p === 'parent' ? 0.5 : 0.74))
    funnel.push({
      cohort: c,
      persona: p,
      signed_up: signed,
      onboarded,
      first_entry: firstEntry,
      first_entry_7d: int(firstEntry * 0.82),
      three_plus_entries: int(firstEntry * 0.52),
      trial_started: int(firstEntry * 0.4),
      store_subscribed: int(firstEntry * 0.11),
    })
  }
})
const subscriptions = [
  {
    tier: 'free',
    provider: 'none',
    trial_state: 'no_trial',
    team_subscription: false,
    coach_subscription: false,
    users: 312,
  },
  {
    tier: 'free',
    provider: 'none',
    trial_state: 'trial_ended',
    team_subscription: false,
    coach_subscription: false,
    users: 64,
  },
  {
    tier: 'pro',
    provider: 'none',
    trial_state: 'in_trial',
    team_subscription: false,
    coach_subscription: false,
    users: 47,
  },
  {
    tier: 'pro',
    provider: 'apple',
    trial_state: 'trial_ended',
    team_subscription: false,
    coach_subscription: false,
    users: 29,
  },
  {
    tier: 'pro',
    provider: 'google',
    trial_state: 'trial_ended',
    team_subscription: false,
    coach_subscription: false,
    users: 8,
  },
  {
    tier: 'pro',
    provider: 'apple',
    trial_state: 'trial_ended',
    team_subscription: true,
    coach_subscription: false,
    users: 11,
  },
  {
    tier: 'pro',
    provider: 'apple',
    trial_state: 'trial_ended',
    team_subscription: false,
    coach_subscription: true,
    users: 6,
  },
]

// ---------------------------------------------------------------- Web (provider-neutral)
const webDaily = days.slice(-90).map((d, i) => {
  const visitors = int(
    jitter(150 * (0.6 + (i / 90) * 1.0) * (dow(d) === 6 || dow(d) === 0 ? 1.1 : 1), 0.18),
  )
  return { day: d, pageviews: int(visitors * jitter(2.1, 0.08)), visitors }
})
const web = {
  daily: webDaily,
  topPages: [
    ['/', 3120],
    ['/features', 1180],
    ['/pricing', 640],
    ['/join', 590],
    ['/players', 520],
    ['/features/journal', 410],
    ['/coaches', 330],
    ['/captains', 290],
    ['/parents', 260],
    ['/security', 230],
    ['/support', 190],
    ['/privacy', 140],
    ['/features/ask-coach', 120],
    ['/terms', 90],
    ['/changelog', 60],
  ].map(([label, value]) => ({ label, value })),
  referrers: [
    ['google', 910],
    ['(direct)', 760],
    ['instagram.com', 340],
    ['reddit.com', 180],
    ['youtube.com', 150],
    ['whatsapp.com', 120],
    ['cricket-forums.example', 70],
    ['news.example', 55],
    ['x.com', 50],
    ['linkedin.com', 35],
  ].map(([label, value]) => ({ label, value })),
  countries: [
    ['AU', 1260],
    ['IN', 740],
    ['GB', 520],
    ['NZ', 190],
    ['ZA', 150],
    ['US', 140],
    ['AE', 80],
    ['PK', 60],
    ['CA', 40],
    ['SG', 30],
  ].map(([label, value]) => ({ label, value })),
  devices: [
    ['mobile', 2480],
    ['desktop', 1330],
    ['tablet', 190],
  ].map(([label, value]) => ({ label, value })),
  funnel: [
    { event: 'cta_view_hero', count: 3840 },
    { event: 'cta_click_beta', count: 412 },
    { event: 'beta_form_submit', count: 96 },
    { event: 'outbound_app_link', count: 188 },
  ],
  persona: [
    { persona: 'player', switches: 880, signups: 58 },
    { persona: 'coach', switches: 410, signups: 22 },
    { persona: 'parent', switches: 230, signups: 11 },
    { persona: 'team', switches: 190, signups: 5 },
  ],
  vitals: { lcp_ms: 1480, cls: 0.01, inp_ms: 96 },
  eventsThisMonth: 14200,
  eventCap: 1000000,
}

const files: Record<string, unknown> = {
  meta: {
    anchorEnd: ANCHOR_END,
    kMin: K,
    note: 'SYNTHETIC. Generated by generate-fixtures.ts from a seeded PRNG.',
  },
  ai_daily: aiDaily,
  ai_cache_layer_daily: cacheLayer,
  ai_latency_daily: latency,
  ai_voice_flow_daily: voiceFlow,
  ai_subject_cost_dist: subjectDist,
  ai_top_spenders: topSpenders,
  ai_budget_month: budgetMonth,
  ai_token_volume_30d: tokenVolume,
  ai_data_quality_daily: quality,
  active_users_daily: active,
  signups_daily: signups,
  feature_adoption_daily: featureDaily,
  feature_adoption_by_persona_30d: byPersona,
  retention_weekly: retention,
  funnel_weekly: funnel,
  subscription_status: subscriptions,
  data_freshness: [
    { ai_usage_latest: `${ANCHOR_END}T09:41:00.000Z`, now_utc: `${ANCHOR_END}T09:46:00.000Z` },
  ],
  web: web,
}
for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(here, `${name}.json`), JSON.stringify(data) + '\n')
}
console.log(`wrote ${Object.keys(files).length} fixture files`)
