import type { Field } from 'payload'

/** Signature components a chapter (or, in S4, a feature page) can render. `learn-stage` is the pinned "How it learns" stage. */
export const DEMO_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Voice note typer', value: 'voice-typer' },
  { label: 'Quick-log strip (game day)', value: 'quick-log' },
  { label: 'Pitch-map heat grid', value: 'heat-grid' },
  { label: 'Kinetic transcript (mind)', value: 'kinetic-transcript' },
  { label: 'Series chart (body)', value: 'series-chart' },
  { label: 'Squad grid (team)', value: 'squad-grid' },
  { label: 'M brush stroke', value: 'm-stroke' },
  { label: 'How it learns (pinned stage, uses Steps)', value: 'learn-stage' },
] as const

export const PERSONA_OPTIONS = [
  { label: 'Page default', value: 'inherit' },
  { label: 'Player (teal)', value: 'player' },
  { label: 'Coach (orange)', value: 'coach' },
  { label: 'Parent (rose)', value: 'parent' },
  { label: 'Team (lime)', value: 'team' },
] as const

/** The only status labels allowed on the site (docs/spec/05-content-brief.md section 1). */
export const STATUS_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Available now (web)', value: 'available-web' },
  { label: 'In the beta', value: 'in-beta' },
  { label: 'Preview', value: 'preview' },
  { label: 'Coming soon', value: 'coming-soon' },
] as const

/** Small label + URL pair. URL is a site path (/features) or a full URL. */
export const linkGroup = (name: string, label?: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { name: 'label', type: 'text' },
    { name: 'url', type: 'text', admin: { description: 'Path (/features) or full URL.' } },
  ],
})
