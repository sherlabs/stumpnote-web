/**
 * Idempotent content seed (upsert by slug). Run through Payload's script runner so the config and path aliases load:
 *   pnpm seed:dry            print what would change
 *   pnpm seed                upsert everything S3/S4 ship (SEED_ONLY=pages narrows it)
 * Local only by default: refuses a non-localhost database unless SEED_ALLOW_REMOTE=1 is set (production seeding is a
 * deliberate manual step, see docs/spec/03-cms-model.md section 6; export the URL for that one command, never save it).
 * S3 seeds the `home` page; S4 extends this file with features, personas, FAQs and the other pages.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { homeSeed } from '../src/seed/pages/home'

// `payload run` strips CLI flags from process.argv, so options come from environment variables:
//   SEED_DRY_RUN=1  SEED_ONLY=pages,features  SEED_ALLOW_REMOTE=1   (the pnpm scripts below set them)
const truthy = (v?: string) => v === '1' || v === 'true'
const only = (process.env.SEED_ONLY ?? 'pages').split(',')
const dryRun = truthy(process.env.SEED_DRY_RUN)
const allowRemote = truthy(process.env.SEED_ALLOW_REMOTE)

function host(): string {
  try {
    return new URL(process.env.DATABASE_URI ?? '').hostname
  } catch {
    return ''
  }
}

async function main() {
  const h = host()
  const local = ['localhost', '127.0.0.1', '::1'].includes(h)
  if (!local && !allowRemote) {
    console.error(
      `Refusing to seed host "${h || 'unknown'}". Set SEED_ALLOW_REMOTE=1 only for a deliberate production seed.`,
    )
    process.exit(1)
  }
  console.log(`seed: host=${h} dryRun=${dryRun} only=${only.join(',')}`)
  const payload = await getPayload({ config })

  if (only.includes('pages')) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: homeSeed.slug } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    const doc = existing.docs[0]
    console.log(`pages/home: ${doc ? `update id=${doc.id}` : 'create'}`)
    if (!dryRun) {
      const data = {
        title: homeSeed.title,
        slug: homeSeed.slug,
        persona: homeSeed.persona,
        hero: homeSeed.hero,
        layout: homeSeed.layout,
        _status: 'published' as const,
      }
      if (doc) await payload.update({ collection: 'pages', id: doc.id, data })
      else await payload.create({ collection: 'pages', data })
    }
  }
  console.log('seed: done')
  process.exit(0)
}

// Top-level await: `payload run` exits when the module finishes evaluating.
try {
  await main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
