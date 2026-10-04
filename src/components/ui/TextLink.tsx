import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children: ReactNode
  tone?: 'text' | 'muted'
}

/** Underline-on-hover link; external links get a diagonal arrow. Focus ring comes from the global style. */
export function TextLink({ href, children, className, tone = 'text', ...rest }: Props) {
  const external = /^https?:\/\//.test(href)
  const classes = cn(
    'group/link inline-flex items-center gap-1 underline decoration-[var(--hairline-3)] decoration-1 underline-offset-[5px] transition-[color,text-decoration-color] duration-[var(--dur-2)] hover:decoration-current',
    tone === 'text' ? 'text-text' : 'text-muted hover:text-text',
    className,
  )
  const content = (
    <>
      {children}
      {external && <ArrowUpRight aria-hidden size={14} strokeWidth={2.25} />}
    </>
  )
  return external ? (
    <a href={href} className={classes} {...rest}>
      {content}
    </a>
  ) : (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  )
}
