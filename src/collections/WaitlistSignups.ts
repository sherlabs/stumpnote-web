import type { CollectionConfig } from 'payload'
import { isAdmin, nobody } from '@/access'

/**
 * Rows are created only by the waitlist server action (Local API, overrideAccess) after
 * honeypot, validation and rate limiting. REST/GraphQL create is denied for everyone so the
 * public API cannot be used to spam or read the collection.
 */
export const WaitlistSignups: CollectionConfig = {
  slug: 'waitlist-signups',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'persona', 'createdAt'] },
  access: { create: nobody, read: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    {
      name: 'persona',
      type: 'select',
      options: ['player', 'captain', 'coach', 'parent', 'other'].map((value) => ({
        label: value[0].toUpperCase() + value.slice(1),
        value,
      })),
    },
    { name: 'consent', type: 'checkbox', required: true },
    {
      name: 'consentText',
      type: 'text',
      required: true,
      admin: { description: 'Exact consent line shown to the visitor.' },
    },
    {
      name: 'source',
      type: 'text',
      admin: { description: 'Page path the form was submitted from.' },
    },
    // Optional ipHash (HMAC-SHA256 with a server secret, truncated) is decided in S3-09; never a plain hash.
  ],
}
