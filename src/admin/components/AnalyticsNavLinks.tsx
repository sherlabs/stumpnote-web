import Link from 'next/link'
import type { ServerProps } from 'payload'
import { canSeeAnalytics } from '@/analytics/access'
import '../analytics.css'

/** "Analytics" group in the admin nav. Admin-only; renders nothing for editors and viewers. */
export default function AnalyticsNavLinks({ user }: ServerProps) {
  if (!canSeeAnalytics(user)) return null
  return (
    <nav className="sn-an__navgroup" aria-label="Analytics">
      <h4>Analytics</h4>
      <Link href="/admin/analytics/web">Website</Link>
      <Link href="/admin/analytics/ai-spend">AI spend</Link>
      <Link href="/admin/analytics/product">Product</Link>
    </nav>
  )
}
