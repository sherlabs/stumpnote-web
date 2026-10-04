'use client'

import { useEffect } from 'react'
import { track } from '@/lib/track'
import type { TrackEvent } from '@/lib/track'

/** One delegated listener: any element with data-track="<event>" fires that event (server components stay server). */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-track]')
      const name = el?.getAttribute('data-track') as TrackEvent | null
      if (!el || !name) return
      track(name, {
        href: el.getAttribute('href') ?? '',
        label: (el.textContent ?? '').trim().slice(0, 60),
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
