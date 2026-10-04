// Static navigation fallback. Routes are listed with `ready` so links never point at pages that are not built yet:
// flip a flag when its stage ships (S4: product pages, S5: legal). The CMS `navigation` global replaces this in S4.
export const WEB_APP_URL = 'https://app.stumpnote.com'
export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'

export type NavItem = { label: string; href: string; ready: boolean }

export const primaryNav: NavItem[] = [
  { label: 'Features', href: '/features', ready: false },
  { label: 'Players', href: '/players', ready: false },
  { label: 'Coaches', href: '/coaches', ready: false },
  { label: 'Parents', href: '/parents', ready: false },
  { label: 'Pricing', href: '/pricing', ready: false },
]

export const footerColumns: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '/features', ready: false },
      { label: 'Pricing', href: '/pricing', ready: false },
      { label: 'Join the beta', href: '/join', ready: false },
      { label: 'Open the web app', href: WEB_APP_URL, ready: true },
    ],
  },
  {
    title: 'Personas',
    items: [
      { label: 'Players', href: '/players', ready: false },
      { label: 'Captains', href: '/captains', ready: false },
      { label: 'Coaches', href: '/coaches', ready: false },
      { label: 'Parents', href: '/parents', ready: false },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Security and privacy', href: '/security', ready: false },
      { label: 'Support', href: '/support', ready: false },
      { label: 'Blog', href: '/blog', ready: false },
      { label: 'Changelog', href: '/changelog', ready: false },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', href: '/privacy', ready: false },
      { label: 'Terms of Use', href: '/terms', ready: false },
      { label: 'Cookies', href: '/cookies', ready: false },
      { label: 'Account deletion', href: '/account-deletion', ready: false },
      { label: 'Apple standard EULA', href: APPLE_EULA_URL, ready: true },
    ],
  },
]

export const joinBeta: NavItem = { label: 'Join the beta', href: '/join', ready: false }
export const openWebApp: NavItem = { label: 'Open the web app', href: WEB_APP_URL, ready: true }

export const PERSONAS = ['player', 'coach', 'parent', 'team'] as const
export type Persona = (typeof PERSONAS)[number]
