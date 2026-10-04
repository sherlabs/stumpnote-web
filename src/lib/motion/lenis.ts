'use client'

import type Lenis from 'lenis'

/**
 * Smooth scroll only for fine pointers (mouse/trackpad) with motion allowed. Touch keeps native scroll.
 * Lenis drives ScrollTrigger and rides GSAP's ticker so there is one animation loop.
 */
export async function startLenis(): Promise<() => void> {
  const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([
    import('lenis'),
    import('./gsap').then((m) => {
      m.registerGsap()
      return m
    }),
  ])
  const lenis: Lenis = new LenisCtor({
    anchors: true,
    lerp: 0.12,
    wheelMultiplier: 1,
    syncTouch: false,
  })
  const onTick = (t: number) => lenis.raf(t * 1000)
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(onTick)
    lenis.destroy()
  }
}
