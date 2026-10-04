import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidate'
import { isAdmin } from '@/access'

export const BetaAccess: GlobalConfig = {
  slug: 'beta-access',
  access: { read: () => true, update: isAdmin },
  admin: {
    description: 'Drives every beta call to action. No App Store claims until the apps are live.',
  },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'state',
      type: 'select',
      required: true,
      defaultValue: 'waitlist',
      options: [
        { label: 'Waitlist', value: 'waitlist' },
        { label: 'TestFlight link', value: 'testflight' },
        { label: 'App Store', value: 'appstore' },
      ],
    },
    {
      name: 'waitlistEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Ships OFF. Turn on only once /privacy is live (not in notice mode) and a deletion/unsubscribe contact exists.',
      },
    },
    { name: 'testflightUrl', type: 'text' },
    {
      name: 'appStoreUrl',
      type: 'group',
      fields: [
        { name: 'player', type: 'text' },
        { name: 'coach', type: 'text' },
        { name: 'parent', type: 'text' },
      ],
    },
    {
      name: 'waitlistConsentText',
      type: 'text',
      admin: { description: 'The exact consent sentence stored with each signup.' },
    },
    { name: 'waitlistSuccessMessage', type: 'text' },
    {
      name: 'comingSoonLine',
      type: 'text',
      defaultValue: 'iPhone apps are in TestFlight beta and coming to the App Store.',
    },
  ],
}
