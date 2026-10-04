import type { BadgeLabel } from '@/components/ui/Badge'
import type { FeatureStatus } from '@/seed/data/features'

/** CMS status value to the public label (the only four labels allowed on the site). */
export const STATUS_LABEL: Record<FeatureStatus, BadgeLabel> = {
  'available-web': 'Available now (web)',
  'in-beta': 'In the beta',
  preview: 'Preview',
  'coming-soon': 'Coming soon',
}
