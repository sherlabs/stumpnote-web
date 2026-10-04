import { RichText } from '@payloadcms/richtext-lexical/react'
import { Section } from '@/components/site/Section'
import type { BlockOf } from './types'

export function TwoColumn({ block }: { block: BlockOf<'two-column'> }) {
  if (!block.left && !block.right) return null
  return (
    <Section tight>
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        {block.left && <RichText data={block.left} className="prose-sn" />}
        {block.right && <RichText data={block.right} className="prose-sn" />}
      </div>
    </Section>
  )
}
