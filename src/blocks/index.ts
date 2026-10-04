import type { Block } from 'payload'
import { richText } from '@/fields/richText'
import { DEMO_OPTIONS, PERSONA_OPTIONS, STATUS_OPTIONS, linkGroup } from './shared'

export * from './shared'

const heroStory: Block = {
  slug: 'hero-story',
  labels: { singular: 'Hero (story)', plural: 'Hero (story)' },
  interfaceName: 'HeroStoryBlock',
  fields: [
    { name: 'overline', type: 'text' },
    {
      name: 'headline',
      type: 'textarea',
      required: true,
      admin: { description: 'Up to 3 lines. One line break per visual line.' },
    },
    { name: 'subcopy', type: 'textarea' },
    linkGroup('primaryCta', 'Primary CTA (overridden by Beta access state)'),
    linkGroup('secondaryCta', 'Secondary CTA'),
    { name: 'showMStroke', type: 'checkbox', defaultValue: true },
    { name: 'showPersonaChips', type: 'checkbox', defaultValue: true },
  ],
}

const statement: Block = {
  slug: 'statement',
  interfaceName: 'StatementBlock',
  fields: [
    { name: 'text', type: 'text', required: true, maxLength: 140 },
    {
      name: 'fragments',
      type: 'array',
      maxRows: 8,
      admin: { description: 'Short "lost note" fragments that drift and dim while scrolling.' },
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 60 }],
    },
  ],
}

const chapter: Block = {
  slug: 'chapter',
  interfaceName: 'ChapterBlock',
  fields: [
    { name: 'anchor', type: 'text', admin: { description: 'Optional in-page id (no #).' } },
    { name: 'overline', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    {
      name: 'bullets',
      type: 'array',
      maxRows: 5,
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'steps',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Used by the "How it learns" stage (demo = learn-stage).' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    { name: 'demo', type: 'select', defaultValue: 'none', options: [...DEMO_OPTIONS] },
    {
      name: 'badge',
      type: 'select',
      defaultValue: 'none',
      options: [...STATUS_OPTIONS],
      admin: { description: 'Public status vocabulary only.' },
    },
    {
      name: 'teaser',
      type: 'text',
      admin: {
        description: 'Allowed teaser line for coming-soon parts (shown with a Coming soon badge).',
      },
    },
    {
      name: 'scenario',
      type: 'group',
      admin: {
        description: 'Rendered under the label "Illustrative scenario". Fictional persona only.',
      },
      fields: [
        { name: 'persona', type: 'text' },
        { name: 'text', type: 'textarea' },
      ],
    },
    { name: 'persona', type: 'select', defaultValue: 'inherit', options: [...PERSONA_OPTIONS] },
    { name: 'pin', type: 'checkbox', defaultValue: false },
    { name: 'reverse', type: 'checkbox', defaultValue: false },
    linkGroup('link', 'Link'),
  ],
}

const personaTabs: Block = {
  slug: 'persona-tabs',
  interfaceName: 'PersonaTabsBlock',
  fields: [
    { name: 'overline', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'personas',
      type: 'relationship',
      relationTo: 'personas',
      hasMany: true,
      admin: { description: 'Leave empty to use the built-in copy from the content brief.' },
    },
  ],
}

const featureCarousel: Block = {
  slug: 'feature-carousel',
  interfaceName: 'FeatureCarouselBlock',
  fields: [
    { name: 'overline', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'features',
      type: 'relationship',
      relationTo: 'features',
      hasMany: true,
      admin: { description: 'Leave empty to use the built-in list of eight features.' },
    },
    {
      name: 'filterByArea',
      type: 'select',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Journal and memory', value: 'journal-memory' },
        { label: 'Mental game', value: 'mental-game' },
        { label: 'Game day', value: 'game-day' },
        { label: 'Team', value: 'team' },
        { label: 'Coach', value: 'coach' },
        { label: 'Parent', value: 'parent' },
        { label: 'Platform', value: 'platform' },
      ],
    },
  ],
}

const ctaBeta: Block = {
  slug: 'cta-beta',
  interfaceName: 'CtaBetaBlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subcopy', type: 'textarea' },
  ],
}

const principles: Block = {
  slug: 'principles',
  interfaceName: 'PrinciplesBlock',
  fields: [
    { name: 'overline', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      minRows: 3,
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
        { name: 'icon', type: 'text', admin: { description: 'Lucide icon name, e.g. KeyRound.' } },
      ],
    },
    linkGroup('link', 'Link'),
  ],
}

const richTextBlock: Block = {
  slug: 'rich-text',
  interfaceName: 'RichTextBlock',
  fields: [{ name: 'content', type: 'richText', editor: richText }],
}

const testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  // No fields: reads approved + consented testimonial records and renders nothing when there are none.
  fields: [],
}

export const pageBlocks: Block[] = [
  heroStory,
  statement,
  chapter,
  personaTabs,
  featureCarousel,
  ctaBeta,
  principles,
  richTextBlock,
  testimonials,
]
