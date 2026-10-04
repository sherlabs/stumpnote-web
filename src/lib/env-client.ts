/** Origin for browser code: the page's own origin (Live Preview and the admin are same-origin). */
export const serverURLClient = (): string =>
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SERVER_URL ?? '')
