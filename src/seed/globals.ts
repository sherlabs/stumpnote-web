/**
 * Global defaults, seeded and also used as the code fallback. Navigation items mirror lib/site-config.ts; routes are
 * only rendered once their `ready` flag is true there (the deployed site never links to a 404).
 */
export const siteSettingsSeed = {
  siteName: 'StumpNote',
  tagline: 'Your cricket, remembered.',
  webAppUrl: 'https://app.stumpnote.com',
  showPricing: true,
  showTrialLine: false,
  footerDisclosure: 'AI-generated insights are guidance for reflection and training.',
  copyrightLine: '© 2026 StumpNote',
  motionDefault: 'auto' as 'auto' | 'reduced',
}

export const betaAccessSeed = {
  state: 'waitlist' as const,
  waitlistEnabled: false,
  waitlistConsentText:
    'I agree that StumpNote may store my email address to contact me about the beta.',
  waitlistSuccessMessage: 'Thanks. You are on the list.',
  comingSoonLine: 'iPhone apps are in TestFlight beta and coming to the App Store.',
}

export const navigationSeed = {
  headerItems: [
    { label: 'Features', url: '/features' },
    { label: 'Players', url: '/players' },
    { label: 'Coaches', url: '/coaches' },
    { label: 'Parents', url: '/parents' },
    { label: 'Pricing', url: '/pricing' },
  ],
  headerCta: { label: 'Join the beta', url: '/join' },
  footerColumns: [
    {
      heading: 'Product',
      items: [
        { label: 'Features', url: '/features' },
        { label: 'Pricing', url: '/pricing' },
        { label: 'Join the beta', url: '/join' },
        { label: 'Open the web app', url: 'https://app.stumpnote.com' },
      ],
    },
    {
      heading: 'Personas',
      items: [
        { label: 'Players', url: '/players' },
        { label: 'Captains', url: '/captains' },
        { label: 'Coaches', url: '/coaches' },
        { label: 'Parents', url: '/parents' },
      ],
    },
    {
      heading: 'Company',
      items: [
        { label: 'Security and privacy', url: '/security' },
        { label: 'Support', url: '/support' },
        { label: 'Blog', url: '/blog' },
        { label: 'Changelog', url: '/changelog' },
      ],
    },
  ],
  footerLegalItems: [
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms of Use', url: '/terms' },
    { label: 'Cookies', url: '/cookies' },
    { label: 'Account deletion', url: '/account-deletion' },
  ],
}
