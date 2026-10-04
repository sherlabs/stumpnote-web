import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageView } from '@/components/pages/PageView'
import { Section } from '@/components/site/Section'
import { Notice } from '@/components/ui/Notice'
import { TextLink } from '@/components/ui/TextLink'
import { selectFaqs } from '@/components/blocks/FaqList'
import type { Block } from '@/components/blocks/types'
import { JsonLd } from '@/components/site/JsonLd'
import { faqPageLd, graph } from '@/lib/seo/jsonld'
import { LegalProse } from '@/components/legal/LegalDocument'
import { getContentPage, getLegalValue } from '@/lib/cms/content'
import { getLegalView } from '@/lib/cms/legal'
import { getBlockContext } from '@/lib/cms/route-context'
import { isRouteReady } from '@/lib/site-config'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage('support')
  if (!page) return { title: 'Not found', robots: { index: false } }
  return {
    title: { absolute: page.metaTitle ?? 'Support | StumpNote' },
    description: page.metaDescription,
    alternates: { canonical: '/support' },
  }
}

export default async function SupportPage() {
  const [page, ctx, email, legal] = await Promise.all([
    getContentPage('support'),
    getBlockContext(),
    getLegalValue('SUPPORT_EMAIL'),
    getLegalView('support'),
  ])
  if (!page) notFound()
  // FAQPage structured data only here, built from exactly the FAQs the page shows.
  const shown = ((page.layout ?? []) as Block[])
    .filter((b) => b.blockType === 'faq-list')
    .flatMap((b) => selectFaqs(b as never, ctx.faqs ?? []))
  const faqLd = faqPageLd(shown)
  return (
    <>
      {faqLd && <JsonLd data={graph(faqLd)} />}
      <PageView
        page={page}
        ctx={ctx}
        // The legal-pages support body appears only when it is complete (no placeholders); otherwise the page above is the whole page.
        extra={
          legal.render.mode === 'full' ? (
            <Section tight labelledBy="support-details-h">
              <h2 id="support-details-h" className="display-3 mb-8">
                Support details
              </h2>
              <LegalProse html={legal.render.html} />
            </Section>
          ) : undefined
        }
        afterHero={
          <Section tight>
            <div className="grid gap-4 md:grid-cols-2">
              <Notice title="How to reach us">
                {email ? (
                  <>
                    Email{' '}
                    <a className="text-text underline underline-offset-4" href={`mailto:${email}`}>
                      {email}
                    </a>
                    .
                  </>
                ) : (
                  <>Use the app: Profile, then Help.</>
                )}{' '}
                Include the app, your device and OS version, and what you were doing.
              </Notice>
              <Notice title="Deleting your account">
                Delete it inside the app: Profile, Account, Delete account. Cancel any subscription
                with Apple first.
                {isRouteReady('/account-deletion') && (
                  <>
                    {' '}
                    <TextLink href="/account-deletion">Account deletion</TextLink>
                  </>
                )}
              </Notice>
            </div>
          </Section>
        }
      />
    </>
  )
}
