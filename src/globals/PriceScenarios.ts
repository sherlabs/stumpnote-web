import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

/** "What if" pricing rows for the AI-spend view. Ships EMPTY; never seeded with real rates in the public repo. */
export const PriceScenarios: GlobalConfig = {
  slug: 'price-scenarios',
  access: { read: isAdmin, update: isAdmin },
  fields: [
    {
      name: 'scenarios',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'appliesToModelPattern', type: 'text' },
        { name: 'inputPerMillionUsd', type: 'number' },
        { name: 'outputPerMillionUsd', type: 'number' },
        { name: 'cachedPerMillionUsd', type: 'number' },
        { name: 'audioInputPerMillionUsd', type: 'number' },
        { name: 'ttsPerMillionCharsUsd', type: 'number' },
      ],
    },
  ],
}
