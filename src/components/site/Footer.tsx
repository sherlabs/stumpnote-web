import Link from 'next/link'
import { Logo } from './Logo'
import { MotionToggle } from './MotionToggle'
import { WEB_APP_URL, footerColumns } from '@/lib/site-config'

// Static fallback columns (CMS `navigation` global replaces them in S4). Only built routes render.
export function Footer({ year = 2026 }: { year?: number }) {
  const cols = footerColumns
    .map((c) => ({ ...c, items: c.items.filter((i) => i.ready) }))
    .filter((c) => c.items.length > 0)
  return (
    <footer className="relative z-10 mt-[var(--s-8)] border-t border-[var(--hairline-2)]">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col items-start gap-5">
          <Logo />
          <p className="body-sm measure max-w-[34ch] text-muted">
            A voice-first cricket journal with an AI that remembers your game.
          </p>
          <MotionToggle />
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className="eyebrow mb-4">{c.title}</h2>
              <ul className="flex flex-col">
                {c.items.map((i) => {
                  const external = /^https?:\/\//.test(i.href)
                  const cls =
                    'inline-flex min-h-8 items-center text-[15px] text-body transition-colors hover:text-text'
                  return (
                    <li key={i.href}>
                      {external ? (
                        <a
                          href={i.href}
                          className={cls}
                          rel="noopener"
                          data-track={
                            i.href.startsWith(WEB_APP_URL) ? 'outbound_app_link' : undefined
                          }
                        >
                          {i.label}
                        </a>
                      ) : (
                        <Link href={i.href} className={cls}>
                          {i.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-[var(--hairline-1)]">
        <div className="container-x flex flex-col gap-2 py-6 text-[13px] text-muted md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} StumpNote.</p>
          <p>
            AI-generated insights are guidance for reflection and training. They can make mistakes.
          </p>
        </div>
      </div>
    </footer>
  )
}
