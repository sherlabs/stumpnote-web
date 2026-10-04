'use client'

import { useRef } from 'react'
import { MStroke } from '@/components/signature/MStroke'
import { useScrollProgress } from '@/lib/motion/useScrollProgress'

/** The M paints once more as the closing call to action scrolls in (scrub; complete when motion is off). */
export function CtaMark() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollProgress(ref, { from: 0.95, to: 0.55 })
  return (
    <div ref={ref} aria-hidden className="mx-auto w-[min(56%,300px)] lg:w-[min(100%,340px)]">
      <MStroke mode="scrub" />
    </div>
  )
}
