'use client'

import { usePersona } from './PersonaProvider'
import type { Persona } from '@/lib/site-config'
import { cn } from '@/lib/cn'

const CHIPS: Array<{ id: Persona; label: string; dot: string }> = [
  { id: 'player', label: 'Player', dot: 'bg-player' },
  { id: 'team', label: 'Captain', dot: 'bg-team' },
  { id: 'coach', label: 'Coach', dot: 'bg-coach' },
  { id: 'parent', label: 'Parent', dot: 'bg-parent' },
]

/** Neutral chips (selected = brighter, never accent-filled). Picking one re-themes the whole page via data-persona. */
export function PersonaChips({ className }: { className?: string }) {
  const { persona, setPersona } = usePersona()
  return (
    <div role="group" aria-label="See StumpNote as" className={cn('flex flex-wrap gap-2', className)}>
      {CHIPS.map((c) => {
        const on = persona === c.id
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => setPersona(c.id)}
            className={cn(
              'inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-[var(--dur-1)]',
              on
                ? 'border-[var(--hairline-3)] bg-[var(--hairline-2)] text-text'
                : 'border-[var(--hairline-2)] text-muted hover:border-[var(--hairline-3)] hover:text-text',
            )}
          >
            <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', c.dot)} />
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
