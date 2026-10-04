import 'server-only'
import type { z } from 'zod'
import { addDays, daysLeftInMonth, diffDays, monthStart, todayUtc } from '../dates'
import * as T from '../types'
import activeUsers from './active_users_daily.json'
import aiCacheLayer from './ai_cache_layer_daily.json'
import aiDaily from './ai_daily.json'
import aiQuality from './ai_data_quality_daily.json'
import aiLatency from './ai_latency_daily.json'
import aiDist from './ai_subject_cost_dist.json'
import aiTokenVolume from './ai_token_volume_30d.json'
import aiTop from './ai_top_spenders.json'
import aiVoice from './ai_voice_flow_daily.json'
import featureByPersona from './feature_adoption_by_persona_30d.json'
import featureDaily from './feature_adoption_daily.json'
import funnel from './funnel_weekly.json'
import meta from './meta.json'
import retention from './retention_weekly.json'
import signups from './signups_daily.json'
import subscriptions from './subscription_status.json'
import web from './web.json'

/**
 * SYNTHETIC data (see generate-fixtures.ts). Rebased so the newest day is always today; weekly cohorts shift by whole
 * weeks so they stay Mondays. Rows are parsed through the same zod schemas as live rows.
 */
const delta = () => diffDays(todayUtc(), meta.anchorEnd)

function rebase<S extends z.ZodType>(
  schema: S,
  rows: unknown[],
  fields: { day?: string; week?: string },
) {
  const d = delta()
  const w = Math.floor(d / 7) * 7
  return rows.map((row) => {
    const copy = { ...(row as Record<string, unknown>) }
    if (fields.day && typeof copy[fields.day] === 'string') {
      copy[fields.day] = addDays(copy[fields.day] as string, d)
    }
    if (fields.week && typeof copy[fields.week] === 'string') {
      copy[fields.week] = addDays(copy[fields.week] as string, w)
    }
    return schema.parse(copy) as z.infer<S>
  })
}

export const fixtureK = meta.kMin

export function fixtureAi() {
  const daily = rebase(T.aiDailyRow, aiDaily, { day: 'day' })
  const today = todayUtc()
  const first = monthStart()
  const mtd = daily
    .filter((r) => r.day >= first && r.day <= today)
    .reduce((s, r) => s + r.cost_usd, 0)
  const last7 =
    daily.filter((r) => r.day > addDays(today, -7)).reduce((s, r) => s + r.cost_usd, 0) / 7
  const left = daysLeftInMonth()
  const now = new Date()
  return {
    daily,
    cacheLayer: rebase(T.aiCacheLayerDailyRow, aiCacheLayer, { day: 'day' }),
    latency: rebase(T.aiLatencyDailyRow, aiLatency, { day: 'day' }),
    voiceFlow: rebase(T.aiVoiceFlowDailyRow, aiVoice, { day: 'day' }),
    dist: aiDist.map((r) => T.aiSubjectCostDistRow.parse(r)),
    top: aiTop.map((r) => T.aiTopSpenderRow.parse(r)),
    budget: T.aiBudgetMonthRow.parse({
      month_start: first,
      mtd_cost_usd: mtd,
      last7_daily_avg_usd: last7,
      days_remaining: left,
      projected_eom_usd: mtd + last7 * left,
    }),
    tokenVolume: aiTokenVolume.map((r) => T.aiTokenVolumeRow.parse(r)),
    quality: rebase(T.aiDataQualityDailyRow, aiQuality, { day: 'day' }),
    freshness: T.dataFreshnessRow.parse({
      ai_usage_latest: new Date(now.getTime() - 5 * 60_000).toISOString(),
      now_utc: now.toISOString(),
    }),
  }
}

export function fixtureProduct() {
  return {
    active: rebase(T.activeUsersDailyRow, activeUsers, { day: 'day' }),
    signups: rebase(T.signupsDailyRow, signups, { day: 'day' }),
    featureDaily: rebase(T.featureAdoptionDailyRow, featureDaily, { day: 'day' }),
    byPersona: featureByPersona.map((r) => T.featureAdoptionByPersonaRow.parse(r)),
    retention: rebase(T.retentionWeeklyRow, retention, { week: 'cohort' }),
    funnel: rebase(T.funnelWeeklyRow, funnel, { week: 'cohort' }),
    subscriptions: subscriptions.map((r) => T.subscriptionStatusRow.parse(r)),
    freshness: T.dataFreshnessRow.parse({
      ai_usage_latest: new Date(Date.now() - 5 * 60_000).toISOString(),
      now_utc: new Date().toISOString(),
    }),
  }
}

/** Web panels for a window: daily series sliced, ranked lists scaled by the visitor ratio to the 30-day base. */
export function fixtureWeb(days: number): T.WebPanels {
  const d = delta()
  const all = web.daily.map((r) => ({ ...r, day: addDays(r.day, d) }))
  const daily = all.slice(-days)
  const base = all.slice(-30).reduce((s, r) => s + r.visitors, 0) || 1
  const cur = daily.reduce((s, r) => s + r.visitors, 0)
  const k = cur / base
  const scale = <X extends { value: number }>(xs: X[]) =>
    xs.map((x) => ({ ...x, value: Math.round(x.value * k) }))
  return T.webPanels.parse({
    daily,
    topPages: scale(web.topPages),
    referrers: scale(web.referrers),
    countries: scale(web.countries),
    devices: scale(web.devices),
    funnel: web.funnel.map((f) => ({ ...f, count: Math.round(f.count * k) })),
    persona: web.persona.map((p) => ({
      ...p,
      switches: Math.round(p.switches * k),
      signups: Math.round(p.signups * k),
    })),
    vitals: web.vitals,
    eventsThisMonth: web.eventsThisMonth,
    eventCap: web.eventCap,
  })
}
