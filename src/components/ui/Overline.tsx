import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Overline({
  children,
  as: Tag = 'p',
  accent,
  className,
}: {
  children: ReactNode
  as?: ElementType
  accent?: boolean
  className?: string
}) {
  return <Tag className={cn('eyebrow', accent && 'text-accent-text', className)}>{children}</Tag>
}
