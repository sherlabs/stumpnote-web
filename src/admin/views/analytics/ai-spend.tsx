import type { AdminViewServerProps } from 'payload'
import { requireAdmin } from '@/analytics/access'
import {
  aiFilterOptions,
  budgetState,
  cacheSavings,
  costByFunction,
  costByModelPerDay,
  dailyCost,
  filterAiDaily,
  latencyByFunction,
  minutesBetween,
  waste,
} from '@/analytics/aggregate'
import { getAiSpend } from '@/analytics'
import { sinceDay } from '@/analytics/dates'
import { priceScenarios, type Scenario } from '@/analytics/scenarios'
import { parseRange, rangeDays } from '@/analytics/types'
import { AnalyticsPage } from '../../components/AnalyticsPage'
import { BarList, Hidden } from '../../components/lists'
import { DataTable, Grid, Panel, StatRow, StatTile } from '../../components/Panel'
import { SeriesBlock } from '../../components/SeriesBlock'
import { EmptyState } from '../../components/SampleDataBanner'
import { Throttled } from '../../components/Throttled'
import { int, label, ms, pct, short, usd } from '../../fmt'
import { SERIES, OTHER, seriesColor } from '../../palette'
import { loadSettings, one } from '../../settings'

export default async function AiSpendView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
  const payload = initPageResult.req.payload
  const settings = await loadSettings(payload)
  const range = parseRange(one(searchParams?.range), settings.defaultRange)
  const days = rangeDays(range)
  const f = {
    model: one(searchParams?.model),
    fn: one(searchParams?.fn),
    scope: one(searchParams?.scope),
  }
  const gate = await requireAdmin(initPageResult, 'view:ai-spend', { panel: 'ai-spend', range })
  const frame = {
    initPageResult,
    params,
    searchParams,
    range,
    title: 'AI spend',
    basePath: '/admin/analytics/ai-spend',
    lede: 'What StumpNote spends on AI, where it goes and what caching saves. Aggregate only: no ids, no per-person rows.',
    keep: { model: f.model, fn: f.fn, scope: f.scope },
  }
  if (gate.throttled) {
    return (
      <AnalyticsPage {...frame} showRange={false}>
        <Throttled />
      </AnalyticsPage>
    )
  }

  const res = await getAiSpend(range)
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
  const all = filterAiDaily(d.daily, days)
  const rows = filterAiDaily(d.daily, days, f)
  const opts = aiFilterOptions(all)
  const spend = rows.reduce((s, r) => s + r.cost_usd, 0)
  const budget = budgetState(d.budget, settings.monthlyBudgetUsd)
  const byFn = costByFunction(rows, 12)
  const byModel = costByModelPerDay(rows, days)
  const cache = cacheSavings(
    d.cacheLayer.filter((l) => !f.fn || l.function_name === f.fn),
    rows,
    days,
  )
  const w = waste(rows, days)
  const lat = latencyByFunction(
    d.latency.filter(
      (l) => (!f.model || l.model === f.model) && (!f.fn || l.function_name === f.fn),
    ),
    days,
  )
  const latMax = Math.max(...lat.map((l) => l.p95), 1)
  const dist = d.dist[0]
  const since = sinceDay(days)
  const q = d.quality.filter((r) => r.day >= since)
  const qSum = (k: 'rows' | 'rows_no_subject' | 'pricing_unknown_rows' | 'zero_token_rows') =>
    q.reduce((s, r) => s + r[k], 0)

  // Admin-entered what-if rates; the global ships empty.
  let scenarios: Scenario[] = []
  try {
    const g = await payload.findGlobal({ slug: 'price-scenarios', overrideAccess: true })
    scenarios = (g.scenarios ?? []).map((s) => ({
      label: s.label,
      appliesToModelPattern: s.appliesToModelPattern,
      inputPerMillionUsd: s.inputPerMillionUsd,
      outputPerMillionUsd: s.outputPerMillionUsd,
      cachedPerMillionUsd: s.cachedPerMillionUsd,
      audioInputPerMillionUsd: s.audioInputPerMillionUsd,
      ttsPerMillionCharsUsd: s.ttsPerMillionCharsUsd,
    }))
  } catch {
    scenarios = []
  }
  const scen = priceScenarios(scenarios, d.tokenVolume)

  if (budget.state === 'over-pace') {
    // Record that an admin saw an over-pace state (docs/spec/04 section 5). Best effort, not throttled.
    await payload
      .create({
        collection: 'audit-log',
        overrideAccess: true,
        data: {
          user: gate.userId as number,
          action: 'view:ai-spend:over-pace',
          panel: 'month-to-date',
          range,
        },
      })
      .catch(() => undefined)
  }

  const fresh = d.freshness.ai_usage_latest
    ? `Latest usage row ${minutesBetween(d.freshness.ai_usage_latest, d.freshness.now_utc)} min before the query.`
    : 'No usage rows yet.'

  return (
    <AnalyticsPage {...frame} source={res.source} freshness={fresh}>
      <Panel
        id="mtd"
        title="Month to date"
        summary="Spend so far this month and where it is heading at the last 7 days' pace."
      >
        <StatRow>
          <StatTile label="Spent this month" value={usd(budget.mtd)} />
          <StatTile
            label="Projected end of month"
            value={usd(budget.projected)}
            tone={budget.state === 'over-pace' ? 'attention' : undefined}
            hint={
              budget.state === 'over-pace'
                ? 'Over pace for the budget'
                : budget.state === 'on-track'
                  ? 'On track'
                  : 'No budget set'
            }
          />
          <StatTile
            label="Days left"
            value={int(budget.daysRemaining)}
            hint={`7-day average ${usd(d.budget.last7_daily_avg_usd)} per day`}
          />
        </StatRow>
        {budget.budget ? (
          <>
            <div
              className={`sn-an__meter${budget.state === 'over-pace' ? ' sn-an__meter--attention' : ''}`}
              aria-hidden="true"
            >
              <span style={{ width: `${Math.min(100, (budget.usedPct ?? 0) * 100)}%` }} />
            </div>
            <p className="sn-an__note">
              {pct(budget.usedPct)} of the {usd(budget.budget)} monthly budget used.
            </p>
          </>
        ) : (
          <p className="sn-an__note">
            Set a monthly budget under Globals, Analytics settings to see pace against it.
          </p>
        )}
      </Panel>

      <form
        className="sn-an__filters"
        method="get"
        action="/admin/analytics/ai-spend"
        aria-label="Filters"
      >
        <input type="hidden" name="range" value={range} />
        <label>
          Model
          <select name="model" defaultValue={f.model ?? ''}>
            <option value="">All models</option>
            {opts.models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Function
          <select name="fn" defaultValue={f.fn ?? ''}>
            <option value="">All functions</option>
            {opts.functions.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Scope
          <select name="scope" defaultValue={f.scope ?? ''}>
            <option value="">All scopes</option>
            {opts.scopes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <button type="submit">Apply</button>
      </form>

      <Grid>
        <Panel
          wide
          id="daily"
          title="Daily cost"
          summary={`${usd(spend)} over the last ${range}${f.model || f.fn || f.scope ? ' (filtered)' : ''}.`}
        >
          <SeriesBlock
            data={dailyCost(rows, days).map((r) => ({ day: r.day, cost: r.cost }))}
            series={[{ key: 'cost', label: 'Cost (USD)', color: SERIES[0] }]}
            kind="area"
            format="usd"
            ariaLabel="Area chart of daily AI cost"
            caption="Daily AI cost in USD"
          />
        </Panel>
        <Panel
          id="by-function"
          title="Cost by function"
          summary="Which features cost the most (top 12)."
        >
          <BarList items={byFn} format={usd} caption="AI cost by function" />
        </Panel>
        <Panel id="by-model" title="Cost by model" summary="Model mix per day.">
          <SeriesBlock
            data={byModel.rows}
            series={byModel.models.map((m, i) => ({ key: m, label: m, color: seriesColor(i) }))}
            kind="stackedBars"
            format="usd"
            ariaLabel="Stacked bar chart of daily cost by model"
            caption="Daily AI cost by model in USD"
            height={220}
          />
        </Panel>
        <Panel
          id="cache"
          title="Cache savings"
          summary={
            cache.ratio == null
              ? 'No cache activity in this range.'
              : `Caching avoided ${pct(cache.ratio, 1)} of would-be spend (${usd(cache.saved)} saved, ${usd(cache.spent)} spent).`
          }
        >
          <SeriesBlock
            data={cache.rows}
            series={cache.layers.map((l, i) => ({
              key: l,
              label: label(l),
              color: seriesColor(i),
            }))}
            kind="stackedArea"
            format="usd4"
            ariaLabel="Stacked area chart of savings by cache layer"
            caption="Daily savings by cache layer in USD"
            height={220}
          />
        </Panel>
        <Panel
          id="waste"
          title="Waste"
          summary={`${usd(w.totals.wasted)} on failed or timed-out calls: ${int(w.totals.errors)} errors, ${int(w.totals.timeouts)} timeouts, ${int(w.totals.retries)} retries.`}
        >
          <div className="sn-an__minis">
            {(
              [
                ['wasted', 'Wasted cost', 'usd4'],
                ['errors', 'Errors', 'int'],
                ['timeouts', 'Timeouts', 'int'],
                ['retries', 'Retries', 'int'],
              ] as const
            ).map(([k, title, fmt], i) => (
              <div className="sn-an__mini" key={k}>
                <h3>{title}</h3>
                <SeriesBlock
                  data={w.series.map((r) => ({ day: r.day, [k]: r[k] }))}
                  series={[{ key: k, label: title, color: seriesColor(i) }]}
                  kind="stackedBars"
                  format={fmt}
                  height={110}
                  legend={false}
                  ariaLabel={`Daily ${title.toLowerCase()}`}
                  caption={`Daily ${title.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          id="latency"
          title="Latency"
          summary="Call-weighted median and 95th percentile per function."
          note="Percentiles are averaged across days weighted by calls: a close approximation, not an exact percentile."
        >
          {lat.length ? (
            <table className="sn-an__table">
              <thead>
                <tr>
                  <th scope="col">Function</th>
                  <th scope="col">p50</th>
                  <th scope="col">p95</th>
                  <th scope="col">
                    <span className="sn-an__sr">Plot</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lat.map((l) => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td>{ms(l.p50)}</td>
                    <td>{ms(l.p95)}</td>
                    <td aria-hidden="true">
                      <div className="sn-an__range-plot">
                        <i className="p50" style={{ left: `${(l.p50 / latMax) * 100}%` }} />
                        <i className="p95" style={{ left: `${(l.p95 / latMax) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sn-an__muted">No latency rows for this filter.</p>
          )}
        </Panel>
        <Panel
          id="voice"
          title="Voice flow cost"
          summary="Cost of one full voice-entry chain (voice, follow-up, insights)."
        >
          <SeriesBlock
            data={d.voiceFlow
              .filter((r) => r.day >= since)
              .map((r) => ({ day: r.day, p50: r.p50_usd, p90: r.p90_usd, mean: r.mean_usd }))}
            series={[
              { key: 'p50', label: 'p50', color: SERIES[0] },
              { key: 'p90', label: 'p90', color: SERIES[1] },
              { key: 'mean', label: 'Mean', color: OTHER },
            ]}
            kind="line"
            format="usd4"
            ariaLabel="Line chart of voice flow cost percentiles"
            caption="Cost per voice-entry flow in USD"
            height={220}
          />
        </Panel>
        <Panel
          id="dist"
          title="Per-subject distribution"
          summary="Spread of spend per player. No ids; hidden below the privacy threshold."
        >
          {dist ? (
            <StatRow>
              <StatTile label="Subjects" value={int(dist.subjects)} />
              <StatTile label="p50" value={usd(dist.p50_usd)} />
              <StatTile label="p90" value={usd(dist.p90_usd)} />
              <StatTile label="p99" value={usd(dist.p99_usd)} />
              <StatTile label="Max" value={usd(dist.max_usd)} />
              <StatTile label="Mean" value={usd(dist.mean_usd)} />
            </StatRow>
          ) : (
            <p className="sn-an__muted">
              <Hidden /> Fewer subjects than the privacy threshold.
            </p>
          )}
        </Panel>
        <Panel
          id="top"
          title="Top spenders"
          summary="Concentration of spend by rank only. Needs at least 4 x k subjects."
        >
          <BarList
            items={d.top.map((t) => ({
              label: `Rank ${t.rank}`,
              value: t.cost_usd,
              share: t.pct_of_subject_spend / 100,
            }))}
            format={usd}
            caption="Spend by subject rank"
            empty="Hidden: too few subjects for a rank list."
          />
        </Panel>
        <Panel
          wide
          id="tokens"
          title="Token volume (30 days)"
          summary="Inputs to price scenarios. Logged cost is what the app recorded."
        >
          <div className="sn-an__scroll" tabIndex={0} role="region" aria-label="Token volume table">
            <table className="sn-an__table">
              <thead>
                <tr>
                  <th scope="col">Function</th>
                  <th scope="col">Model</th>
                  <th scope="col">Calls</th>
                  <th scope="col">Input</th>
                  <th scope="col">Audio in</th>
                  <th scope="col">Cached</th>
                  <th scope="col">Output</th>
                  <th scope="col">Thinking</th>
                  <th scope="col">TTS chars</th>
                  <th scope="col">Logged cost</th>
                </tr>
              </thead>
              <tbody>
                {d.tokenVolume.map((r) => (
                  <tr key={`${r.function_name}|${r.model}`}>
                    <td>{r.function_name}</td>
                    <td>{r.model}</td>
                    <td>{int(r.calls)}</td>
                    <td>{short(r.input_text + r.input_image + r.input_video)}</td>
                    <td>{short(r.input_audio)}</td>
                    <td>{short(r.cached)}</td>
                    <td>{short(r.output)}</td>
                    <td>{short(r.thinking)}</td>
                    <td>{short(r.tts_chars)}</td>
                    <td>{usd(r.logged_cost_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          wide
          id="scenarios"
          title="Price scenarios"
          summary="What the last 30 days of volume would cost at rates you enter. Rates are never stored in the repository."
          note="Edit rows under Globals, Price scenarios."
        >
          {scen.length ? (
            <table className="sn-an__table">
              <thead>
                <tr>
                  <th scope="col">Scenario</th>
                  <th scope="col">Applies to</th>
                  <th scope="col">Projected 30 days</th>
                  <th scope="col">Logged 30 days</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                {scen.map((s) => (
                  <tr key={s.label}>
                    <td>{s.label}</td>
                    <td>{s.appliesTo}</td>
                    <td>{usd(s.projectedUsd)}</td>
                    <td>{usd(s.loggedUsd)}</td>
                    <td>
                      {s.deltaPct == null
                        ? 'n/a'
                        : `${s.deltaPct >= 0 ? '+' : ''}${s.deltaPct.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sn-an__muted">
              No scenarios yet. Add one under Globals, Price scenarios.
            </p>
          )}
        </Panel>
        <Panel
          wide
          id="quality"
          title="Data quality"
          summary="Trust check on the numbers above, over the selected range."
        >
          <StatRow>
            <StatTile label="Rows logged" value={int(qSum('rows'))} />
            <StatTile label="Rows without a subject" value={int(qSum('rows_no_subject'))} />
            <StatTile
              label="Unknown pricing"
              value={int(qSum('pricing_unknown_rows'))}
              tone={qSum('pricing_unknown_rows') > 0 ? 'attention' : undefined}
            />
            <StatTile label="Zero-token rows" value={int(qSum('zero_token_rows'))} />
          </StatRow>
          <DataTable
            caption="Data quality totals"
            head={['Measure', 'Rows']}
            rows={[
              ['Rows logged', qSum('rows')],
              ['Rows without a subject', qSum('rows_no_subject')],
              ['Unknown pricing', qSum('pricing_unknown_rows')],
              ['Zero-token rows', qSum('zero_token_rows')],
            ]}
          />
        </Panel>
      </Grid>
      <p className="sn-an__note">
        A function-by-day cost can still reflect one subject when usage is tiny. This is an accepted
        exposure for the founder-only admin.
      </p>
    </AnalyticsPage>
  )
}
