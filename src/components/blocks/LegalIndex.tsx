import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Section } from '@/components/site/Section'
import { legalMeta } from '@/seed/legal'
import { APPLE_EULA_URL, isRouteReady } from '@/lib/site-config'

const LEGAL = (['privacy', 'terms', 'cookies', 'account-deletion', 'data-safety'] as const).map(
  (slug) => ({
    label: slug === 'data-safety' ? 'Data safety summary' : legalMeta[slug].title,
    href: `/${slug}`,
    description: legalMeta[slug].description,
  }),
)

const row =
  'group flex min-h-16 items-center justify-between gap-6 px-5 py-4 text-text transition-colors hover:bg-[var(--hairline-1)]'

/** Lists the legal pages that exist (S5) and the Apple standard EULA. Unlinked pages (data safety) stay out until published. */
export function LegalIndex() {
  const items = LEGAL.filter((l) => isRouteReady(l.href))
  return (
    <Section tight>
      <ul className="flex max-w-[860px] flex-col divide-y divide-[var(--hairline-2)] rounded-3 border border-[var(--hairline-2)]">
        {items.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={row}>
              <span className="flex flex-col gap-1">
                <span className="font-semibold">{l.label}</span>
                <span className="text-[14px] text-muted">{l.description}</span>
              </span>
              <ArrowRight
                aria-hidden
                size={18}
                className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text"
              />
            </Link>
          </li>
        ))}
        <li>
          <a href={APPLE_EULA_URL} rel="noopener" className={row}>
            <span className="flex flex-col gap-1">
              <span className="font-semibold">Apple standard EULA</span>
              <span className="text-[14px] text-muted">
                The standard end user licence agreement that applies on Apple devices (apple.com).
              </span>
            </span>
            <ArrowUpRight
              aria-hidden
              size={18}
              className="shrink-0 text-muted group-hover:text-text"
            />
          </a>
        </li>
      </ul>
    </Section>
  )
}
