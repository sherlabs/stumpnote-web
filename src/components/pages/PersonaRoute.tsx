import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPersona } from '@/lib/cms/content'
import { getBlockContext } from '@/lib/cms/route-context'
import { PersonaView } from './PersonaView'

export async function personaMetadata(slug: string): Promise<Metadata> {
  const p = await getPersona(slug)
  if (!p) return { title: 'Not found', robots: { index: false } }
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDescription,
    alternates: { canonical: p.route ?? `/${slug}` },
  }
}

/** Shared body of /players /captains /coaches /parents. `/captains` also shows the Team member section. */
export async function PersonaRoute({ slug }: { slug: string }) {
  const [persona, ctx] = await Promise.all([getPersona(slug), getBlockContext()])
  if (!persona) notFound()
  const members = slug === 'captains' ? await getPersona('members') : null
  return <PersonaView persona={persona} members={members} ctx={ctx} />
}
