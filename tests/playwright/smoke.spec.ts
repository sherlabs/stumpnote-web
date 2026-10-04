import { expect, test } from '@playwright/test'
import routes from './routes.json' with { type: 'json' }

for (const path of routes.ok) {
  test(`GET ${path} returns 200`, async ({ request }) => {
    const res = await request.get(path)
    expect(res.status()).toBe(200)
  })
}

test('unknown route returns 404', async ({ request }) => {
  for (const path of routes.notFound) {
    const res = await request.get(path)
    expect(res.status()).toBe(404)
  }
})

test('home: wordmark, heading, link to the web app, no horizontal scroll', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your cricket, remembered')
  await expect(
    page.locator('main').getByRole('link', { name: 'Open the web app' }),
  ).toHaveAttribute('href', 'https://app.stumpnote.com')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('home: skip link is the first focusable element and targets main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toHaveAttribute('href', '#main')
  await expect(page.locator('main#main')).toHaveCount(1)
})

test('home: html declares language, dark theme and persona', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('lang', 'en')
  await expect(html).toHaveAttribute('data-theme', 'dark')
  await expect(html).toHaveAttribute('data-persona', 'player')
})

test('security headers on the site, noindex on /lab', async ({ request }) => {
  const home = await request.get('/')
  const h = home.headers()
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(h['content-security-policy-report-only']).toContain("frame-ancestors 'none'")
  const lab = await request.get('/lab')
  expect(lab.headers()['x-robots-tag']).toContain('noindex')
})

test('robots.txt disallows admin, api and lab', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text()
  for (const p of ['/admin', '/api', '/lab']) expect(body).toContain(`Disallow: ${p}`)
})

// Needs a database. The DB-free skeleton deploy answers 500 here by design (the public site is unaffected).
test('admin login page renders', async ({ request }) => {
  test.skip(
    !process.env.PLAYWRIGHT_WITH_DB,
    'set PLAYWRIGHT_WITH_DB=1 when a database is configured',
  )
  const res = await request.get('/admin')
  expect([200, 307, 302]).toContain(res.status())
})
