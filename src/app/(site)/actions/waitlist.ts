'use server'

import { headers } from 'next/headers'
import { getBetaState } from '@/lib/cms/home'
import { getPayloadOrNull } from '@/lib/cms/payload'

export type WaitlistState = {
  ok?: boolean
  message?: string
  errors?: { email?: string; consent?: string; form?: string }
  values?: { email?: string; persona?: string }
}

const PERSONAS = ['player', 'captain', 'coach', 'parent', 'other'] as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Best-effort, per server instance (no storage of IPs, nothing persisted): 5 attempts per 10 minutes.
const hits = new Map<string, number[]>()
function limited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 2000) hits.clear()
  return recent.length > 5
}

/**
 * Waitlist signup. Re-checks the beta-access gate on the server (the form is only rendered when it is on, but the
 * action is a public endpoint), validates, honeypots, then writes through the Local API with overrideAccess because
 * the collection denies REST/GraphQL create for everyone. A duplicate email answers success without saying so.
 */
export async function joinWaitlist(_prev: WaitlistState, form: FormData): Promise<WaitlistState> {
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase()
  const persona = String(form.get('persona') ?? '')
  const consent = form.get('consent') === 'on'
  const values = { email, persona }

  // Honeypot: bots fill the hidden field. Answer success so they learn nothing.
  if (String(form.get('website') ?? '').trim() !== '') return { ok: true, values }

  const errors: NonNullable<WaitlistState['errors']> = {}
  if (!EMAIL.test(email) || email.length > 254) errors.email = 'Enter a valid email address.'
  if (!consent) errors.consent = 'Please tick the box to agree before you continue.'
  if (errors.email || errors.consent) return { errors, values }

  const beta = await getBetaState()
  if (!beta.waitlistEnabled) {
    return { errors: { form: 'Beta sign-up is not open yet.' }, values }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (limited(ip)) {
    return { errors: { form: 'Too many attempts. Please try again in a few minutes.' }, values }
  }

  const payload = await getPayloadOrNull()
  if (!payload) return { errors: { form: 'Something went wrong. Please try again later.' }, values }

  try {
    await payload.create({
      collection: 'waitlist-signups',
      overrideAccess: true,
      data: {
        email,
        persona: (PERSONAS as readonly string[]).includes(persona)
          ? (persona as (typeof PERSONAS)[number])
          : undefined,
        consent: true,
        consentText: beta.consentText,
        source: '/',
      },
    })
  } catch (err) {
    const text =
      err instanceof Error
        ? `${err.message} ${JSON.stringify((err as { data?: unknown }).data ?? '')}`
        : ''
    // Unique-email violation: already on the list. Same answer as a new signup.
    if (!/unique|already|duplicate|value must be unique/i.test(text)) {
      return { errors: { form: 'Something went wrong. Please try again later.' }, values }
    }
  }
  return { ok: true, message: beta.successMessage, values }
}
