import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  children: ReactNode
  interactive?: boolean
}

/** Raised surface with a hairline border. `interactive` adds a hover lift and a soft accent edge. */
export function Card({ as: Tag = 'div', children, className, interactive, ...rest }: Props) {
  return (
    <Tag
      className={cn(
        'relative rounded-3 border border-[var(--hairline-2)] bg-surface p-6 md:p-7',
        interactive &&
          'transition-[transform,border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)] hover:shadow-[0_24px_60px_-30px_var(--accent)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
