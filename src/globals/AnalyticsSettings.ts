import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

export const AnalyticsSettings: GlobalConfig = {
  slug: 'analytics-settings',
  access: { read: isAdmin, update: isAdmin },
  admin: { description: 'Admin analytics configuration. No secrets are stored here (env only).' },
  fields: [
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'PostHog', value: 'posthog' },
        { label: 'Plausible', value: 'plausible' },
        { label: 'Nouance plugin', value: 'nouance-plugin' },
      ],
    },
    {
      name: 'defaultRange',
      type: 'select',
      defaultValue: '30d',
      options: ['7d', '30d', '90d'].map((value) => ({ label: value, value })),
    },
    { name: 'fixturesBanner', type: 'checkbox', defaultValue: true },
    {
      name: 'monthlyBudgetUsd',
      type: 'number',
      min: 0,
      admin: {
        description:
          'Monthly AI budget in USD for the AI-spend view (over-pace state). Entered by an admin; never seeded.',
      },
    },
  ],
}
