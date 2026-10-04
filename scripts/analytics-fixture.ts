/**
 * LOCAL TEST FIXTURE ONLY. Creates (or resets the roles/passwords of) four staff users for the admin analytics tests:
 * an admin, an editor, a viewer and a throttle-test admin. Passwords come from the environment so none is ever written in the repository:
 *   TEST_ADMIN_PASSWORD, TEST_EDITOR_PASSWORD, TEST_VIEWER_PASSWORD, TEST_THROTTLE_PASSWORD   (required)
 *   pnpm analytics:users              apply
 *   ANALYTICS_USERS=clear pnpm analytics:users   delete them
 * Refuses any non-localhost database.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const host = (() => {
  try {
    return new URL(process.env.DATABASE_URI ?? '').hostname
  } catch {
    return ''
  }
})()
if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.error(`analytics-fixture refuses non-local database host "${host}"`)
  process.exit(1)
}

const USERS = [
  { email: 'admin@analytics-fixture.test', role: 'admin', env: 'TEST_ADMIN_PASSWORD' },
  // One admin per Playwright project: the 30 views/min throttle is per user, and projects run in parallel.
  { email: 'admin-rm@analytics-fixture.test', role: 'admin', env: 'TEST_ADMIN_PASSWORD' },
  { email: 'admin-mobile@analytics-fixture.test', role: 'admin', env: 'TEST_ADMIN_PASSWORD' },
  { email: 'editor@analytics-fixture.test', role: 'editor', env: 'TEST_EDITOR_PASSWORD' },
  { email: 'viewer@analytics-fixture.test', role: 'viewer', env: 'TEST_VIEWER_PASSWORD' },
  // A fourth admin so the throttle test cannot slow down the other tests' sessions.
  { email: 'throttle@analytics-fixture.test', role: 'admin', env: 'TEST_THROTTLE_PASSWORD' },
] as const

const clear = process.env.ANALYTICS_USERS === 'clear'
const payload = await getPayload({ config })
try {
  for (const u of USERS) {
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: u.email } },
      limit: 1,
      overrideAccess: true,
    })
    const existing = found.docs[0]
    if (clear) {
      if (existing)
        await payload.delete({ collection: 'users', id: existing.id, overrideAccess: true })
      continue
    }
    const password = process.env[u.env]
    if (!password) throw new Error(`${u.env} is required`)
    // The first-user hook forces admin on the very first user and strips roles otherwise; set roles after create.
    if (existing) {
      await payload.update({
        collection: 'users',
        id: existing.id,
        data: { password, roles: [u.role] },
        overrideAccess: true,
      })
    } else {
      const created = await payload.create({
        collection: 'users',
        data: { email: u.email, password, roles: [u.role] },
        overrideAccess: true,
      })
      await payload.update({
        collection: 'users',
        id: created.id,
        data: { roles: [u.role] },
        overrideAccess: true,
      })
    }
  }
  console.log(clear ? 'analytics fixture users removed' : 'analytics fixture users ready')
} finally {
  await payload.db.destroy?.()
}
process.exit(0)
