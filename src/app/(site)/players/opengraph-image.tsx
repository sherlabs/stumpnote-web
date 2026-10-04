import { OG_SIZE, OG_TYPE } from '@/lib/seo/og'
import { personaOg } from '@/lib/seo/persona-og'

export const alt = 'StumpNote for players'
export const size = OG_SIZE
export const contentType = OG_TYPE

export default function Image() {
  return personaOg('players')
}
