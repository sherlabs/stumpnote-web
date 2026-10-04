import type { Page } from '@/payload-types'
import type { BetaState } from '@/lib/cms/home'
import type { FaqVM } from '@/lib/cms/content'

export type Block = NonNullable<Page['layout']>[number]
export type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>

export type BlockContext = {
  beta: BetaState
  testimonials: Array<{ id: string; quote: string; attribution: string; role?: string }>
  /** Published FAQs (faq-list block). */
  faqs?: FaqVM[]
  /** Show the 90-day trial line on pricing (Site settings). */
  showTrialLine?: boolean
  /** The first block sits in the initial viewport (page has a short hero): skip its reveal-hide so LCP is not delayed. */
  eagerFirst?: boolean
}

export type PersonaOption = 'inherit' | 'player' | 'coach' | 'parent' | 'team' | null | undefined
