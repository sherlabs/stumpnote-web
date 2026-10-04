import localFont from 'next/font/local'

// Self-hosted Latin subsets (see public/fonts/README.md). Metrics-adjusted fallbacks avoid layout shift.
export const archivo = localFont({
  src: '../../public/fonts/Archivo-Variable.woff2',
  weight: '500 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-archivo',
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'sans-serif'],
})

export const hanken = localFont({
  src: '../../public/fonts/HankenGrotesk-Variable.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-hanken',
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'sans-serif'],
})
