import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/site/Section'
import { Badge } from '@/components/ui/Badge'
import { getChangelog } from '@/lib/cms/content'
import type { ChangelogVM } from '@/lib/cms/content'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const entries = await getChangelog()
  return {
    title: { absolute: 'Changelog | StumpNote' },
    description: 'What changed in StumpNote, newest first: new features, improvements and fixes across the apps.',
    alternates: { canonical: '/changelog' },
    robots: entries.length ? undefined : { index: false },
  }
}

const monthKey = (iso: string) => iso.slice(0, 7)
const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
const APP: Record<string, string> = {
  player: 'Player',
  coach: 'Coach',
  parent: 'Parent',
  web: 'Web',
  site: 'Website',
}
const KIND: Record<string, string> = { new: 'New', improved: 'Improved', fixed: 'Fixed' }

export default async function ChangelogPage() {
  const entries = await getChangelog()
  const groups = new Map<string, ChangelogVM[]>()
  for (const e of entries)
    groups.set(monthKey(e.date), [...(groups.get(monthKey(e.date)) ?? []), e])
  return (
    <>
      <PageHero overline="Changelog" headline={'What changed,\nnewest first.'} />
      <Section tight labelledBy="log-h">
        <h2 id="log-h" className="sr-only">
          Entries by month
        </h2>
        {entries.length === 0 ? (
          <div className="empty-state">
            <p className="title">Nothing here yet.</p>
            <p className="text-body">Entries appear as updates ship.</p>
          </div>
        ) : (
          [...groups.entries()].map(([key, list]) => (
            <div key={key} className="changelog-month">
              <h3 className="display-3">{monthLabel(key)}</h3>
              <ul className="flex flex-col gap-10" role="list">
                {list.map((e) => (
                  <li key={`${e.date}-${e.title}`} className="flex flex-col gap-3">
                    <p className="flex flex-wrap items-center gap-3">
                      <span className="eyebrow">{KIND[e.kind]}</span>
                      <Badge
                        status={
                          e.publicStatus === 'available-web' ? 'Available now (web)' : 'In the beta'
                        }
                      />
                      {e.apps.map((a) => (
                        <span key={a} className="eyebrow !text-muted">
                          {APP[a] ?? a}
                        </span>
                      ))}
                    </p>
                    <h4 className="title">{e.title}</h4>
                    {e.summary && <RichText data={e.summary} className="prose-sn" />}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </Section>
    </>
  )
}
