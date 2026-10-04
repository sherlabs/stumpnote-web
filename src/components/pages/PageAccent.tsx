'use client'

import { useLayoutEffect } from 'react'
import type { Persona } from '@/lib/site-config'

/**
 * Sets the page accent (`<html data-persona>`) for a route. The inline script runs during HTML parsing on a hard
 * load (no teal flash on /coaches); the layout effect covers client navigations and restores the default on leave.
 */
export function PageAccent({ persona }: { persona: Persona }) {
  useLayoutEffect(() => {
    const root = document.documentElement
    const prev = root.getAttribute('data-persona') ?? 'player'
    root.setAttribute('data-persona', persona)
    return () => root.setAttribute('data-persona', prev === persona ? 'player' : prev)
  }, [persona])
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.setAttribute('data-persona','${persona}')`,
      }}
    />
  )
}
