'use client'

import { registerGsap } from './gsap'

/** The two standard motion conditions (docs/spec/02-design.md section 6). */
export const MOTION_CONDITIONS = {
  pinned: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  simple: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const

type Setup = (ctx: { pinned: boolean; simple: boolean; reduce: boolean }) => void | (() => void)

/**
 * Create ScrollTriggers/tweens inside gsap.matchMedia so they are reverted when a condition stops matching.
 * Returns a cleanup function. Honors html[data-motion='off'] (footer toggle) by treating it as `reduce`.
 */
export function motionMatchMedia(setup: Setup): () => void {
  const { gsap } = registerGsap()
  const off = document.documentElement.getAttribute('data-motion') === 'off'
  const mm = gsap.matchMedia()
  mm.add(MOTION_CONDITIONS, (ctx) => {
    const c = ctx.conditions as { pinned: boolean; simple: boolean; reduce: boolean }
    return setup(off ? { pinned: false, simple: false, reduce: true } : c)
  })
  return () => mm.revert()
}
