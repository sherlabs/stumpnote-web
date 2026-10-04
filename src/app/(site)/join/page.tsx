import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageView } from '@/components/pages/PageView'
import { Section } from '@/components/site/Section'
import { Badge } from '@/components/ui/Badge'
import { Overline } from '@/components/ui/Overline'
import { getContentPage } from '@/lib/cms/content'
import { getBlockContext } from '@/lib/cms/route-context'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage('join')
  if (!page) return { title: 'Not found', robots: { index: false } }
  return {
    title: { absolute: page.metaTitle ?? 'Join the beta | StumpNote' },
    description: page.metaDescription,
    alternates: { canonical: '/join' },
  }
}

// All three iPhone apps are TestFlight only. No availability claim and no App Store badge until each one is live.
const APPS = [
  {
    name: 'StumpNote',
    role: 'For players and captains',
    persona: 'player',
    text: 'Voice journal, daily focus, goals, mindset audio and game plans.',
  },
  {
    name: 'StumpNote Coach',
    role: 'For coaches',
    persona: 'coach',
    text: 'Roster, voice session notes, plans, drills and programs.',
  },
  {
    name: 'StumpNote Parent',
    role: 'For parents and guardians',
    persona: 'parent',
    text: 'Managed profiles, recorded consent and three sharing switches.',
  },
] as const

export default async function JoinPage() {
  const [page, ctx] = await Promise.all([getContentPage('join'), getBlockContext()])
  if (!page) notFound()
  return (
    <PageView
      page={page}
      ctx={ctx}
      extra={
        <Section labelledBy="apps-h" tight>
          <div className="flex flex-col gap-4">
            <Overline>Three apps</Overline>
            <h2 id="apps-h" className="display-3 max-w-[16ch]">
              One account serves every role.
            </h2>
          </div>
          <ul className="app-grid mt-8" role="list">
            {APPS.map((a) => (
              <li
                key={a.name}
                className="app-card"
                data-persona={a.persona === 'player' ? undefined : a.persona}
              >
                <Badge status="In the beta" />
                <h3 className="title">{a.name}</h3>
                <p className="text-[15px] font-semibold text-text">{a.role}</p>
                <p className="text-[16px] leading-[1.5] text-body">{a.text}</p>
                <p className="mt-auto pt-4 text-[14px] text-muted">
                  TestFlight beta. Coming soon to the App Store.
                </p>
              </li>
            ))}
          </ul>
        </Section>
      }
    />
  )
}
