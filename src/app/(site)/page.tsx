import type { Metadata } from 'next'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { Block } from '@/components/blocks/types'
import { JsonLd } from '@/components/site/JsonLd'
import { getLegalValue } from '@/lib/cms/content'
import { getHomeContent } from '@/lib/cms/home'
import { serverURL } from '@/lib/env'
import { graph, organizationLd, softwareApplicationsLd, websiteLd } from '@/lib/seo/jsonld'

// ISR: the CMS document (when a database exists) is re-read at most every 5 minutes; S4 adds on-demand revalidation.
export const revalidate = 300

export const metadata: Metadata = {
  title: { absolute: 'StumpNote | Voice-first cricket journal' },
  alternates: { canonical: '/' },
  description:
    'StumpNote is a voice-first cricket journal. Talk after a session, get a personal brief, drills and game plans built from your own history.',
}

export default async function HomePage() {
  const [{ page, beta, testimonials }, legalName] = await Promise.all([
    getHomeContent(),
    getLegalValue('COMPANY_LEGAL_NAME'),
  ])
  const baseUrl = serverURL()
  return (
    <>
      <JsonLd
        data={graph(
          organizationLd({ baseUrl, legalName }),
          websiteLd(baseUrl),
          softwareApplicationsLd({ baseUrl, beta }),
        )}
      />
      <RenderBlocks blocks={(page.layout ?? []) as Block[]} ctx={{ beta, testimonials }} />
    </>
  )
}
