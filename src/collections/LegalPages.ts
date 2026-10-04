import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor } from '@/access'
import { publishedOnly } from '@/access'

/**
 * Versioned legal pages. Bodies are stored verbatim with {{KEY}} placeholders and
 * rendered in notice mode until real values are approved (docs/spec/06-legal-pages.md).
 * The strict publish gate, policy-version rules and /privacy/v/[version] arrive in S5.
 */
export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'reviewStatus', '_status', 'updatedAt'] },
  access: { read: publishedOnly, create: isEditor, update: isEditor, delete: isAdmin },
  versions: { drafts: { autosave: false }, maxPerDoc: 50 },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: ['privacy', 'terms', 'support', 'cookies', 'account-deletion', 'data-safety'].map(
        (value) => ({ label: value, value }),
      ),
    },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', admin: { description: 'Markdown with {{KEY}} placeholders, stored verbatim.' } },
    { name: 'effectiveDate', type: 'date' },
    { name: 'lastUpdated', type: 'date' },
    { name: 'policyVersion', type: 'text' },
    {
      name: 'reviewStatus',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Lawyer reviewed', value: 'lawyer-reviewed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'notes', type: 'textarea', admin: { description: 'Internal. Never rendered.' } },
  ],
}
