import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'
import '../analytics.css'
import { RangePicker } from './RangePicker'
import { SampleDataBanner } from './SampleDataBanner'
import type { Range } from '@/analytics/types'

type Props = Pick<AdminViewServerProps, 'initPageResult' | 'params' | 'searchParams'> & {
  title: string
  lede: string
  /** Current section path for the range picker links, e.g. /admin/analytics/web */
  basePath: string
  range: Range
  /** Query params (besides range) that the picker must keep. */
  keep?: Record<string, string | undefined>
  source?: 'fixtures' | 'live'
  freshness?: ReactNode
  /** When false, the range picker is not shown (a view with no range-dependent panels). */
  showRange?: boolean
  children: ReactNode
}

/** Shared frame: Payload's default template, title, range picker, sample-data banner. */
export function AnalyticsPage({
  initPageResult,
  params,
  searchParams,
  title,
  lede,
  basePath,
  range,
  keep,
  source,
  freshness,
  showRange = true,
  children,
}: Props) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user || undefined}
      visibleEntities={{
        collections: visibleEntities?.collections,
        globals: visibleEntities?.globals,
      }}
    >
      <Gutter>
        <div className="sn-an">
          <header className="sn-an__head">
            <div>
              <p className="sn-an__eyebrow">Analytics</p>
              <h1 className="sn-an__title">{title}</h1>
              <p className="sn-an__lede">{lede}</p>
            </div>
            <div className="sn-an__head-side">
              {showRange ? <RangePicker basePath={basePath} range={range} keep={keep} /> : null}
              {freshness ? <p className="sn-an__fresh">{freshness}</p> : null}
            </div>
          </header>
          {source === 'fixtures' ? <SampleDataBanner /> : null}
          {children}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
