import type { Metadata } from 'next'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { Block } from '@/components/blocks/types'
import { getHomeContent } from '@/lib/cms/home'

// ISR: the CMS document (when a database exists) is re-read at most every 5 minutes; S4 adds on-demand revalidation.
export const revalidate = 300

export const metadata: Metadata = {
  title: { absolute: 'StumpNote | Voice-first cricket journal' },
  description:
    'StumpNote is a voice-first cricket journal. Talk after a session, get a personal brief, drills and game plans built from your own history.',
}

export default async function HomePage() {
  const { page, beta, testimonials } = await getHomeContent()
  return <RenderBlocks blocks={(page.layout ?? []) as Block[]} ctx={{ beta, testimonials }} />
}
