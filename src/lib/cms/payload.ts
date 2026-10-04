import 'server-only'
import type { Payload } from 'payload'

/**
 * Local API handle, or null when there is no database configured. The public site must render without one
 * (DB-free build, DB-free deploy), so every CMS read goes through this and falls back to code content.
 */
export async function getPayloadOrNull(): Promise<Payload | null> {
  if (!process.env.DATABASE_URI) return null
  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    return await getPayload({ config })
  } catch {
    return null
  }
}
