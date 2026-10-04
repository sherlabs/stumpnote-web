import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import {
  AuditLog,
  ChangelogEntries,
  Faqs,
  Features,
  LegalPages,
  Media,
  Pages,
  Personas,
  Posts,
  Testimonials,
  Users,
  WaitlistSignups,
} from './collections'
import {
  AnalyticsSettings,
  BetaAccess,
  LegalValues,
  Navigation,
  PriceScenarios,
  SiteSettings,
} from './globals'
import { richText } from './fields/richText'
import { serverURL } from './lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const origin = serverURL()
const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | StumpNote admin' },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: richText,
  db: postgresAdapter({
    // Pool is created lazily: a build without DATABASE_URI never connects.
    pool: { connectionString: process.env.DATABASE_URI, max: 1 },
    // Push is opt-in even locally so nobody mixes push and migrations.
    push: process.env.NODE_ENV === 'development' && process.env.PAYLOAD_PUSH === 'true',
    migrationDir: path.resolve(dirname, '../migrations'),
  }),
  collections: [
    Pages,
    Features,
    Personas,
    Posts,
    ChangelogEntries,
    Faqs,
    Testimonials,
    LegalPages,
    Media,
    Users,
    WaitlistSignups,
    AuditLog,
  ],
  globals: [SiteSettings, Navigation, BetaAccess, LegalValues, AnalyticsSettings, PriceScenarios],
  serverURL: origin,
  cors: [origin],
  csrf: [origin],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // No `jobs` and no `schedulePublish` (D-09): publish manually.
  email: emailEnabled
    ? resendAdapter({
        defaultFromAddress: process.env.EMAIL_FROM as string,
        defaultFromName: 'StumpNote',
        apiKey: process.env.RESEND_API_KEY as string,
      })
    : undefined,
  plugins: [
    redirectsPlugin({ collections: ['pages', 'posts'] }),
    seoPlugin({
      collections: ['pages', 'features', 'personas', 'posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title} | StumpNote` : 'StumpNote'),
      generateURL: ({ doc }) => (doc?.slug ? `${origin}/${doc.slug}` : origin),
    }),
    vercelBlobStorage({
      enabled: blobEnabled,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      clientUploads: true,
      addRandomSuffix: true,
    }),
  ],
})
