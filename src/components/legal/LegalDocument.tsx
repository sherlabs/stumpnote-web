import type { ReactNode } from 'react'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/site/Section'
import { TrackView } from '@/components/site/TrackView'
import { Notice } from '@/components/ui/Notice'
import { TextLink } from '@/components/ui/TextLink'
import { slugify } from '@/lib/slugify'
import { htmlHeadings, type LegalRender, type LegalValueMap } from '@/lib/legal/render'

/** The notice shown instead of any draft that still has placeholders. Never shows placeholder text. */
export function LegalNotice({ title, values }: { title: string; values: LegalValueMap }) {
  const email = (values.SUPPORT_EMAIL ?? '').trim()
  return (
    <>
      <PageHero overline="Legal" headline={title} size="lg" headingId="legal-h" />
      <Section tight>
        <div className="max-w-[64ch]">
          <Notice title="This page is being finalised">
            It will be published here once complete.{' '}
            {email ? (
              <>
                Questions in the meantime:{' '}
                <a className="text-text underline underline-offset-4" href={`mailto:${email}`}>
                  {email}
                </a>
                .
              </>
            ) : (
              <>Questions in the meantime: use the app, Profile, then Help.</>
            )}
          </Notice>
          <p className="mt-6 text-[15px] text-muted">
            <TextLink href="/legal">All legal pages</TextLink>
          </p>
        </div>
      </Section>
    </>
  )
}

/** Full legal document: title, meta line, contents list, body. Body HTML comes from renderLegal (no raw HTML, escaped values). */
export function LegalDocument({
  title,
  render,
  meta,
  footer,
}: {
  title: string
  render: Extract<LegalRender, { mode: 'full' }>
  meta?: ReactNode
  footer?: ReactNode
}) {
  const toc = htmlHeadings(render.html)
  return (
    <>
      <TrackView event="legal_view" slug={slugify(title)} />
      <PageHero overline="Legal" headline={title} size="lg" headingId="legal-h">
        {meta && <p className="legal-meta">{meta}</p>}
      </PageHero>
      <Section tight className="legal-section">
        <div className={toc.length > 2 ? 'legal-layout' : 'legal-layout legal-layout-single'}>
          {toc.length > 2 && (
            <div className="legal-toc">
              <details className="lg:hidden rounded-2 border border-[var(--hairline-2)] px-4">
                <summary className="eyebrow">On this page</summary>
                <nav aria-label="On this page, mobile">
                  <ol className="legal-toc-list pb-3">
                    {toc.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`}>{h.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
              <nav className="hidden lg:block" aria-label="On this page">
                <p className="eyebrow mb-3">On this page</p>
                <ol className="legal-toc-list">
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          )}
          <article className="legal-prose" dangerouslySetInnerHTML={{ __html: render.html }} />
        </div>
        {footer}
      </Section>
    </>
  )
}

/** Just the prose, for embedding a complete legal body in another page (support). */
export function LegalProse({ html }: { html: string }) {
  return <article className="legal-prose" dangerouslySetInnerHTML={{ __html: html }} />
}
