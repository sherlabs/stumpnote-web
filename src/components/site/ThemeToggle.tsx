'use client'

import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

/** Dark is the default and the shipped theme (decision D-24). Used on /lab to review the optional light tokens. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'light'
      ? 'light'
      : 'dark',
  )
  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('sn-theme', next)
    } catch {
      /* storage unavailable */
    }
    setTheme(next)
  }
  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={theme === 'light'}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--hairline-3)] px-4 text-[14px] font-semibold text-text hover:bg-[var(--hairline-1)]"
    >
      {theme === 'dark' ? <Moon aria-hidden size={16} /> : <Sun aria-hidden size={16} />}
      Theme: {theme}
    </button>
  )
}
