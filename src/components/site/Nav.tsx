'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Logo } from './Logo'
import { joinBeta, openWebApp, primaryNav } from '@/lib/site-config'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

/** Neutral navigation (selected state is brighter text, never accent). The CTA is the one filled accent. */
export function Nav() {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const links = primaryNav.filter((n) => n.ready)
  const cta = joinBeta.ready ? joinBeta : { ...openWebApp, label: 'Web app' }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // <dialog>.showModal() gives a native focus trap, Escape to close and inert background.
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-2)]',
        scrolled
          ? 'border-[var(--hairline-2)] bg-[color-mix(in_oklab,var(--canvas)_78%,transparent)] backdrop-blur-xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => {
              const current = pathname === l.href || pathname.startsWith(l.href + '/')
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-full px-3.5 text-[15px] font-medium transition-colors duration-[var(--dur-1)] hover:text-text',
                      current ? 'text-text' : 'text-muted',
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button href={cta.href} variant="primary" className="hidden !min-h-10 !px-5 sm:inline-flex">
            {cta.label}
          </Button>
          <button
            ref={openerRef}
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--hairline-3)] text-text md:hidden"
          >
            <Menu aria-hidden size={20} />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClose={() => {
          setOpen(false)
          openerRef.current?.focus()
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false)
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-[color-mix(in_oklab,var(--canvas)_96%,transparent)] p-0 text-text backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="container-x flex h-[68px] items-center justify-between">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--hairline-3)]"
          >
            <X aria-hidden size={20} />
          </button>
        </div>
        <nav aria-label="Mobile" className="container-x pt-8">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-[var(--hairline-2)]">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="display-3 block py-5 transition-colors hover:text-accent-text"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button href={cta.href} className="mt-8 w-full" arrow>
            {cta.label}
          </Button>
        </nav>
      </dialog>
    </header>
  )
}
