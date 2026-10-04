import type { AdminViewServerProps } from 'payload'
import { requireAdmin } from '@/analytics/access'
import {
  activeSeries,
  adoptionByPersona,
  featureHeat,
  funnel as buildFunnel,
  minutesBetween,
  retentionTriangle,
  signupsByDay,
  subscriptionMix,
} from '@/analytics/aggregate'
import { getProduct } from '@/analytics'
import { fixtureK } from '@/analytics/fixtures'
import { parseRange, rangeDays } from '@/analytics/types'
import { AnalyticsPage } from '../../components/AnalyticsPage'
import { BarList, FunnelBars } from '../../components/lists'
import { CohortTriangle, HeatTable, PersonaMatrix } from '../../components/matrix'
import { Grid, Panel, StatRow, StatTile } from '../../components/Panel'
import { SeriesBlock } from '../../components/SeriesBlock'
import { EmptyState } from '../../components/SampleDataBanner'
import { Throttled } from '../../components/Throttled'
import { int, pct, usd } from '../../fmt'
import { PERSONA_COLOR, SERIES, seriesColor } from '../../palette'
import { loadSettings, one } from '../../settings'

export default async function ProductView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
  const settings = await loadSettings(initPageResult.req.payload)
  const range = parseRange(one(searchParams?.range), settings.defaultRange)
  const days = rangeDays(range)
  const persona = one(searchParams?.persona)
  const gate = await requireAdmin(initPageResult, 'view:product', { panel: 'product', range })
  const frame = {
    initPageResult,
    params,
    searchParams,
    range,
    title: 'Product analytics',
    basePath: '/admin/analytics/product',
    lede: 'How StumpNote is used. Activity is a proxy built from product actions, not app opens. Cells with fewer than k users are hidden.',
    keep: { persona },
  }
  if (gate.throttled) {
    return (
      <AnalyticsPage {...frame} showRange={false}>
        <Throttled />
      </AnalyticsPage>
    )
  }
  const res = await getProduct(range)
  if (res.status !== 'ok') {
    return (
      <AnalyticsPage {...frame}>
        {res.status === 'unconfigured' ? (
          <EmptyState
            title="The StumpNote analytics source is not connected"
            missing={res.missing}
          />
        ) : (
          <EmptyState title="The analytics source did not answer" message={res.message} />
        )}
      </AnalyticsPage>
    )
  }

  const d = res.data
  const active = activeSeries(d.active)
  const latest = active[active.length - 1]
  const sign = signupsByDay(d.signups, days)
  const heat = featureHeat(d.featureDaily, days)
  const byPersona = adoptionByPersona(d.byPersona)
  const ret = retentionTriangle(d.retention)
  const personas = [...new Set(d.funnel.map((r) => r.persona))].sort()
  const funnel = buildFunnel(d.funnel, { persona, cohortDays: days })
  const subs = subscriptionMix(d.subscriptions)
  const k = res.source === 'fixtures' ? fixtureK : 5
  const fresh = `Latest usage row ${minutesBetween(d.freshness.ai_usage_latest ?? d.freshness.now_utc, d.freshness.now_utc)} min before the query. k = ${k}.`

  return (
    <AnalyticsPage {...frame} source={res.source} freshness={fresh}>
      <StatRow>
        <StatTile label="Daily active" value={int(latest?.dau)} hint="Product activity, last day" />
        <StatTile label="Weekly active" value={int(latest?.wau)} />
        <StatTile label="Monthly active" value={int(latest?.mau)} />
        <StatTile
          label={`Signups (${range})`}
          value={int(sign.accounts)}
          hint={
            sign.onboardingPct == null ? 'Onboarding n/a' : `${pct(sign.onboardingPct)} onboarded`
          }
        />
      </StatRow>
      <Grid>
        <Panel
          wide
          id="active"
          title="Active users"
          summary="DAU, WAU and MAU over the last 120 days. Excluded founder and test accounts are removed in SQL."
        >
          <SeriesBlock
            data={active.map((r) => ({ day: r.day, dau: r.dau, wau: r.wau, mau: r.mau }))}
            series={[
              { key: 'dau', label: 'Daily', color: SERIES[0] },
              { key: 'wau', label: 'Weekly', color: SERIES[1] },
              { key: 'mau', label: 'Monthly', color: SERIES[2] },
            ]}
            kind="line"
            ariaLabel="Line chart of daily, weekly and monthly active users"
            caption="Active users per day"
          />
        </Panel>
        <Panel
          wide
          id="signups"
          title="Signups"
          summary={`${int(sign.accounts)} accounts; ${sign.onboardingPct == null ? 'onboarding n/a' : `${pct(sign.onboardingPct)} completed onboarding`}.`}
          note="Day-by-persona cells under k are hidden in SQL, so quiet days can read as zero."
        >
          <SeriesBlock
            data={sign.rows}
            series={sign.personas.map((p, i) => ({
              key: p,
              label: p,
              color: PERSONA_COLOR[p] ?? seriesColor(i),
            }))}
            kind="stackedBars"
            ariaLabel="Stacked bar chart of daily signups by persona"
            caption="Signups per day by persona"
            height={220}
          />
        </Panel>
        <Panel
          wide
          id="adoption"
          title="Feature adoption"
          summary="Events per feature per week. Hatched cells are hidden (fewer than k users that day, or none)."
        >
          <HeatTable
            features={heat.features}
            weeks={heat.weeks}
            cells={heat.cells}
            max={heat.max}
            caption="Feature events per week"
          />
        </Panel>
        <Panel
          id="by-persona"
          title="Adoption by persona (30 days)"
          summary="Which persona uses what."
        >
          <PersonaMatrix
            personas={byPersona.personas}
            features={byPersona.features}
            matrix={byPersona.matrix}
            hidden={byPersona.hidden}
          />
        </Panel>
        <Panel
          id="subs"
          title="Subscriptions"
          summary={`${int(subs.total)} accounts with a subscription record (cells under k hidden).`}
        >
          <h3 className="sn-an__muted">By tier</h3>
          <BarList items={subs.byTier} format={int} caption="Accounts by tier" />
          <h3 className="sn-an__muted">By provider</h3>
          <BarList
            items={subs.byProvider}
            format={int}
            tone="coach"
            caption="Accounts by provider"
          />
          <h3 className="sn-an__muted">By trial state</h3>
          <BarList
            items={subs.byTrial}
            format={int}
            tone="parent"
            caption="Accounts by trial state"
          />
        </Panel>
        <Panel
          wide
          id="retention"
          title="Retention"
          summary="Share of each weekly signup cohort that was active in week N after signup."
          note="Cohorts smaller than k are hidden. Blank cells have not happened yet."
        >
          <CohortTriangle cohorts={ret.cohorts} maxWeek={ret.maxWeek} />
        </Panel>
        <Panel
          wide
          id="funnel"
          title="Funnel"
          summary={`Signup to store subscription, cohorts from the last ${range}${persona ? `, ${persona} only` : ', all personas'}.`}
        >
          <form
            className="sn-an__filters"
            method="get"
            action="/admin/analytics/product"
            aria-label="Funnel filter"
          >
            <input type="hidden" name="range" value={range} />
            <label>
              Persona
              <select name="persona" defaultValue={persona ?? ''}>
                <option value="">All personas</option>
                {personas.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <button type="submit">Apply</button>
          </form>
          <FunnelBars
            stages={funnel.map((s) => ({
              label: s.label,
              count: s.count,
              pctOfTop: s.pctOfTop,
              pctOfPrev: s.pctOfPrev,
            }))}
            caption="Signup funnel"
          />
        </Panel>
        <Panel wide id="revenuecat" title="RevenueCat" summary="Store revenue overview (phase 2).">
          {d.revenueCat ? (
            <StatRow>
              {d.revenueCat.metrics.map((m) => (
                <StatTile
                  key={m.id}
                  label={m.name}
                  value={m.unit === 'USD' ? usd(m.value) : int(m.value)}
                />
              ))}
            </StatRow>
          ) : (
            <p className="sn-an__muted">
              Not connected. Add <code>REVENUECAT_SECRET_API_KEY</code> and{' '}
              <code>REVENUECAT_PROJECT_ID</code> (read-only overview key) to enable.
            </p>
          )}
        </Panel>
      </Grid>
    </AnalyticsPage>
  )
}
