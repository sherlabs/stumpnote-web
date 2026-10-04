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
}

export type PersonaOption = 'inherit' | 'player' | 'coach' | 'parent' | 'team' | null | undefined
