import { getPersona } from '@/lib/cms/content'
import { ogImage } from './og'

const ACCENT = { players: 'player', captains: 'team', coaches: 'coach', parents: 'parent' } as const
const KICKER = {
  players: 'StumpNote for players',
  captains: 'StumpNote for captains',
  coaches: 'StumpNote Coach',
  parents: 'StumpNote Parent',
} as const

export async function personaOg(slug: keyof typeof ACCENT) {
  const p = await getPersona(slug)
  return ogImage({
    accent: ACCENT[slug],
    kicker: KICKER[slug],
    title: p?.headline ?? 'StumpNote',
    subtitle: p?.subcopy,
  })
}
