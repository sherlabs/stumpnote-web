'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Persona } from '@/lib/site-config'

type Ctx = { persona: Persona; setPersona: (p: Persona) => void }
const PersonaContext = createContext<Ctx>({ persona: 'player', setPersona: () => {} })

/**
 * Persona re-theming: one attribute on <html> swaps --accent for the whole page (tokens.css).
 * SSR default is "player" (set in the root layout), so the provider never changes server output.
 */
export function PersonaProvider({
  children,
  initial = 'player',
}: {
  children: ReactNode
  initial?: Persona
}) {
  const [persona, setPersonaState] = useState<Persona>(initial)
  const setPersona = useCallback((p: Persona) => {
    document.documentElement.setAttribute('data-persona', p)
    setPersonaState(p)
  }, [])
  const value = useMemo(() => ({ persona, setPersona }), [persona, setPersona])
  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
}

export const usePersona = () => useContext(PersonaContext)
