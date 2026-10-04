'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Flip data-reveal from 'idle' to 'in' on every [data-reveal] element inside the ref'd container when it
 * enters the viewport. SSR markup carries data-reveal="idle" (visible unless html[data-motion='on'], see
 * globals.css), so there is no flash. `replay()` resets to idle and re-observes (used by /lab).
 */
export function useReveal<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [run, setRun] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.querySelectorAll<HTMLElement>('[data-reveal]').forEach(
            (n) => (n.dataset.reveal = 'in'),
          )
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, run])
  const replay = useCallback(() => {
    ref.current
      ?.querySelectorAll<HTMLElement>('[data-reveal]')
      .forEach((n) => (n.dataset.reveal = 'idle'))
    // next frame so the idle state paints before the observer flips it back
    requestAnimationFrame(() => requestAnimationFrame(() => setRun((n) => n + 1)))
  }, [])
  return { ref, replay }
}
