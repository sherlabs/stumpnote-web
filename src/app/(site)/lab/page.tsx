export const metadata = { title: 'Lab', robots: { index: false, follow: false } }
export const dynamic = 'force-static'

// Component demo route. Empty shell in S1; signature components land here in S2.
export default function LabPage() {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)] py-24">
      <h1 className="font-display text-4xl font-black text-text">Lab</h1>
      <p className="mt-4 text-muted">Component demos arrive in S2.</p>
    </div>
  )
}
