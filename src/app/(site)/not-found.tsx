import Link from 'next/link'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-[var(--content-max)] flex-col justify-center gap-6 px-[var(--gutter)] py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">404</p>
      <h1 className="font-display text-[clamp(40px,6vw,96px)] font-black leading-[0.9] tracking-[-0.04em] text-text">
        Out of your ground.
      </h1>
      <p className="text-muted">That page does not exist. Head back to the crease.</p>
      <Link href="/" className="text-text underline underline-offset-4 hover:text-accent">
        Back to the home page
      </Link>
    </div>
  )
}
