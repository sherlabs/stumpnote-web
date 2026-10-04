import { describe, expect, it, vi } from 'vitest'
import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'
import {
  legalPolicyVersionRule,
  legalStrictGate,
  policyVersionError,
  strictGateError,
} from '@/hooks/legalPages'

const BODY = 'Contact {{PRIVACY_CONTACT_EMAIL}}. {{LEGAL_REVIEW: check}}'
const FULL = { PRIVACY_CONTACT_EMAIL: 'p@example.test', LEGAL_REVIEW_DONE: 'yes' }

describe('strict publish gate (pure)', () => {
  it('blocks publish with placeholders when strict', () => {
    const m = strictGateError({ strict: true, status: 'published', body: BODY, values: {} })
    expect(m).toMatch(/Cannot publish/)
    expect(m).toContain('{{PRIVACY_CONTACT_EMAIL}}')
  })
  it('allows drafts with placeholders', () => {
    expect(strictGateError({ strict: true, status: 'draft', body: BODY, values: {} })).toBeNull()
  })
  it('allows publish when not strict', () => {
    expect(
      strictGateError({ strict: false, status: 'published', body: BODY, values: {} }),
    ).toBeNull()
  })
  it('allows publish when everything is filled and reviewed', () => {
    expect(
      strictGateError({ strict: true, status: 'published', body: BODY, values: FULL }),
    ).toBeNull()
  })
  it('still blocks when values are filled but review markers are not cleared', () => {
    expect(
      strictGateError({
        strict: true,
        status: 'published',
        body: BODY,
        values: { PRIVACY_CONTACT_EMAIL: 'p@example.test' },
      }),
    ).toMatch(/LEGAL_REVIEW/)
  })
})

describe('strict publish gate (hook, LEGAL_STRICT=1)', () => {
  const run = async (data: Record<string, unknown>, values: Record<string, string>) => {
    const findGlobal = vi.fn().mockResolvedValue(values)
    return legalStrictGate({
      data,
      req: { payload: { findGlobal } },
    } as unknown as Parameters<CollectionBeforeValidateHook>[0])
  }
  it('rejects a published save with placeholders', async () => {
    vi.stubEnv('LEGAL_STRICT', '1')
    await expect(run({ _status: 'published', body: BODY }, {})).rejects.toThrow()
    vi.unstubAllEnvs()
  })
  it('accepts a draft save with placeholders', async () => {
    vi.stubEnv('LEGAL_STRICT', '1')
    await expect(run({ _status: 'draft', body: BODY }, {})).resolves.toBeTruthy()
    vi.unstubAllEnvs()
  })
  it('does not gate when LEGAL_STRICT is unset', async () => {
    vi.stubEnv('LEGAL_STRICT', '')
    await expect(run({ _status: 'published', body: BODY }, {})).resolves.toBeTruthy()
    vi.unstubAllEnvs()
  })
})

describe('policyVersion rule', () => {
  it('requires a version for privacy and terms on publish', () => {
    expect(policyVersionError({ slug: 'privacy', status: 'published', next: '' })).toMatch(
      /requires/,
    )
    expect(policyVersionError({ slug: 'terms', status: 'published', next: undefined })).toMatch(
      /requires/,
    )
  })
  it('rejects the same version as the latest published', () => {
    expect(
      policyVersionError({
        slug: 'privacy',
        status: 'published',
        next: '2030-01',
        lastPublished: '2030-01',
      }),
    ).toMatch(/already published/)
  })
  it('accepts a new version, drafts, and other slugs', () => {
    expect(
      policyVersionError({
        slug: 'privacy',
        status: 'published',
        next: '2030-02',
        lastPublished: '2030-01',
      }),
    ).toBeNull()
    expect(policyVersionError({ slug: 'privacy', status: 'draft', next: '' })).toBeNull()
    expect(policyVersionError({ slug: 'cookies', status: 'published', next: '' })).toBeNull()
  })

  const runHook = async (
    data: Record<string, unknown>,
    originalDoc: Record<string, unknown> | undefined,
    lastPublishedVersion: string | undefined,
  ) => {
    const findVersions = vi.fn().mockResolvedValue({
      docs: lastPublishedVersion ? [{ version: { policyVersion: lastPublishedVersion } }] : [],
    })
    const res = await legalPolicyVersionRule({
      data,
      originalDoc,
      req: { payload: { findVersions } },
    } as unknown as Parameters<CollectionBeforeChangeHook>[0])
    return { res, findVersions }
  }
  it('hook compares against the latest PUBLISHED version, not the current draft value', async () => {
    // The draft already carries "v2" (saved earlier); the last published version is "v1": publishing v2 is allowed.
    const { res, findVersions } = await runHook(
      { _status: 'published', slug: 'privacy', policyVersion: 'v2' },
      { id: 7, slug: 'privacy', policyVersion: 'v2', _status: 'draft' },
      'v1',
    )
    expect(res).toBeTruthy()
    const where = findVersions.mock.calls[0][0].where
    expect(JSON.stringify(where)).toContain('version._status')
  })
  it('hook rejects re-publishing the same version', async () => {
    await expect(
      runHook(
        { _status: 'published', slug: 'terms', policyVersion: 'v1' },
        { id: 3, slug: 'terms', policyVersion: 'v1' },
        'v1',
      ),
    ).rejects.toThrow()
  })
  it('hook allows the first publish (no previous version)', async () => {
    const { res } = await runHook(
      { _status: 'published', slug: 'privacy', policyVersion: 'v1' },
      undefined,
      undefined,
    )
    expect(res).toBeTruthy()
  })
})
