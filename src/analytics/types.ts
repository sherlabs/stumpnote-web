import 'server-only'
import { z } from 'zod'

/**
 * Row schemas for every analytics object (docs/spec/04-analytics-and-admin.md section 9) plus the web panels.
 * Postgres returns numeric and bigint columns as strings, so numbers are coerced.
 */
const n = z.coerce.number()
const nn = z.preprocess(
  (v) => (v === null || v === undefined ? null : Number(v)),
  z.number().nullable(),
)
const day = z.preprocess(
  (v) =>
    v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'string' ? v.slice(0, 10) : v,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
)

export const aiDailyRow = z.object({
  day,
  function_name: z.string(),
  model: z.string(),
  scope: z.string(),
  calls: n,
  subjects: nn, // null below k
  prompt_tokens: n,
  cached_tokens: n,
  completion_tokens: n,
  thoughts_tokens: n,
  tts_chars: n,
  cost_usd: n,
  wasted_cost_usd: n,
  cache_hits: n,
  saved_cost_usd: n,
  retries: n,
  errors: n,
  timeouts: n,
})
export const aiCacheLayerDailyRow = z.object({
  day,
  function_name: z.string(),
  cache_layer: z
    .string()
    .nullable()
    .transform((v) => v ?? 'unknown'),
  hits: n,
  saved_cost_usd: n,
})
export const aiLatencyDailyRow = z.object({
  day,
  function_name: z.string(),
  model: z.string(),
  calls: n,
  p50_ms: n,
  p95_ms: n,
})
export const aiVoiceFlowDailyRow = z.object({
  day,
  flows: n,
  p50_usd: n,
  p90_usd: n,
  mean_usd: n,
  mean_calls: n,
})
export const aiSubjectCostDistRow = z.object({
  subjects: n,
  p50_usd: n,
  p90_usd: n,
  p99_usd: n,
  max_usd: n,
  mean_usd: n,
})
export const aiTopSpenderRow = z.object({
  rank: n,
  cost_usd: n,
  calls: n,
  pct_of_subject_spend: n,
})
export const aiBudgetMonthRow = z.object({
  month_start: day,
  mtd_cost_usd: n,
  last7_daily_avg_usd: n,
  days_remaining: n,
  projected_eom_usd: n,
})
export const aiTokenVolumeRow = z.object({
  function_name: z.string(),
  model: z.string(),
  calls: n,
  input_text: n,
  input_audio: n,
  input_image: n,
  input_video: n,
  cached: n,
  output: n,
  thinking: n,
  tts_chars: n,
  logged_cost_usd: n,
})
export const aiDataQualityDailyRow = z.object({
  day,
  rows: n,
  rows_no_subject: n,
  pricing_unknown_rows: n,
  zero_token_rows: n,
})
export const activeUsersDailyRow = z.object({ day, dau: n, wau: n, mau: n })
export const signupsDailyRow = z.object({ day, persona: z.string(), accounts: n, onboarded: n })
export const featureAdoptionDailyRow = z.object({ day, feature: z.string(), events: n, users: n })
export const featureAdoptionByPersonaRow = z.object({
  feature: z.string(),
  persona: z.string(),
  users: n,
})
export const retentionWeeklyRow = z.object({
  cohort: day,
  week_n: n,
  cohort_size: n,
  active_users: n,
})
export const funnelWeeklyRow = z.object({
  cohort: day,
  persona: z.string(),
  signed_up: n,
  onboarded: n,
  first_entry: n,
  first_entry_7d: n,
  three_plus_entries: n,
  trial_started: n,
  store_subscribed: n,
})
export const subscriptionStatusRow = z.object({
  tier: z.string(),
  provider: z.string(),
  trial_state: z.string(),
  team_subscription: z
    .boolean()
    .nullable()
    .transform((v) => Boolean(v)),
  coach_subscription: z
    .boolean()
    .nullable()
    .transform((v) => Boolean(v)),
  users: n,
})
export const dataFreshnessRow = z.object({
  ai_usage_latest: z.preprocess(
    (v) => (v instanceof Date ? v.toISOString() : v),
    z.string().nullable(),
  ),
  now_utc: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string()),
})

export type AiDailyRow = z.infer<typeof aiDailyRow>
export type AiCacheLayerDailyRow = z.infer<typeof aiCacheLayerDailyRow>
export type AiLatencyDailyRow = z.infer<typeof aiLatencyDailyRow>
export type AiVoiceFlowDailyRow = z.infer<typeof aiVoiceFlowDailyRow>
export type AiSubjectCostDistRow = z.infer<typeof aiSubjectCostDistRow>
export type AiTopSpenderRow = z.infer<typeof aiTopSpenderRow>
export type AiBudgetMonthRow = z.infer<typeof aiBudgetMonthRow>
export type AiTokenVolumeRow = z.infer<typeof aiTokenVolumeRow>
export type AiDataQualityDailyRow = z.infer<typeof aiDataQualityDailyRow>
export type ActiveUsersDailyRow = z.infer<typeof activeUsersDailyRow>
export type SignupsDailyRow = z.infer<typeof signupsDailyRow>
export type FeatureAdoptionDailyRow = z.infer<typeof featureAdoptionDailyRow>
export type FeatureAdoptionByPersonaRow = z.infer<typeof featureAdoptionByPersonaRow>
export type RetentionWeeklyRow = z.infer<typeof retentionWeeklyRow>
export type FunnelWeeklyRow = z.infer<typeof funnelWeeklyRow>
export type SubscriptionStatusRow = z.infer<typeof subscriptionStatusRow>
export type DataFreshnessRow = z.infer<typeof dataFreshnessRow>

/** Filters, ranges and sources shared by the three views. */
export const RANGES = ['7d', '30d', '90d'] as const
export type Range = (typeof RANGES)[number]
export const rangeDays = (r: Range): number => (r === '7d' ? 7 : r === '90d' ? 90 : 30)
export const parseRange = (v: unknown, fallback: Range = '30d'): Range =>
  typeof v === 'string' && (RANGES as readonly string[]).includes(v) ? (v as Range) : fallback

export type DataSource = 'fixtures' | 'live' | 'unconfigured'
export type WebProviderId = 'none' | 'umami' | 'posthog' | 'plausible'

/** Provider-neutral web panels (section 1). */
export const webPanels = z.object({
  daily: z.array(z.object({ day, pageviews: n, visitors: n })),
  topPages: z.array(z.object({ label: z.string(), value: n })),
  referrers: z.array(z.object({ label: z.string(), value: n })),
  countries: z.array(z.object({ label: z.string(), value: n })),
  devices: z.array(z.object({ label: z.string(), value: n })),
  funnel: z.array(z.object({ event: z.string(), count: n })),
  persona: z.array(z.object({ persona: z.string(), switches: n, signups: n })),
  vitals: z.object({ lcp_ms: nn, cls: nn, inp_ms: nn }),
  eventsThisMonth: nn,
  eventCap: nn,
})
export type WebPanels = z.infer<typeof webPanels>

export const FUNNEL_EVENTS = [
  'cta_view_hero',
  'cta_click_beta',
  'beta_form_submit',
  'outbound_app_link',
] as const
