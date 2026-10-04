import Link from 'next/link'
import { Section } from '@/components/site/Section'
import { APPLE_EULA_URL, isRouteReady } from '@/lib/site-config'

const LEGAL = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Account deletion', href: '/account-deletion' },
  { label: 'Data safety summary', href: '/data-safety' },
]

/** Lists the legal pages that exist (S5 builds them) and the Apple standard EULA. */
export function LegalIndex() {
  const items = LEGAL.filter((l) => isRouteReady(l.href))
  return (
    <Section tight>
      <ul className="flex flex-col divide-y divide-[var(--hairline-2)] rounded-3 border border-[var(--hairline-2)]">
        {items.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex min-h-14 items-center px-5 text-text hover:bg-[var(--hairline-1)]"
            >
              {l.label}
            </Link>
          </li>
        ))}
        <li>
          <a
            href={APPLE_EULA_URL}
            rel="noopener"
            className="flex min-h-14 items-center px-5 text-text hover:bg-[var(--hairline-1)]"
          >
            Apple standard EULA
          </a>
        </li>
      </ul>
    </Section>
  )
}
