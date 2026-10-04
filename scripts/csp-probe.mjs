// CSP probe: visits every route (desktop + mobile), scrolls the page, opens the mobile menu, and reports any Content
// Security Policy violation (enforced or report-only) plus page errors. Zero output lines = clean.
//   BASE=https://stumpnote-site.vercel.app node scripts/csp-probe.mjs
//   PROBE_ADMIN_EMAIL=... PROBE_ADMIN_PASSWORD=... BASE=http://127.0.0.1:3100 node scripts/csp-probe.mjs   (adds admin routes)
// Admin routes need a session: the credentials are for a LOCAL fixture database only (see scripts/analytics-fixture.ts).
import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const base = (process.env.BASE ?? 'http://127.0.0.1:3100').replace(/\/$/, '')
const routes = JSON.parse(readFileSync('tests/playwright/routes.json', 'utf8'))
const paths = [...routes.ok.filter((r) => !/\.(txt|xml)$/.test(r)), '/this-page-does-not-exist']
const email = process.env.PROBE_ADMIN_EMAIL
const password = process.env.PROBE_ADMIN_PASSWORD
const adminPaths = [
  '/admin',
  '/admin/collections/pages',
  '/admin/collections/features',
  '/admin/collections/legal-pages',
  '/admin/globals/legal-values',
  '/admin/globals/beta-access',
  '/admin/analytics/web',
  '/admin/analytics/ai-spend',
  '/admin/analytics/product',
  '/admin/account',
  '/admin/collections/users',
  '/admin/collections/media/create',
  '/admin/collections/changelog-entries',
  '/admin/collections/changelog-entries/create',
  '/admin/collections/waitlist-signups',
  '/admin/collections/audit-log',
  '/admin/globals/site-settings',
  '/admin/globals/navigation',
  '/admin/globals/price-scenarios',
]

const browser = await chromium.launch()
let bad = 0
const run = async (label, ctxOpts, list, mobile) => {
  const ctx = await browser.newContext(ctxOpts)
  if (list === adminPaths) {
    const res = await ctx.request.post(`${base}/api/users/login`, { data: { email, password } })
    if (!res.ok()) {
      console.log(`admin login failed: ${res.status()}`)
      process.exit(2)
    }
  }
  if (list === adminPaths) {
    // One edit screen per content collection (Live Preview iframe, rich-text editor, version tabs).
    for (const c of ['pages', 'features', 'personas', 'legal-pages']) {
      const r = await ctx.request.get(`${base}/api/${c}?limit=1&depth=0&draft=true`)
      const id = r.ok() ? (await r.json()).docs?.[0]?.id : undefined
      if (id !== undefined)
        list = [
          ...list,
          `/admin/collections/${c}/${id}`,
          `/next/preview/${c}/${(await (await ctx.request.get(`${base}/api/${c}/${id}?depth=0&draft=true`)).json()).slug ?? 'home'}`,
        ]
    }
  }
  console.log(`${label}: ${list.length} paths`)
  const page = await ctx.newPage()
  let current = ''
  const hit = (kind, text) => {
    if (/content security policy|refused to|\[report only\]/i.test(text) || kind === 'pageerror') {
      bad++
      console.log(`${label} ${current} ${kind}: ${text.slice(0, 220)}`)
    }
  }
  page.on('console', (m) => hit('console', m.text()))
  page.on('pageerror', (e) => hit('pageerror', String(e)))
  for (const p of list) {
    current = p
    await page.goto(base + p, { waitUntil: 'load' })
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
    })
    if (mobile && !p.startsWith('/admin')) {
      const btn = page.getByRole('button', { name: /menu/i }).first()
      if (await btn.count()) await btn.click().catch(() => {})
    }
    await page.waitForTimeout(600)
  }
  await ctx.close()
}
await run('desktop', { viewport: { width: 1440, height: 900 } }, paths, false)
await run(
  'mobile',
  { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  paths,
  true,
)
if (email && password)
  await run('admin', { viewport: { width: 1440, height: 900 } }, adminPaths, false)
await browser.close()
console.log(`csp-probe: ${bad} violation line(s) on ${base}`)
process.exit(bad ? 1 : 0)
