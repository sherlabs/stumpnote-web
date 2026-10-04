import type { Persona } from '@/lib/site-config'

/** Props shared by every signature component. Each one renders a complete static state without JS or motion. */
export type SignatureProps = {
  /** Force the static final state (the /lab "motion off" control and tests). */
  reducedMotion?: boolean
  /** Scope a persona accent to this component (otherwise it inherits the page persona). */
  persona?: Persona
  /** Deterministic data seed for generated content. */
  seed?: number
  className?: string
}

/** Deterministic PRNG (mulberry32): generated demo data never changes between server and client renders. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const staticAttr = (reducedMotion?: boolean) => (reducedMotion ? { 'data-static': '' } : {})
