import { ValidationError } from 'payload'
import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'
import { substitute, type LegalValueMap } from '@/lib/legal/render'

/** Pure core of the strict publish gate (docs/spec/06-legal-pages.md section 2, rule 4). Returns an error message or null. */
export function strictGateError(opts: {
  strict: boolean
  status?: string | null
  body?: string | null
  values: LegalValueMap
}): string | null {
  if (!opts.strict || opts.status !== 'published') return null
  const { remaining } = substitute(opts.body ?? '', opts.values)
  if (remaining.length === 0) return null
  const shown = [...new Set(remaining)].slice(0, 6).join(', ')
  return (
    `Cannot publish: ${remaining.length} placeholder(s) remain (${shown}${remaining.length > 6 ? ', ...' : ''}). ` +
    'Fill the Legal values global (and clear review markers with LEGAL_REVIEW_DONE) or keep this page as a draft.'
  )
}

/** Pure core of the policyVersion rule for privacy and terms. Returns an error message or null. */
export function policyVersionError(opts: {
  slug?: string | null
  status?: string | null
  next?: string | null
  lastPublished?: string | null
}): string | null {
  if (opts.status !== 'published') return null
  if (opts.slug !== 'privacy' && opts.slug !== 'terms') return null
  const next = (opts.next ?? '').trim()
  if (!next) return 'Publishing the privacy policy or terms requires a policyVersion.'
  if (opts.lastPublished && opts.lastPublished.trim() === next) {
    return `policyVersion "${next}" is already published. A published version is immutable: use a new policyVersion for this change.`
  }
  return null
}

const readValues = async (req: Parameters<CollectionBeforeValidateHook>[0]['req']) => {
  try {
    return (await req.payload.findGlobal({
      slug: 'legal-values',
      overrideAccess: true,
    })) as unknown as LegalValueMap
  } catch {
    return {}
  }
}

/** Blocks publishing a legal page with unresolved placeholders when LEGAL_STRICT=1. Drafts always save. */
export const legalStrictGate: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data) return data
  const strict = process.env.LEGAL_STRICT === '1'
  if (!strict || data._status !== 'published') return data
  const message = strictGateError({
    strict,
    status: data._status,
    body: typeof data.body === 'string' ? data.body : '',
    values: await readValues(req),
  })
  if (message) {
    throw new ValidationError({
      errors: [{ message, path: 'body' }],
    })
  }
  return data
}

/** privacy and terms: policyVersion required on publish and different from the latest published version. */
export const legalPolicyVersionRule: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (data._status !== 'published') return data
  const slug = (data.slug ?? originalDoc?.slug) as string | undefined
  if (slug !== 'privacy' && slug !== 'terms') return data
  let lastPublished: string | null = null
  const id = originalDoc?.id
  if (id !== undefined && id !== null) {
    try {
      const prev = await req.payload.findVersions({
        collection: 'legal-pages',
        where: {
          and: [{ parent: { equals: id } }, { 'version._status': { equals: 'published' } }],
        },
        sort: '-updatedAt',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      lastPublished =
        (prev.docs[0]?.version as { policyVersion?: string } | undefined)?.policyVersion ?? null
    } catch {
      lastPublished = null
    }
  }
  const message = policyVersionError({
    slug,
    status: data._status,
    next: (data.policyVersion ?? originalDoc?.policyVersion) as string | undefined,
    lastPublished,
  })
  if (message) {
    throw new ValidationError({ errors: [{ message, path: 'policyVersion' }] })
  }
  return data
}
