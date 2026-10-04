import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

/**
 * The 16 keys (15 text values + the LEGAL_REVIEW_DONE select) used by the legal pages (docs/spec/06-legal-pages.md section 4).
 * Ships empty: values are proposed to the owner in S5 and never invented.
 */
export const LEGAL_VALUE_KEYS = [
  'COMPANY_LEGAL_NAME',
  'COMPANY_ABN',
  'COMPANY_ADDRESS',
  'PRIVACY_CONTACT_EMAIL',
  'SUPPORT_EMAIL',
  'GOVERNING_LAW',
  'EFFECTIVE_DATE',
  'LAST_UPDATED',
  'POLICY_VERSION',
  'RETENTION_PERIOD',
  'BACKUP_PURGE_DAYS',
  'USAGE_LOG_RETENTION',
  'DELETE_ACCOUNT_PATH',
  'LEGAL_REVIEW',
  'DPO_OR_REPRESENTATIVE',
] as const

export const LegalValues: GlobalConfig = {
  slug: 'legal-values',
  access: { read: () => true, update: isAdmin },
  admin: { description: 'Legal placeholder values. Empty values stay visible as notices on the site.' },
  fields: [
    ...LEGAL_VALUE_KEYS.map((name) =>
      name === 'DELETE_ACCOUNT_PATH'
        ? { name, type: 'text' as const, defaultValue: 'Profile, then Delete account' }
        : { name, type: 'text' as const },
    ),
    {
      name: 'LEGAL_REVIEW_DONE',
      type: 'select' as const,
      defaultValue: '',
      options: [
        { label: 'Not reviewed', value: '' },
        { label: 'Reviewed (yes)', value: 'yes' },
      ],
    },
  ],
}
