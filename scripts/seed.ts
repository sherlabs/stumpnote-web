/**
 * Idempotent content seed. Run through Payload's script runner so the config and path aliases load:
 *   pnpm seed:dry                       print what would change, write nothing
 *   pnpm seed                           create everything that is missing (existing documents are left alone)
 *   SEED_ONLY=features,faqs pnpm seed   narrow the targets (pages,features,faqs,personas,legal,globals)
 *   SEED_FORCE=1 pnpm seed              also overwrite existing documents with the seed copy
 *   SEED_DELETE=1 pnpm seed             delete the seeded documents (by slug); globals are never deleted
 * Re-running changes nothing: a document that exists is skipped (so editors' changes in the admin survive), and
 * globals only fill fields that are still blank. Local only by default: a non-localhost database needs
 * SEED_ALLOW_REMOTE=1 (production seeding is a deliberate manual step, docs/spec/03-cms-model.md section 6; export the
 * URL for that one command, never save it).
 */
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '@payload-config'
import { faqAnswer, faqSeeds } from '../src/seed/data/faqs'
import { featureSeeds } from '../src/seed/data/features'
import { personaSeeds } from '../src/seed/data/personas'
import { betaAccessSeed, navigationSeed, siteSettingsSeed } from '../src/seed/globals'
import { homeSeed } from '../src/seed/pages/home'
import { contentPageSeeds } from '../src/seed/pages/content-pages'
import { LEGAL_SLUG_LIST, legalSeed } from '../src/seed/legal'

// `payload run` strips CLI flags from process.argv, so options come from environment variables.
const truthy = (v?: string) => v === '1' || v === 'true'
const only = (process.env.SEED_ONLY ?? 'pages,features,faqs,personas,legal,globals').split(',')
const dryRun = truthy(process.env.SEED_DRY_RUN)
const force = truthy(process.env.SEED_FORCE)
const del = truthy(process.env.SEED_DELETE)
const allowRemote = truthy(process.env.SEED_ALLOW_REMOTE)

const counts = { created: 0, skipped: 0, updated: 0, deleted: 0 }

function host(): string {
  try {
    return new URL(process.env.DATABASE_URI ?? '').hostname
  } catch {
    return ''
  }
}

type Coll = 'pages' | 'features' | 'faqs' | 'personas' | 'legal-pages'

async function find(payload: Payload, collection: Coll, slug: string) {
  const r = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
    pagination: false,
  })
  return r.docs[0] as { id: number | string } | undefined
}

/** Create when missing; skip when present unless SEED_FORCE; delete with SEED_DELETE. Returns the doc id (if any). */
async function upsert(
  payload: Payload,
  collection: Coll,
  slug: string,
  data: Record<string, unknown>,
  status: 'published' | 'draft' = 'published',
): Promise<number | string | undefined> {
  const existing = await find(payload, collection, slug)
  const label = `${collection}/${slug}`
  if (del) {
    if (existing) {
      console.log(`${label}: delete id=${existing.id}`)
      counts.deleted++
      if (!dryRun) await payload.delete({ collection, id: existing.id })
    }
    return undefined
  }
  const payloadData = { ...data, slug, _status: status }
  if (!existing) {
    console.log(`${label}: create`)
    counts.created++
    if (dryRun) return undefined
    const doc = await payload.create({ collection, data: payloadData as never })
    return doc.id
  }
  if (!force) {
    counts.skipped++
    return existing.id
  }
  console.log(`${label}: update id=${existing.id}`)
  counts.updated++
  if (!dryRun) await payload.update({ collection, id: existing.id, data: payloadData as never })
  return existing.id
}

const isBlank = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.values(v).every(isBlank))

/** Globals fill blanks only: a value an editor already set is never overwritten (unless SEED_FORCE). */
async function seedGlobal(
  payload: Payload,
  slug: 'site-settings' | 'navigation' | 'beta-access',
  desired: Record<string, unknown>,
) {
  if (del) return
  const current = (await payload.findGlobal({ slug })) as unknown as Record<string, unknown>
  const patch: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(desired)) {
    // Booleans with schema defaults (showPricing...) and "state" are never blank, so only blank text/arrays fill.
    if (force || isBlank(current[k])) patch[k] = v
  }
  if (Object.keys(patch).length === 0) {
    counts.skipped++
    return
  }
  console.log(`globals/${slug}: fill ${Object.keys(patch).join(', ')}`)
  counts.updated++
  if (!dryRun) await payload.updateGlobal({ slug, data: patch as never })
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
  console.log(
    `seed: host=${h} dryRun=${dryRun} force=${force} delete=${del} only=${only.join(',')}`,
  )
  const payload = await getPayload({ config })

  // 1. FAQs (no relations)
  const faqId: Record<string, number | string | undefined> = {}
  if (only.includes('faqs') || only.includes('personas')) {
    for (const f of faqSeeds) {
      if (!only.includes('faqs')) {
        faqId[f.slug] = (await find(payload, 'faqs', f.slug))?.id
        continue
      }
      faqId[f.slug] = await upsert(payload, 'faqs', f.slug, {
        question: f.question,
        answer: faqAnswer(f),
        category: f.category,
        personas: f.personas,
        order: f.order,
      })
    }
  }

  // 2. Features, then a second pass for `related` (self relation needs every id)
  const featureId: Record<string, number | string | undefined> = {}
  if (only.includes('features') || only.includes('personas')) {
    for (const f of featureSeeds) {
      if (!only.includes('features')) {
        featureId[f.slug] = (await find(payload, 'features', f.slug))?.id
        continue
      }
      const {
        slug,
        title,
        area,
        status,
        benefit,
        bullets,
        howItWorks,
        scenario,
        demo,
        personas,
        order,
      } = f
      featureId[slug] = await upsert(payload, 'features', slug, {
        title,
        area,
        status,
        benefit,
        bullets: bullets.map((text) => ({ text })),
        howItWorks,
        scenario,
        copyRules: f.copyRules,
        demo,
        personas,
        order,
        comingSoonTeaser: f.comingSoonTeaser,
      })
    }
    if (only.includes('features') && !del && !dryRun) {
      for (const f of featureSeeds) {
        const id = featureId[f.slug]
        if (id === undefined) continue
        const doc = (await payload.findByID({
          collection: 'features',
          id,
          depth: 0,
          draft: true,
        })) as {
          related?: unknown[] | null
        }
        if ((doc.related?.length ?? 0) > 0 && !force) continue
        const related = f.related.map((s) => featureId[s]).filter((x) => x !== undefined)
        if (related.length === 0) continue
        console.log(`features/${f.slug}: link related (${f.related.join(', ')})`)
        await payload.update({ collection: 'features', id, data: { related: related as never } })
      }
    }
  }

  // 3. Personas (reference features and FAQs by id)
  if (only.includes('personas')) {
    for (const p of personaSeeds) {
      await upsert(payload, 'personas', p.slug, {
        title: p.title,
        eyebrow: p.eyebrow,
        accent: p.accent,
        headline: p.headline,
        subcopy: p.subcopy,
        leadWith: p.leadWith,
        proofPoints: p.proofPoints.map((text) => ({ text })),
        lead: p.lead,
        featureBlocks: p.featureBlocks.map((s) => featureId[s]).filter((x) => x !== undefined),
        faqs: p.faqs.map((s) => faqId[s]).filter((x) => x !== undefined),
        meta: { title: p.metaTitle, description: p.metaDescription },
      })
    }
  }

  // 4. Pages: home + the four content pages
  if (only.includes('pages')) {
    await upsert(payload, 'pages', homeSeed.slug, {
      title: homeSeed.title,
      persona: homeSeed.persona,
      hero: homeSeed.hero,
      layout: homeSeed.layout,
    })
    for (const p of contentPageSeeds) {
      await upsert(payload, 'pages', p.slug, {
        title: p.title,
        persona: p.persona,
        hero: p.hero,
        layout: p.layout,
        meta: { title: p.metaTitle, description: p.metaDescription },
      })
    }
  }

  // 5. Legal pages: DRAFTS only (the placeholder bodies are never published by the seed; notice mode serves the same text from code)
  if (only.includes('legal')) {
    for (const slug of LEGAL_SLUG_LIST) {
      const l = legalSeed(slug)
      await upsert(
        payload,
        'legal-pages',
        slug,
        { title: l.title, body: l.body, reviewStatus: 'draft' },
        'draft',
      )
    }
  }

  // 6. Globals (fill blanks only)
  if (only.includes('globals')) {
    await seedGlobal(payload, 'site-settings', siteSettingsSeed)
    await seedGlobal(payload, 'navigation', navigationSeed)
    await seedGlobal(payload, 'beta-access', betaAccessSeed)
  }

  console.log(
    `seed: done. created=${counts.created} updated=${counts.updated} skipped=${counts.skipped} deleted=${counts.deleted}`,
  )
  process.exit(0)
}

// Top-level await: `payload run` exits when the module finishes evaluating.
try {
  await main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
