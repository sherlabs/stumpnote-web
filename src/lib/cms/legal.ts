import 'server-only'
import { isNoticeMode, renderLegal, type LegalRender, type LegalValueMap } from '@/lib/legal/render'
import { legalMeta, legalSeed, LEGAL_SLUG_LIST, type LegalSlug } from '@/seed/legal'
import { getPayloadOrNull } from './payload'

export type LegalDoc = {
  slug: LegalSlug
  title: string
  body: string
  effectiveDate?: string
  lastUpdated?: string
  policyVersion?: string
  source: 'cms' | 'fallback'
}

export type LegalVersionRow = {
  versionId: string
  policyVersion: string
  effectiveDate?: string
  lastUpdated?: string
  updatedAt: string
}

const fmt = (iso?: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const nonEmpty = (v: LegalValueMap): LegalValueMap =>
  Object.fromEntries(
    Object.entries(v).filter(([, x]) => typeof x === 'string' && x.trim() !== ''),
  ) as LegalValueMap

/** The Legal values global; {} when there is no database. Never invented. */
export async function getLegalValues(): Promise<LegalValueMap> {
  const payload = await getPayloadOrNull()
  if (!payload) return {}
  try {
    const g = (await payload.findGlobal({ slug: 'legal-values' })) as unknown as Record<
      string,
      unknown
    >
    return Object.fromEntries(
      Object.entries(g).filter(([, v]) => typeof v === 'string'),
    ) as LegalValueMap
  } catch {
    return {}
  }
}

type RawDoc = {
  slug: LegalSlug
  title: string
  body?: string | null
  effectiveDate?: string | null
  lastUpdated?: string | null
  policyVersion?: string | null
}

const toDoc = (d: RawDoc, source: LegalDoc['source']): LegalDoc => ({
  slug: d.slug,
  title: d.title,
  body: d.body ?? '',
  effectiveDate: d.effectiveDate ?? undefined,
  lastUpdated: d.lastUpdated ?? undefined,
  policyVersion: d.policyVersion ?? undefined,
  source,
})

/** The published CMS document, or the code seed (production without a database serves the seed in notice mode). */
export async function getLegalDoc(slug: LegalSlug, o?: { draft?: boolean }): Promise<LegalDoc> {
  const seed = (): LegalDoc => ({ ...legalSeed(slug), source: 'fallback' })
  const payload = await getPayloadOrNull()
  if (!payload) return seed()
  try {
    const r = await payload.find({
      collection: 'legal-pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      pagination: false,
      ...(o?.draft ? { draft: true, overrideAccess: true } : {}),
    })
    const d = r.docs[0]
    return d ? toDoc(d as unknown as RawDoc, 'cms') : seed()
  } catch {
    return seed()
  }
}

/** Dates and version of a document as placeholder values. Used to fill gaps only (global values win for the current page). */
const docValues = (
  d: Pick<LegalDoc, 'effectiveDate' | 'lastUpdated' | 'policyVersion'>,
): LegalValueMap =>
  nonEmpty({
    EFFECTIVE_DATE: fmt(d.effectiveDate),
    LAST_UPDATED: fmt(d.lastUpdated),
    POLICY_VERSION: d.policyVersion ?? '',
  })

export type LegalView = { doc: LegalDoc; values: LegalValueMap; render: LegalRender }

/** The page state: document + effective values + render result. Same function feeds routes and sitemap. */
export async function getLegalView(slug: LegalSlug, o?: { draft?: boolean }): Promise<LegalView> {
  const [doc, global] = await Promise.all([getLegalDoc(slug, o), getLegalValues()])
  const values: LegalValueMap = { ...docValues(doc), ...nonEmpty(global) }
  return { doc, values, render: renderLegal(doc.body, values) }
}

/** Published prior versions (CMS only; the seed has no history). Newest first. */
export async function getLegalVersions(slug: LegalSlug): Promise<LegalVersionRow[]> {
  const payload = await getPayloadOrNull()
  if (!payload || !legalMeta[slug].versioned) return []
  try {
    const page = await payload.find({
      collection: 'legal-pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      pagination: false,
    })
    const id = page.docs[0]?.id
    if (id === undefined) return []
    const r = await payload.findVersions({
      collection: 'legal-pages',
      where: { and: [{ parent: { equals: id } }, { 'version._status': { equals: 'published' } }] },
      sort: '-updatedAt',
      limit: 50,
      depth: 0,
      pagination: false,
    })
    const rows = r.docs
      .map((v) => {
        const ver = v.version as unknown as RawDoc
        return {
          versionId: String(v.id),
          policyVersion: ver.policyVersion ?? '',
          effectiveDate: ver.effectiveDate ?? undefined,
          lastUpdated: ver.lastUpdated ?? undefined,
          updatedAt: v.updatedAt,
        }
      })
      .filter((v) => v.policyVersion)
    // newest published row per policyVersion only (a version is immutable, so older duplicates are noise)
    const seen = new Set<string>()
    return rows.filter((v) =>
      seen.has(v.policyVersion) ? false : (seen.add(v.policyVersion), true),
    )
  } catch {
    return []
  }
}

/** Exactly one published version by its policyVersion, rendered with the current legal values and that version's own dates. */
export async function getLegalVersionView(
  slug: LegalSlug,
  policyVersion: string,
): Promise<LegalView | null> {
  const payload = await getPayloadOrNull()
  if (!payload || !legalMeta[slug].versioned) return null
  try {
    const page = await payload.find({
      collection: 'legal-pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      pagination: false,
    })
    const id = page.docs[0]?.id
    if (id === undefined) return null
    const r = await payload.findVersions({
      collection: 'legal-pages',
      where: {
        and: [
          { parent: { equals: id } },
          { 'version._status': { equals: 'published' } },
          { 'version.policyVersion': { equals: policyVersion } },
        ],
      },
      sort: '-updatedAt',
      limit: 1,
      depth: 0,
    })
    const v = r.docs[0]
    if (!v) return null
    const doc = toDoc({ ...(v.version as unknown as RawDoc), slug }, 'cms')
    const global = await getLegalValues()
    const values: LegalValueMap = { ...nonEmpty(global), ...docValues(doc) }
    return { doc, values, render: renderLegal(doc.body, values) }
  } catch {
    return null
  }
}

/** Slugs whose route renders the full page (not notice mode): the only legal pages the sitemap may list. */
export async function getIndexableLegalSlugs(): Promise<LegalSlug[]> {
  const values = await getLegalValues()
  const out: LegalSlug[] = []
  for (const slug of LEGAL_SLUG_LIST) {
    if (slug === 'support') continue // /support is a product page; it is always indexable
    const doc = await getLegalDoc(slug)
    if (!isNoticeMode(doc.body, { ...docValues(doc), ...nonEmpty(values) })) out.push(slug)
  }
  return out
}
