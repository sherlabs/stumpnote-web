import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

const base =
  'group/btn relative inline-flex min-h-11 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-[15px] font-semibold tracking-[-0.005em] transition-[transform,background-color,border-color,color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-out)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  // The one filled accent element per screen. Label is canvas (>= 4.6:1 on every accent fill).
  primary:
    'bg-accent text-canvas shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_70%,white)_inset,0_10px_30px_-10px_var(--accent)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_55%,white)_inset,0_16px_36px_-10px_var(--accent)]',
  secondary:
    'border border-[var(--hairline-3)] bg-transparent text-text hover:border-[color-mix(in_oklab,var(--text)_40%,transparent)] hover:bg-[var(--hairline-1)]',
  ghost: 'bg-transparent text-text hover:bg-[var(--hairline-2)]',
}

type CommonProps = {
  variant?: Variant
  arrow?: boolean
  children: ReactNode
  className?: string
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string }

function isExternal(href: string) {
  return /^https?:\/\//.test(href)
}

/** Three variants, 44px target. Renders an anchor when `href` is given. */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', arrow, children, className } = props
  const classes = cn(base, variants[variant], className)
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden
          size={16}
          strokeWidth={2.25}
          className="transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)] group-hover/btn:translate-x-0.5"
        />
      )}
    </>
  )
  if (typeof props.href === 'string') {
    const {
      href,
      variant: _v,
      arrow: _a,
      children: _c,
      className: _cn,
      ...rest
    } = props as LinkProps
    return isExternal(href) ? (
      <a href={href} className={classes} {...rest}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={classes} {...rest}>
        {inner}
      </Link>
    )
  }
  const { variant: _v, arrow: _a, children: _c, className: _cn, ...rest } = props as ButtonProps
  return (
    <button type="button" className={classes} {...rest}>
      {inner}
    </button>
  )
}
