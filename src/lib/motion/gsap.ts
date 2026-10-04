'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

let registered = false

/** Register GSAP plugins exactly once. Import this module only from code that is itself lazy-loaded. */
export function registerGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText)
    registered = true
  }
  return { gsap, ScrollTrigger, SplitText }
}

export { gsap, ScrollTrigger, SplitText }
