import type { Page } from '@/payload-types'
import type { BetaState } from '@/lib/cms/home'

export type Block = NonNullable<Page['layout']>[number]
export type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>

export type BlockContext = {
  beta: BetaState
  testimonials: Array<{ id: string; quote: string; attribution: string; role?: string }>
}

export type PersonaOption = 'inherit' | 'player' | 'coach' | 'parent' | 'team' | null | undefined
