import type { AdminViewServerProps } from 'payload'
import { requireAdmin } from '@/analytics/access'
import { rankedFromList, totalOf, webFunnel } from '@/analytics/aggregate'
import { getWeb, webProviderId } from '@/analytics'
import { parseRange } from '@/analytics/types'
import { AnalyticsPage } from '../../components/AnalyticsPage'
import { BarList, FunnelBars } from '../../components/lists'
import { Grid, Panel, StatRow, StatTile } from '../../components/Panel'
import { SeriesBlock } from '../../components/SeriesBlock'
import { EmptyState } from '../../components/SampleDataBanner'
import { Throttled } from '../../components/Throttled'
import { dec1, int, ms, pct } from '../../fmt'
import { loadSettings, one } from '../../settings'
import { SERIES } from '../../palette'

export default async function WebAnalyticsView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
  const settings = await loadSettings(initPageResult.req.payload)
  const range = parseRange(one(searchParams?.range), settings.defaultRange)
  const gate = await requireAdmin(initPageResult, 'view:web', { panel: 'web', range })
  const frame = {
    initPageResult,
    params,
    searchParams,
    title: 'Website analytics',
    basePath: '/admin/analytics/web',
    range,
  }
  const lede =
    'Cookieless, aggregate-only traffic for stumpnote.com. No person-level data leaves the provider.'

  if (gate.throttled) {
    return (
      <AnalyticsPage {...frame} lede={lede} showRange={false}>
        <Throttled />
      </AnalyticsPage>
    )
  }

  const res = await getWeb(range)
  if (res.status !== 'ok') {
    return (
      <AnalyticsPage {...frame} lede={lede}>
        {res.status === 'unconfigured' ? (
          <EmptyState title="Web analytics is not connected" missing={res.missing} />
        ) : (
          <EmptyState title="The analytics provider did not answer" message={res.message} />
        )}
      </AnalyticsPage>
    )
  }

  const d = res.data
  const visitors = d.daily.reduce((s, r) => s + r.visitors, 0)
  const pageviews = d.daily.reduce((s, r) => s + r.pageviews, 0)
  const funnel = webFunnel(d)
  const heroViews = funnel[0]?.count ?? 0
  const submits = d.funnel.find((f) => f.event === 'beta_form_submit')?.count ?? 0
  const provider = webProviderId()

  return (
    <AnalyticsPage
      {...frame}
      lede={lede}
      source={res.source}
      freshness={
        res.source === 'live'
          ? `Provider: ${provider}. Cached up to 5 minutes.`
          : 'Provider adapter wired, inactive until a provider is chosen.'
      }
    >
      <StatRow>
        <StatTile
          label={`Visitors (${range})`}
          value={int(visitors)}
          hint="Daily uniques summed (a person on two days counts twice)"
        />
        <StatTile label="Pageviews" value={int(pageviews)} />
        <StatTile
          label="Pages per visitor"
          value={visitors > 0 ? dec1(pageviews / visitors) : 'n/a'}
        />
        <StatTile
          label="Beta form conversion"
          value={heroViews > 0 ? pct(submits / heroViews, 1) : 'n/a'}
          hint="beta_form_submit / cta_view_hero"
        />
      </StatRow>

      <Grid>
        <Panel
          wide
          id="visitors"
          title="Visitors and pageviews per day"
          summary={`${int(visitors)} visitor-days and ${int(pageviews)} pageviews in the last ${range}.`}
        >
          <SeriesBlock
            data={d.daily.map((r) => ({
              day: r.day,
              visitors: r.visitors,
              pageviews: r.pageviews,
            }))}
            series={[
              { key: 'visitors', label: 'Visitors', color: SERIES[0] },
              { key: 'pageviews', label: 'Pageviews', color: SERIES[1] },
            ]}
            kind="line"
            ariaLabel="Line chart of daily visitors and pageviews"
            caption="Visitors and pageviews per day"
          />
        </Panel>
        <Panel id="pages" title="Top pages" summary="Pageviews by path (top 15).">
          <BarList
            items={rankedFromList(d.topPages)}
            format={int}
            caption="Top pages by pageviews"
          />
        </Panel>
        <Panel id="referrers" title="Referrers" summary="Where visits came from (top 10).">
          <BarList
            items={rankedFromList(d.referrers)}
            format={int}
            tone="coach"
            caption="Top referrers"
          />
        </Panel>
        <Panel id="countries" title="Countries" summary="Pageviews by country code (top 10).">
          <BarList
            items={rankedFromList(d.countries)}
            format={int}
            tone="parent"
            caption="Top countries"
          />
        </Panel>
        <Panel
          id="devices"
          title="Devices"
          summary={`${pct(totalOf(d.devices) > 0 ? (d.devices.find((x) => x.label === 'mobile')?.value ?? 0) / totalOf(d.devices) : 0)} of pageviews are on mobile.`}
        >
          <BarList
            items={rankedFromList(d.devices)}
            format={int}
            tone="team"
            caption="Pageviews by device type"
          />
        </Panel>
        <Panel
          id="funnel"
          title="Beta funnel"
          summary="From seeing the hero call to action to leaving for the app."
          note="Counts are events, not people: a visitor can fire several events."
        >
          <FunnelBars
            stages={funnel.map((f) => ({
              label: f.event.replace(/_/g, ' '),
              count: f.count,
              pctOfTop: f.pctOfTop,
              pctOfPrev: f.pctOfPrev,
            }))}
            caption="Beta funnel event counts"
          />
        </Panel>
        <Panel
          id="persona"
          title="Persona interest"
          summary="Persona tab switches and beta sign-ups by persona."
        >
          <BarList
            items={d.persona.map((p) => ({
              label: `${p.persona} (${int(p.signups)} sign-ups)`,
              value: p.switches,
            }))}
            format={int}
            caption="Persona switches with sign-up counts"
          />
        </Panel>
        <Panel
          id="vitals"
          title="Web vitals (p75)"
          summary="Real-user Core Web Vitals, if the provider captures them."
          note="Property names are checked against live data when the provider is connected."
        >
          <StatRow>
            <StatTile label="LCP" value={ms(d.vitals.lcp_ms)} />
            <StatTile label="CLS" value={d.vitals.cls == null ? 'n/a' : d.vitals.cls.toFixed(3)} />
            <StatTile label="INP" value={ms(d.vitals.inp_ms)} />
          </StatRow>
        </Panel>
        <Panel
          id="quota"
          title="Event allowance"
          summary="This month's events against the provider's plan."
        >
          <StatRow>
            <StatTile
              label="Events this month"
              value={int(d.eventsThisMonth)}
              hint={d.eventCap ? `Cap ${int(d.eventCap)}` : 'No cap configured'}
            />
          </StatRow>
          {d.eventsThisMonth != null && d.eventCap ? (
            <div className="sn-an__meter" aria-hidden="true">
              <span
                style={{ width: `${Math.min(100, (d.eventsThisMonth / d.eventCap) * 100)}%` }}
              />
            </div>
          ) : null}
        </Panel>
      </Grid>
    </AnalyticsPage>
  )
}
