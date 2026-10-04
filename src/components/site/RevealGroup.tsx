'use client'

import type { ReactNode } from 'react'
import { useReveal } from '@/lib/motion/useReveal'

/** Container that flips its [data-reveal] descendants to "in" once it scrolls into view. Server children stay server. */
export function RevealGroup({
  as = 'div',
  className,
  children,
  threshold,
}: {
  as?: 'div' | 'ul' | 'ol'
  className?: string
  children: ReactNode
  threshold?: number
}) {
  const { ref } = useReveal<HTMLDivElement>(threshold)
  const Tag = as as 'div'
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
