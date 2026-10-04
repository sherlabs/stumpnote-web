/** Canonical origin without a trailing slash. Never throws (safe at build time with no env). */
export const serverURL = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return 'http://localhost:3000'
}
