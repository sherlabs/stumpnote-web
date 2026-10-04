import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/site/Section'
import { PageHero } from '@/components/pages/PageHero'
import { Notice } from '@/components/ui/Notice'
import { TextLink } from '@/components/ui/TextLink'
import {
  getLegalVersions,
  getLegalVersionView,
  getLegalView,
  type LegalView,
} from '@/lib/cms/legal'
import { isRouteReady } from '@/lib/site-config'
import { legalMeta, type LegalSlug } from '@/seed/legal'
import { LegalDocument, LegalNotice } from './LegalDocument'

/** Metadata for a legal route. Notice mode is noindex; so are history and old-version routes. */
export async function legalMetadata(slug: LegalSlug): Promise<Metadata> {
  const { render } = await getLegalView(slug)
  const m = legalMeta[slug]
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/${slug}` },
    // noindex while in notice mode, and for any page not yet linked/published (data-safety awaits the owner's decision)
    robots:
      render.mode === 'full' && isRouteReady(`/${slug}`) ? undefined : { index: false, follow: true },
  }
}

/** One legal route: the full page, or the notice while any placeholder remains. */
export async function LegalRoute({
  slug,
  withHistory,
}: {
  slug: LegalSlug
  withHistory?: boolean
}) {
  const { doc, values, render } = await getLegalView(slug)
  if (render.mode === 'notice') return <LegalNotice title={doc.title} values={values} />
  return (
    <LegalDocument
      title={doc.title}
      render={render}
      meta={
        withHistory ? (
          <Link href={`/${slug}/history`} className="underline underline-offset-4 hover:text-text">
            Version history
          </Link>
        ) : undefined
      }
    />
  )
}

export function legalHistoryMetadata(slug: LegalSlug): Metadata {
  return {
    title: `${legalMeta[slug].title}: version history`,
    alternates: { canonical: `/${slug}/history` },
    robots: { index: false, follow: true },
  }
}

/** Lists published versions only; each links to the exact text that was in force. */
export async function LegalHistoryRoute({ slug }: { slug: LegalSlug }) {
  const [versions, current] = await Promise.all([getLegalVersions(slug), getLegalView(slug)])
  const title = `${legalMeta[slug].title}: version history`
  return (
    <>
      <PageHero overline="Legal" headline={title} size="lg" headingId="legal-h" />
      <Section tight>
        <div className="max-w-[64ch]">
          {versions.length === 0 ? (
            <Notice title="No earlier versions">
              {current.render.mode === 'full'
                ? 'This is the first published version.'
                : 'The page is being finalised and has no published version yet.'}
            </Notice>
          ) : (
            <ul className="legal-history-list">
              {versions.map((v) => (
                <li key={v.versionId}>
                  <Link
                    href={`/${slug}/v/${encodeURIComponent(v.policyVersion)}`}
                    className="flex min-h-14 flex-col justify-center gap-0.5 px-5 py-3 text-text hover:bg-[var(--hairline-1)]"
                  >
                    <span className="font-semibold">Version {v.policyVersion}</span>
                    <span className="text-[14px] text-muted">
                      {v.effectiveDate
                        ? `Effective ${new Date(v.effectiveDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}`
                        : 'Effective date not recorded'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 text-[15px]">
            <TextLink href={`/${slug}`}>Back to {legalMeta[slug].title}</TextLink>
          </p>
        </div>
      </Section>
    </>
  )
}

export function legalVersionMetadata(slug: LegalSlug, policyVersion: string): Metadata {
  return {
    title: `${legalMeta[slug].title} (version ${policyVersion})`,
    alternates: { canonical: `/${slug}` },
    robots: { index: false, follow: true },
  }
}

/** Exactly one published version. Returns null when it does not exist or is still in notice mode. */
export async function loadLegalVersion(
  slug: LegalSlug,
  policyVersion: string,
): Promise<LegalView | null> {
  const v = await getLegalVersionView(slug, policyVersion)
  return v && v.render.mode === 'full' ? v : null
}

export function LegalVersionView({ slug, view }: { slug: LegalSlug; view: LegalView }) {
  if (view.render.mode !== 'full') return null
  return (
    <LegalDocument
      title={view.doc.title}
      render={view.render}
      meta={
        <Link href={`/${slug}/history`} className="underline underline-offset-4 hover:text-text">
          All versions
        </Link>
      }
      footer={
        <p className="mt-10 max-w-[64ch] text-[15px] text-muted">
          You are reading an earlier version.{' '}
          <TextLink href={`/${slug}`}>Read the current version</TextLink>
        </p>
      }
    />
  )
}
