import { ogImage, OG_SIZE, OG_TYPE } from '@/lib/seo/og'

export const alt = 'StumpNote: a voice-first cricket journal'
export const size = OG_SIZE
export const contentType = OG_TYPE

export default function Image() {
  return ogImage({
    kicker: 'Voice-first cricket journal',
    title: 'Talk after the game. Get a better next one.',
    subtitle: 'An AI that remembers your cricket: personal briefs, drills and game plans.',
  })
}
