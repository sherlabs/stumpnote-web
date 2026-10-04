import { RichText } from '@payloadcms/richtext-lexical/react'
import { Section } from '@/components/site/Section'
import type { BlockOf } from './types'

export function RichTextBlock({ block }: { block: BlockOf<'rich-text'> }) {
  if (!block.content) return null
  return (
    <Section tight>
      <RichText data={block.content} className="prose-sn measure" />
    </Section>
  )
}
