'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { track } from '@/lib/track'
import type { TrackEvent } from '@/lib/track'

/** One delegated listener: any element with data-track="<event>" fires that event (server components stay server). */
export function TrackClicks() {
  const pathname = usePathname()
  // One-shot "viewed" events: any element with data-track-view fires once when it first scrolls into view on this route.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-track-view]')
    if (!els.length) return
    const fire = (el: HTMLElement) => {
      const name = el.dataset.trackView as TrackEvent | undefined
      if (!name) return
      const slug = el.dataset.trackSlug
      track(name, slug ? { slug } : undefined)
    }
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach(fire)
      return
    }
    const watched = new Map<Element, HTMLElement>()
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue
        io.unobserve(en.target)
        const marker = watched.get(en.target)
        if (marker) fire(marker)
      }
    })
    els.forEach((el) => {
      // Hidden markers have no box: watch their parent instead.
      const target = el.hidden ? (el.parentElement ?? el) : el
      watched.set(target, el)
      io.observe(target)
    })
    return () => io.disconnect()
  }, [pathname])
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
