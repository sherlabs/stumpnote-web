// Navigation fallback (also the shape the CMS `navigation` global is mapped to). A link renders only when its route is
// built: add the route to READY_ROUTES when its stage ships (S4: product pages, S5: legal) so the deployed site never
// links to a 404. /blog and /changelog stay out until they have published content (decision D-41).
export const WEB_APP_URL = 'https://app.stumpnote.com'
export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'

export type NavItem = { label: string; href: string; ready: boolean }

/** Routes that exist and have content. Dynamic children (/features/<slug>) follow their index route. */
export const READY_ROUTES: readonly string[] = [
  '/features',
  '/players',
  '/captains',
  '/coaches',
  '/parents',
  '/pricing',
  '/security',
  '/join',
  '/support',
  // S5: legal routes. /data-safety exists but is not linked until the owner decides (S5-U3).
  '/legal',
  '/privacy',
  '/terms',
  '/cookies',
  '/account-deletion',
]

export function routeReady(href: string): boolean {
  if (/^https?:\/\//.test(href) || href.startsWith('#')) return true
  const path = href.split(/[?#]/)[0]
  if (READY_ROUTES.includes(path)) return true
  const parent = '/' + path.split('/').filter(Boolean)[0]
  return path !== parent && parent === '/features' && READY_ROUTES.includes(parent)
}

export const navItem = (label: string, href: string): NavItem => ({
  label,
  href,
  ready: routeReady(href),
})

export const primaryNav: NavItem[] = [
  navItem('Features', '/features'),
  navItem('Players', '/players'),
  navItem('Coaches', '/coaches'),
  navItem('Parents', '/parents'),
  navItem('Pricing', '/pricing'),
]

export const footerColumns: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Product',
    items: [
      navItem('Features', '/features'),
      navItem('Pricing', '/pricing'),
      navItem('Join the beta', '/join'),
      navItem('Open the web app', WEB_APP_URL),
    ],
  },
  {
    title: 'Personas',
    items: [
      navItem('Players', '/players'),
      navItem('Captains', '/captains'),
      navItem('Coaches', '/coaches'),
      navItem('Parents', '/parents'),
    ],
  },
  {
    title: 'Company',
    items: [
      navItem('Security and privacy', '/security'),
      navItem('Support', '/support'),
      navItem('Blog', '/blog'),
      navItem('Changelog', '/changelog'),
    ],
  },
  {
    title: 'Legal',
    items: [
      navItem('Privacy Policy', '/privacy'),
      navItem('Terms of Use', '/terms'),
      navItem('Cookies', '/cookies'),
      navItem('Account deletion', '/account-deletion'),
      navItem('Apple standard EULA', APPLE_EULA_URL),
    ],
  },
]

export const joinBeta: NavItem = navItem('Join the beta', '/join')
export const openWebApp: NavItem = navItem('Open the web app', WEB_APP_URL)

export const PERSONAS = ['player', 'coach', 'parent', 'team'] as const
export type Persona = (typeof PERSONAS)[number]

/** True when a link target may be rendered (see READY_ROUTES). */
export function isRouteReady(href: string): boolean {
  return routeReady(href)
}
