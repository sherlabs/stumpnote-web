import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

// Web-analytics ingest host is appended once a provider is chosen (D-06).
const analyticsConnect = [process.env.NEXT_PUBLIC_POSTHOG_HOST].filter(Boolean).join(' ')

const sitePolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.public.blob.vercel-storage.com`,
  `font-src 'self'`,
  `connect-src 'self' ${analyticsConnect}`.trim(),
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ')

// Payload admin needs more latitude (inline styles/scripts, eval in dev, Live Preview framing).
const adminPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.public.blob.vercel-storage.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.public.blob.vercel-storage.com https://vercel.com`,
  `frame-src 'self'`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ')

const baseSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
]

const noIndex = { key: 'X-Robots-Tag', value: 'noindex, nofollow' }

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Unmatched URLs render src/app/global-not-found.tsx (the app has several root layouts, so no single one applies).
  experimental: { globalNotFound: true },
  // Next 16.3 appends an agent-rules block to CLAUDE.md on `next dev`; this repo owns its CLAUDE.md.
  agentRules: false,
  poweredByHeader: false,
  images: {
    // Brand assets live in /public; CMS images come from Vercel Blob (already WebP-sized by Payload).
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  async headers() {
    return [
      {
        // Site: everything except admin, api and preview.
        source: '/((?!admin|api|next).*)',
        headers: [
          ...baseSecurityHeaders,
          // Report-Only until S7 flips it to enforcing once clean.
          { key: 'Content-Security-Policy-Report-Only', value: sitePolicy },
        ],
      },
      {
        source: '/:section(admin|api|next)/:path*',
        headers: [
          ...baseSecurityHeaders,
          { key: 'Content-Security-Policy-Report-Only', value: adminPolicy },
          { key: 'Cache-Control', value: 'no-store' },
          noIndex,
        ],
      },
      { source: '/lab', headers: [noIndex] },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
