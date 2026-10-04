/**
 * One-off: write the operator's real legal values into the `legal-values` global and publish privacy, terms and support.
 * The values file is never stored in this repo; point at it (the app repo's legal config, `git show` output or a path):
 *   LEGAL_VALUES_FILE=/path/to/legal_config.json SEED_ALLOW_REMOTE=1 pnpm payload run scripts/legal-values-apply.ts
 * Accepts either {"values": {...}} or a flat object. A page is published only when no placeholder remains for it
 * (cookies, account-deletion and data-safety keep their review markers and stay drafts). Review state stays "draft"
 * (not lawyer reviewed): the notes field records that the values are operator-prepared and not independently reviewed.
 * LEGAL_REVIEW_DONE is never set by this script. Idempotent: re-running changes nothing that is already published.
 */
import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '@payload-config'
import { substitute, type LegalValueMap } from '../src/lib/legal/render'
import { LEGAL_VALUE_KEYS } from '../src/globals/LegalValues'

const file = process.env.LEGAL_VALUES_FILE
if (!file) {
  console.error('Set LEGAL_VALUES_FILE to the JSON values file.')
  process.exit(1)
}
const host = (() => {
  try {
    return new URL(process.env.DATABASE_URI ?? '').hostname
  } catch {
    return ''
  }
})()
if (!['localhost', '127.0.0.1', '::1'].includes(host) && process.env.SEED_ALLOW_REMOTE !== '1') {
  console.error(`Refusing host "${host || 'unknown'}" without SEED_ALLOW_REMOTE=1.`)
  process.exit(1)
}

const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
const src = (raw.values && typeof raw.values === 'object' ? raw.values : raw) as Record<
  string,
  unknown
>
const values: Record<string, string> = {}
for (const k of LEGAL_VALUE_KEYS) {
  const v = src[k]
  if (typeof v === 'string' && v.trim()) values[k] = v.trim()
}

/** "4 October 2026" -> ISO at UTC midnight; undefined when it does not parse. */
function isoDate(s?: string): string | undefined {
  const m = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(s ?? '')
  if (!m) return undefined
  const mon = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ].indexOf(m[2].toLowerCase())
  return mon < 0 ? undefined : new Date(Date.UTC(+m[3], mon, +m[1])).toISOString()
}

const payload = await getPayload({ config })
try {
  await payload.updateGlobal({ slug: 'legal-values', data: values as never })
  console.log(
    `legal-values: set ${Object.keys(values).length} keys (${Object.keys(values).join(', ')})`,
  )

  for (const slug of ['privacy', 'terms', 'support']) {
    const r = await payload.find({
      collection: 'legal-pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
      pagination: false,
    })
    const doc = r.docs[0] as unknown as
      { id: number | string; body?: string; _status?: string } | undefined
    if (!doc) {
      console.log(`${slug}: no document (run the seed first)`)
      continue
    }
    const { remaining } = substitute(doc.body ?? '', values as LegalValueMap)
    if (remaining.length) {
      console.log(
        `${slug}: stays draft, placeholders remain: ${[...new Set(remaining)].join(', ')}`,
      )
      continue
    }
    if (doc._status === 'published') {
      console.log(`${slug}: already published`)
      continue
    }
    await payload.update({
      collection: 'legal-pages',
      id: doc.id,
      data: {
        effectiveDate: isoDate(values.EFFECTIVE_DATE),
        lastUpdated: isoDate(values.LAST_UPDATED),
        policyVersion: slug === 'support' ? undefined : values.POLICY_VERSION,
        reviewStatus: 'draft',
        notes: 'Operator-prepared, not independently reviewed (no lawyer review).',
        _status: 'published',
      } as never,
    })
    console.log(`${slug}: published`)
  }
} catch (e) {
  console.error(e)
  process.exit(1)
}
process.exit(0)
