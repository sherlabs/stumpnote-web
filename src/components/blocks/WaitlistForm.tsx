'use client'

import { useActionState, useEffect, useRef } from 'react'
import { joinWaitlist } from '@/app/(site)/actions/waitlist'
import type { WaitlistState } from '@/app/(site)/actions/waitlist'
import { MStroke } from '@/components/signature/MStroke'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { track } from '@/lib/track'

const PERSONA_OPTIONS = [
  { value: 'player', label: 'Player' },
  { value: 'captain', label: 'Captain' },
  { value: 'coach', label: 'Coach' },
  { value: 'parent', label: 'Parent or guardian' },
  { value: 'other', label: 'Something else' },
]

/** Waitlist form (only rendered when Beta access has waitlistEnabled on). Errors are announced; success replaces the form. */
export function WaitlistForm({
  consentText,
  successMessage,
}: {
  consentText: string
  successMessage: string
}) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, {})
  const summary = useRef<HTMLDivElement>(null)
  const hasErrors = Boolean(state.errors && Object.keys(state.errors).length)

  useEffect(() => {
    if (state.ok) track('beta_form_submit', { ok: true })
    if (hasErrors) summary.current?.focus()
  }, [state, hasErrors])

  if (state.ok) {
    return (
      <div
        role="status"
        className="rounded-3 border border-[var(--hairline-3)] bg-[var(--hairline-1)] p-6"
      >
        <p className="title">{state.message || successMessage}</p>
      </div>
    )
  }

  return (
    <form action={action} noValidate className="flex w-full max-w-[520px] flex-col gap-5">
      <div ref={summary} tabIndex={-1} role="alert" aria-live="assertive" className="outline-none">
        {hasErrors && (
          <p className="rounded-2 border border-error p-3 text-[15px] text-error">
            {state.errors?.form ?? 'Please fix the highlighted fields.'}
          </p>
        )}
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />
      <Select
        label="I am a"
        name="persona"
        defaultValue={state.values?.persona || ''}
        placeholder="Choose (optional)"
        options={PERSONA_OPTIONS}
      />
      {/* Honeypot: invisible and unreachable for people; bots fill it. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Checkbox name="consent" label={consentText} error={state.errors?.consent} required />
      <Button type="submit" disabled={pending} aria-busy={pending} className="self-start">
        {pending && (
          <span className="w-5" aria-hidden>
            <MStroke mode="loop" />
          </span>
        )}
        {pending ? 'Sending' : 'Request beta access'}
      </Button>
    </form>
  )
}
