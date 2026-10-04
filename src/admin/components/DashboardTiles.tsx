import Link from 'next/link'
import type { ServerProps } from 'payload'
import { getAiSpend, getProduct, getWeb } from '@/analytics'
import { canSeeAnalytics } from '@/analytics/access'
import '../analytics.css'
import { int, usd } from '../fmt'

/** Three link tiles at the top of /admin: visitors (7d), AI spend MTD, MAU. Admin-only; renders nothing otherwise. */
export default async function DashboardTiles({ user }: ServerProps) {
  if (!canSeeAnalytics(user)) return null
  const [web, ai, product] = await Promise.all([getWeb('7d'), getAiSpend('7d'), getProduct('7d')])
  const sample = [web, ai, product].some((r) => r.status === 'ok' && r.source === 'fixtures')
  const visitors =
    web.status === 'ok' ? int(web.data.daily.reduce((s, r) => s + r.visitors, 0)) : 'n/a'
  const spend = ai.status === 'ok' ? usd(ai.data.budget.mtd_cost_usd) : 'n/a'
  const mau =
    product.status === 'ok' ? int(product.data.active[product.data.active.length - 1]?.mau) : 'n/a'
  return (
    <div className="sn-an sn-an--inline" aria-label="Analytics overview">
      <div className="sn-an__tilelinks">
        <Link className="sn-an__tilelink" href="/admin/analytics/web">
          <p className="sn-an__tile-label">Visitors, last 7 days</p>
          <p className="sn-an__tile-value">{visitors}</p>
          <p className="sn-an__tile-hint">Website analytics{sample ? ' (sample data)' : ''}</p>
        </Link>
        <Link className="sn-an__tilelink" href="/admin/analytics/ai-spend">
          <p className="sn-an__tile-label">AI spend, month to date</p>
          <p className="sn-an__tile-value">{spend}</p>
          <p className="sn-an__tile-hint">AI spend{sample ? ' (sample data)' : ''}</p>
        </Link>
        <Link className="sn-an__tilelink" href="/admin/analytics/product">
          <p className="sn-an__tile-label">Monthly active users</p>
          <p className="sn-an__tile-value">{mau}</p>
          <p className="sn-an__tile-hint">Product analytics{sample ? ' (sample data)' : ''}</p>
        </Link>
      </div>
    </div>
  )
}
