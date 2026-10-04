import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidate'
import { isAdmin } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: isAdmin },
  admin: { description: 'Public, non-secret site configuration. Read by server components only.' },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'StumpNote', required: true },
    { name: 'tagline', type: 'text', defaultValue: 'Your cricket, remembered.' },
    { name: 'webAppUrl', type: 'text', defaultValue: 'https://app.stumpnote.com' },
    {
      name: 'showPricing',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Indicative pricing, no buy button (D-14).' },
    },
    { name: 'showTrialLine', type: 'checkbox', defaultValue: false },
    {
      name: 'footerDisclosure',
      type: 'text',
      defaultValue: 'AI-generated insights are guidance for reflection and training.',
    },
    {
      name: 'copyrightLine',
      type: 'text',
      defaultValue: '© 2026 StumpNote',
      admin: { description: 'No legal entity named until the owner confirms it.' },
    },
    {
      name: 'motionDefault',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto (respect OS setting)', value: 'auto' },
        { label: 'Reduced', value: 'reduced' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
