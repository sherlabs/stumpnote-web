'use client'

import dynamic from 'next/dynamic'

// GSAP/Lenis never enter the initial bundle: the island is client-only and loads after idle.
const LenisRoot = dynamic(() => import('./LenisRoot'), { ssr: false })

export function MotionRoot() {
  return <LenisRoot />
}
