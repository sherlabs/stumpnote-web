import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageView } from '@/components/pages/PageView'
import { Section } from '@/components/site/Section'
import { Notice } from '@/components/ui/Notice'
import { TextLink } from '@/components/ui/TextLink'
import { getContentPage, getLegalValue } from '@/lib/cms/content'
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
  const [page, ctx, email] = await Promise.all([
    getContentPage('support'),
    getBlockContext(),
    getLegalValue('SUPPORT_EMAIL'),
  ])
  if (!page) notFound()
  return (
    <PageView
      page={page}
      ctx={ctx}
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
  )
}
