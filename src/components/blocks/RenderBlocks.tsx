import { ChapterBlock } from './ChapterBlock'
import { CtaBeta } from './CtaBeta'
import { FaqList } from './FaqList'
import { FeatureCarousel } from './FeatureCarousel'
import { HeroStory } from './HeroStory'
import { LegalIndex } from './LegalIndex'
import { MediaBlock } from './MediaBlock'
import { PersonaTabs } from './PersonaTabs'
import { PricingTable } from './PricingTable'
import { Principles } from './Principles'
import { RichTextBlock } from './RichTextBlock'
import { Statement } from './Statement'
import { Testimonials } from './Testimonials'
import { TwoColumn } from './TwoColumn'
import type { Block, BlockContext } from './types'

/** One switch for CMS documents and the code fallback alike. Unknown block types render nothing. */
export function RenderBlocks({ blocks, ctx }: { blocks: Block[]; ctx: BlockContext }) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = block.id ?? `${block.blockType}-${i}`
        switch (block.blockType) {
          case 'hero-story':
            return <HeroStory key={key} block={block} ctx={ctx} />
          case 'statement':
            return <Statement key={key} block={block} />
          case 'chapter':
            return <ChapterBlock key={key} block={block} />
          case 'persona-tabs':
            return <PersonaTabs key={key} block={block} />
          case 'feature-carousel':
            return <FeatureCarousel key={key} block={block} />
          case 'principles':
            return <Principles key={key} block={block} />
          case 'cta-beta':
            return <CtaBeta key={key} block={block} ctx={ctx} />
          case 'rich-text':
            return <RichTextBlock key={key} block={block} />
          case 'testimonials':
            return <Testimonials key={key} ctx={ctx} />
          case 'pricing-table':
            return <PricingTable key={key} block={block} ctx={ctx} />
          case 'faq-list':
            return <FaqList key={key} block={block} ctx={ctx} />
          case 'media-block':
            return <MediaBlock key={key} block={block} />
          case 'two-column':
            return <TwoColumn key={key} block={block} />
          case 'legal-index':
            return <LegalIndex key={key} />
          default:
            return null
        }
      })}
    </>
  )
}
