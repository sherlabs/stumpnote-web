import 'server-only'
import { homeSeed } from '@/seed/pages/home'
import type { HomeSeed } from '@/seed/pages/home'
import type { BetaAccess as BetaAccessDoc, Page } from '@/payload-types'
import { getPayloadOrNull } from './payload'

export type BetaState = {
  state: 'waitlist' | 'testflight' | 'appstore'
  waitlistEnabled: boolean
  testflightUrl?: string
  appStorePlayerUrl?: string
  consentText: string
  successMessage: string
  comingSoonLine: string
}

/**
 * Consent sentence stored with every signup. DRAFT wording, flagged for legal review in the admin (Beta access
 * global). The form itself stays off until the owner enables it (waitlistEnabled).
 */
export const DEFAULT_CONSENT_TEXT =
  'I agree that StumpNote may store my email address to contact me about the beta.'

export const DEFAULT_BETA: BetaState = {
  state: 'waitlist',
  waitlistEnabled: false,
  consentText: DEFAULT_CONSENT_TEXT,
  successMessage: 'Thanks. You are on the list.',
  comingSoonLine: 'iPhone apps are in TestFlight beta and coming to the App Store.',
}

function toBetaState(doc: Partial<BetaAccessDoc> | null | undefined): BetaState {
  if (!doc) return DEFAULT_BETA
  return {
    state: doc.state ?? DEFAULT_BETA.state,
    waitlistEnabled: Boolean(doc.waitlistEnabled),
    testflightUrl: doc.testflightUrl || undefined,
    appStorePlayerUrl: doc.appStoreUrl?.player || undefined,
    consentText: doc.waitlistConsentText || DEFAULT_CONSENT_TEXT,
    successMessage: doc.waitlistSuccessMessage || DEFAULT_BETA.successMessage,
    comingSoonLine: doc.comingSoonLine || DEFAULT_BETA.comingSoonLine,
  }
}

export type HomeContent = {
  page: HomeSeed | Page
  beta: BetaState
  /** Approved + consented testimonials only. Empty means the block renders nothing. */
  testimonials: Array<{ id: string; quote: string; attribution: string; role?: string }>
  source: 'cms' | 'fallback'
}

const fallback: HomeContent = {
  page: homeSeed,
  beta: DEFAULT_BETA,
  testimonials: [],
  source: 'fallback',
}

/** Reads the `home` page, beta state and approved testimonials. Any failure returns the code fallback. */
export async function getHomeContent(): Promise<HomeContent> {
  const payload = await getPayloadOrNull()
  if (!payload) return fallback
  try {
    const [pages, beta, testimonials] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: { slug: { equals: 'home' } },
        depth: 1,
        limit: 1,
        pagination: false,
      }),
      payload.findGlobal({ slug: 'beta-access' }),
      payload
        .find({
          collection: 'testimonials',
          where: { approved: { equals: true } },
          limit: 3,
          depth: 0,
        })
        .catch(() => ({ docs: [] as Array<Record<string, unknown>> })),
    ])
    const page = pages.docs[0]
    if (!page || !page.layout?.length) return { ...fallback, beta: toBetaState(beta) }
    return {
      page,
      beta: toBetaState(beta),
      testimonials: (testimonials.docs as Array<Record<string, unknown>>)
        .filter((t) => t.consentGiven === true && typeof t.quote === 'string')
        .map((t) => ({
          id: String(t.id),
          quote: t.quote as string,
          attribution: String(t.attribution ?? ''),
          role: typeof t.role === 'string' ? t.role : undefined,
        })),
      source: 'cms',
    }
  } catch {
    return fallback
  }
}

/** Beta state alone (used by the waitlist action to re-check the gate server-side). */
export async function getBetaState(): Promise<BetaState> {
  const payload = await getPayloadOrNull()
  if (!payload) return DEFAULT_BETA
  try {
    return toBetaState(await payload.findGlobal({ slug: 'beta-access' }))
  } catch {
    return DEFAULT_BETA
  }
}
