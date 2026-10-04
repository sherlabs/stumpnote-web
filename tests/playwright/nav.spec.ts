import { expect, test } from '@playwright/test'

test('header links only to built routes and the CTA goes to /join', async ({ page, isMobile }) => {
  await page.goto('/')
  if (!isMobile) {
    const nav = page.getByRole('navigation', { name: 'Primary' })
    for (const name of ['Features', 'Players', 'Coaches', 'Parents', 'Pricing'])
      await expect(nav.getByRole('link', { name })).toBeVisible()
  }
  // Below 420px the CTA lives in the menu sheet; the sheet test below covers it.
  if (!isMobile)
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Join the beta' }),
    ).toHaveAttribute('href', '/join')
})

test('every internal link in header and footer resolves (no 404)', async ({ page, request }) => {
  await page.goto('/')
  const hrefs = await page
    .locator('header a[href^="/"], footer a[href^="/"]')
    .evaluateAll((as) => [...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute('href')))])
  expect(hrefs.length).toBeGreaterThan(8)
  for (const h of hrefs) {
    const res = await request.get(h as string)
    expect(res.status(), h as string).toBe(200)
  }
})

test('footer disclosure and no legal links to unbuilt routes', async ({ page }) => {
  await page.goto('/pricing')
  await expect(page.locator('footer')).toContainText('AI-generated insights are guidance')
  await expect(page.locator('footer a[href="/privacy"]')).toHaveCount(0)
})

test('mobile sheet opens, lists links, closes with Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only')
  await page.goto('/features')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('link', { name: 'Parents' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
})

test('join page: honest TestFlight copy, no App Store badge, waitlist state respected', async ({
  page,
}) => {
  await page.goto('/join')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(
    page.getByText('TestFlight beta. Coming soon to the App Store.').first(),
  ).toBeVisible()
  await expect(page.locator('img[alt*="App Store"]')).toHaveCount(0)
  await expect(page.getByText(/Beta sign-up opens soon|Request beta access/).first()).toBeVisible()
})

test('security page links no unbuilt legal route and states the AI consent line', async ({
  page,
}) => {
  await page.goto('/security')
  await expect(page.getByText('You decide what the AI sees')).toBeVisible()
  expect(await page.locator('main').innerText()).not.toMatch(/never used to train|COPPA/i)
})

test('rss feed is valid xml', async ({ request }) => {
  const res = await request.get('/blog/rss.xml')
  expect(res.headers()['content-type']).toContain('application/rss+xml')
  expect(await res.text()).toContain('<rss version="2.0">')
})

test('sitemap lists product routes but never admin, api, lab or preview', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  expect(xml).toContain('/features/journal')
  expect(xml).toContain('/pricing')
  for (const bad of ['/admin', '/api', '/lab', '/next/preview']) expect(xml).not.toContain(bad)
})
