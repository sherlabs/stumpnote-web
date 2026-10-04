'use client'

import { useEffect } from 'react'
import { whenIdle } from '@/lib/motion/idle'
import { startLenis } from '@/lib/motion/lenis'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

/** Mounts smooth scroll only for fine pointers with motion allowed; tears down when motion is turned off. */
export default function LenisRoot() {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    let stop: (() => void) | undefined
    let cancelled = false
    const cancelIdle = whenIdle(() => {
      startLenis().then((s) => {
        if (cancelled) s()
        else stop = s
      })
    })
    return () => {
      cancelled = true
      cancelIdle()
      stop?.()
    }
  }, [reduced])
  return null
}
