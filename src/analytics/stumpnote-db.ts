import 'server-only'
import { Pool } from 'pg'
import type { z } from 'zod'
import * as T from './types'
import { int } from './util'

/**
 * Read-only access to the StumpNote `analytics` schema (docs/spec/01-architecture.md section 9).
 * - The Pool is created lazily, only in live mode, and never in fixtures mode.
 * - Queries are FIXED strings. The only interpolated values are integers clamped by `int()`, so no user text
 *   ever reaches SQL (and the simple query protocol works through a transaction-mode pooler, which rejects
 *   prepared statements).
 * - TLS always verifies the certificate. Provide the provider CA through STUMPNOTE_ANALYTICS_CA_CERT when the
 *   system trust store does not cover the pooler. `rejectUnauthorized` is never disabled.
 */
let pool: Pool | null = null

export const dbConfigured = (): boolean => Boolean(process.env.STUMPNOTE_ANALYTICS_DATABASE_URL)

function getPool(): Pool {
  if (pool) return pool
  const raw = process.env.STUMPNOTE_ANALYTICS_DATABASE_URL
  if (!raw) throw new Error('STUMPNOTE_ANALYTICS_DATABASE_URL is not set')
  const url = new URL(raw)
  url.searchParams.delete('sslmode') // TLS is configured explicitly below
  const ca = process.env.STUMPNOTE_ANALYTICS_CA_CERT?.replace(/\\n/g, '\n')
  pool = new Pool({
    connectionString: url.toString(),
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 8_000,
    query_timeout: 9_000,
    ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: true },
    application_name: 'stumpnote-web-admin-analytics',
  })
  pool.on('error', () => {
    /* idle client errors must not crash the server */
  })
  return pool
}

async function rows<S extends z.ZodType>(schema: S, sql: string): Promise<Array<z.infer<S>>> {
  const res = await getPool().query(sql)
  return res.rows.map((r) => schema.parse(r) as z.infer<S>)
}

export async function liveAi(days: number) {
  const d = int(days, 1, 400)
  const [
    daily,
    cacheLayer,
    latency,
    voiceFlow,
    dist,
    top,
    budget,
    tokenVolume,
    quality,
    freshness,
  ] = await Promise.all([
    rows(
      T.aiDailyRow,
      `select day, function_name, model, scope, calls, subjects, prompt_tokens, cached_tokens, completion_tokens, thoughts_tokens, tts_chars, cost_usd, wasted_cost_usd, cache_hits, saved_cost_usd, retries, errors, timeouts from analytics.ai_daily where day > current_date - ${d} order by day`,
    ),
    rows(
      T.aiCacheLayerDailyRow,
      `select day, function_name, cache_layer, hits, saved_cost_usd from analytics.ai_cache_layer_daily where day > current_date - ${d} order by day`,
    ),
    rows(
      T.aiLatencyDailyRow,
      `select day, function_name, model, calls, p50_ms, p95_ms from analytics.ai_latency_daily where day > current_date - ${d} order by day`,
    ),
    rows(
      T.aiVoiceFlowDailyRow,
      `select day, flows, p50_usd, p90_usd, mean_usd, mean_calls from analytics.ai_voice_flow_daily where day > current_date - ${d} order by day`,
    ),
    rows(
      T.aiSubjectCostDistRow,
      `select subjects, p50_usd, p90_usd, p99_usd, max_usd, mean_usd from analytics.ai_subject_cost_dist(${d})`,
    ),
    rows(
      T.aiTopSpenderRow,
      `select rank, cost_usd, calls, pct_of_subject_spend from analytics.ai_top_spenders(${d}, 5)`,
    ),
    rows(
      T.aiBudgetMonthRow,
      `select month_start, mtd_cost_usd, last7_daily_avg_usd, days_remaining, projected_eom_usd from analytics.ai_budget_month`,
    ),
    rows(
      T.aiTokenVolumeRow,
      `select function_name, model, calls, input_text, input_audio, input_image, input_video, cached, output, thinking, tts_chars, logged_cost_usd from analytics.ai_token_volume_30d`,
    ),
    rows(
      T.aiDataQualityDailyRow,
      `select day, rows, rows_no_subject, pricing_unknown_rows, zero_token_rows from analytics.ai_data_quality_daily where day > current_date - ${d} order by day`,
    ),
    rows(T.dataFreshnessRow, `select ai_usage_latest, now_utc from analytics.data_freshness()`),
  ])
  if (!budget[0]) throw new Error('analytics.ai_budget_month returned no row')
  if (!freshness[0]) throw new Error('analytics.data_freshness returned no row')
  return {
    daily,
    cacheLayer,
    latency,
    voiceFlow,
    dist,
    top,
    budget: budget[0],
    tokenVolume,
    quality,
    freshness: freshness[0],
  }
}

export async function liveProduct(days: number) {
  const d = int(days, 1, 400)
  const [active, signups, featureDaily, byPersona, retention, funnel, subscriptions, freshness] =
    await Promise.all([
      rows(
        T.activeUsersDailyRow,
        `select day, dau, wau, mau from analytics.active_users_daily order by day`,
      ),
      rows(
        T.signupsDailyRow,
        `select day, persona, accounts, onboarded from analytics.signups_daily where day > current_date - ${d} order by day`,
      ),
      rows(
        T.featureAdoptionDailyRow,
        `select day, feature, events, users from analytics.feature_adoption_daily where day > current_date - ${d} order by day`,
      ),
      rows(
        T.featureAdoptionByPersonaRow,
        `select feature, persona, users from analytics.feature_adoption_by_persona_30d`,
      ),
      rows(
        T.retentionWeeklyRow,
        `select cohort, week_n, cohort_size, active_users from analytics.retention_weekly order by cohort, week_n`,
      ),
      rows(
        T.funnelWeeklyRow,
        `select cohort, persona, signed_up, onboarded, first_entry, first_entry_7d, three_plus_entries, trial_started, store_subscribed from analytics.funnel_weekly order by cohort`,
      ),
      rows(
        T.subscriptionStatusRow,
        `select tier, provider, trial_state, team_subscription, coach_subscription, users from analytics.subscription_status`,
      ),
      rows(T.dataFreshnessRow, `select ai_usage_latest, now_utc from analytics.data_freshness()`),
    ])
  if (!freshness[0]) throw new Error('analytics.data_freshness returned no row')
  return {
    active,
    signups,
    featureDaily,
    byPersona,
    retention,
    funnel,
    subscriptions,
    freshness: freshness[0],
  }
}
