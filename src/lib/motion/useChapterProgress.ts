'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'
import { motionMatchMedia } from './matchMedia'
import { registerGsap } from './gsap'

/**
 * Scroll progress (0..1) of `trigger` crossing the viewport, reported to `onProgress`. Does nothing when motion is
 * off, so scrubbed stages stay in their static final state. Mount from a client component after idle.
 */
export function useChapterProgress(
  trigger: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  { start = 'top 80%', end = 'bottom 30%' }: { start?: string; end?: string } = {},
) {
  useEffect(() => {
    const el = trigger.current
    if (!el) return
    return motionMatchMedia(({ reduce }) => {
      if (reduce) return
      const { ScrollTrigger } = registerGsap()
      const st = ScrollTrigger.create({ trigger: el, start, end, onUpdate: (self) => onProgress(self.progress) })
      return () => st.kill()
    })
    // onProgress is intentionally excluded: callers pass a stable ref-writing function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, start, end])
}
