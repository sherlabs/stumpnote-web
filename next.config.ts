import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { analyticsCsp } from './src/lib/analytics-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

// Enforcing since S7 (zero violations on every route and in the admin, scripts/csp-probe.mjs). Dev stays report-only so HMR
// is never blocked. Rollback without a code change: set CSP_REPORT_ONLY=1 in Vercel and redeploy (decisions D-61).
const cspHeader =
  isDev || process.env.CSP_REPORT_ONLY === '1'
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy'

// Web-analytics hosts are appended only once a provider is chosen AND configured (D-06, src/lib/analytics-config.ts).
const analyticsOrigins = analyticsCsp()
const analyticsConnect = analyticsOrigins.connect.join(' ')
const analyticsScript = analyticsOrigins.script.length
  ? ` ${analyticsOrigins.script.join(' ')}`
  : ''

const sitePolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${analyticsScript}`,
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
  experimental: { globalNotFound: true, inlineCss: true },
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
        headers: [...baseSecurityHeaders, { key: cspHeader, value: sitePolicy }],
      },
      {
        source: '/:section(admin|api|next)/:path*',
        headers: [
          ...baseSecurityHeaders,
          { key: cspHeader, value: adminPolicy },
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
