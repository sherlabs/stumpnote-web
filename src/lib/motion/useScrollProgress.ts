'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * GSAP-free scroll progress: writes a 0..1 value to the CSS custom property `--p` on the element while it is near the
 * viewport. 0 when its top reaches `from` (fraction of viewport height from the top), 1 when its bottom reaches `to`.
 * No React state, so scrolling never re-renders. Does nothing when motion is off: CSS defaults `--p` to the final state.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  { from = 0.85, to = 0.3 }: { from?: number; to?: number } = {},
) {
  const off = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || off) return
    let raf = 0
    let near = false
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * from
      const end = vh * to
      const total = r.height + (start - end)
      const p = total > 0 ? (start - r.top) / total : 1
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting
        if (near) {
          update()
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('resize', onScroll, { passive: true })
        } else {
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onScroll)
        }
      },
      { rootMargin: '25% 0px 25% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      el.style.removeProperty('--p')
    }
  }, [ref, off, from, to])
}
