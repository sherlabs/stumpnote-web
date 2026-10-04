'use client'

import { useReducedMotion, setMotionEnabled } from '@/lib/motion/useReducedMotion'
import { track } from '@/lib/track'

/** Footer "Motion: on/off". Mirrors the OS setting and persists the visitor's choice. */
export function MotionToggle({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  return (
    <button
      type="button"
      aria-pressed={!reduced}
      onClick={() => {
        setMotionEnabled(reduced)
        track('motion_toggle', { enabled: reduced })
      }}
      className={
        className ??
        'inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--hairline-3)] px-4 text-[14px] font-semibold text-text hover:bg-[var(--hairline-1)]'
      }
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${reduced ? 'bg-tertiary' : 'bg-accent'}`}
      />
      Motion: {reduced ? 'off' : 'on'}
    </button>
  )
}
