/**
 * LOCAL TEST FIXTURE ONLY. Fills the Legal values global with SYNTHETIC values and publishes the six legal pages
 * (privacy and terms twice, to exercise version history) so the full-page path can be tested end to end.
 *   pnpm legal:fixture           apply
 *   LEGAL_FIXTURE=clear pnpm legal:fixture   remove (values emptied, legal pages deleted)
 * Refuses any non-localhost database. The values are not real and must never be entered in production.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { LEGAL_SLUG_LIST, legalSeed } from '../src/seed/legal'

const SYNTHETIC: Record<string, string> = {
  COMPANY_LEGAL_NAME: 'Fixture Co Pty Ltd',
  COMPANY_ABN: '00 000 000 000',
  COMPANY_ADDRESS: '1 Fixture Street, Testville',
  PRIVACY_CONTACT_EMAIL: 'privacy@example.test',
  SUPPORT_EMAIL: 'support@example.test',
  GOVERNING_LAW: 'Fixtureland',
  EFFECTIVE_DATE: '',
  LAST_UPDATED: '',
  POLICY_VERSION: '',
  RETENTION_PERIOD: 'within 30 days',
  BACKUP_PURGE_DAYS: '35',
  USAGE_LOG_RETENTION: '12 months',
  DELETE_ACCOUNT_PATH: 'Profile, then Delete account',
  LEGAL_REVIEW: '14 months',
  DPO_OR_REPRESENTATIVE: 'n/a',
  LEGAL_REVIEW_DONE: 'yes',
}

const host = (() => {
  try {
    return new URL(process.env.DATABASE_URI ?? '').hostname
  } catch {
    return ''
  }
})()
if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.error(`legal-fixture refuses non-local database host "${host}"`)
  process.exit(1)
}

const clear = process.env.LEGAL_FIXTURE === 'clear'
const payload = await getPayload({ config })

try {
  if (clear) {
    await payload.updateGlobal({
      slug: 'legal-values',
      data: Object.fromEntries(
        Object.keys(SYNTHETIC).map((k) => [
          k,
          k === 'DELETE_ACCOUNT_PATH' ? 'Profile, then Delete account' : '',
        ]),
      ) as never,
    })
    await payload.delete({ collection: 'legal-pages', where: { id: { exists: true } } })
    console.log('legal-fixture: cleared')
  } else {
    await payload.updateGlobal({ slug: 'legal-values', data: SYNTHETIC as never })
    await payload.delete({ collection: 'legal-pages', where: { id: { exists: true } } })
    for (const slug of LEGAL_SLUG_LIST) {
      const l = legalSeed(slug)
      const versioned = slug === 'privacy' || slug === 'terms'
      const doc = await payload.create({
        collection: 'legal-pages',
        data: {
          slug,
          title: l.title,
          body: l.body,
          effectiveDate: '2030-01-01T00:00:00.000Z',
          lastUpdated: '2030-01-02T00:00:00.000Z',
          policyVersion: versioned ? 'fixture-1' : undefined,
          reviewStatus: 'draft',
          _status: 'published',
        } as never,
      })
      if (versioned) {
        await payload.update({
          collection: 'legal-pages',
          id: doc.id,
          data: {
            body: `${l.body}\n\n## Fixture second version\n\nThis paragraph exists only in version two.\n`,
            policyVersion: 'fixture-2',
            effectiveDate: '2030-06-01T00:00:00.000Z',
            lastUpdated: '2030-06-02T00:00:00.000Z',
            _status: 'published',
          } as never,
        })
      }
    }
    console.log('legal-fixture: applied (synthetic values, 6 pages, privacy/terms x2 versions)')
  }
} catch (e) {
  console.error(e)
  process.exit(1)
}
process.exit(0)
