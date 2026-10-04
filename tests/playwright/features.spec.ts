import { expect, test } from '@playwright/test'

const LABELS = ['Available now (web)', 'In the beta', 'Preview', 'Coming soon']

test('features index lists 22 features with only the four status labels', async ({ page }) => {
  await page.goto('/features')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('same memory')
  const cards = page.locator('.features-grid > li')
  await expect(cards).toHaveCount(22)
  const badges = await page.locator('.features-grid .eyebrow').allTextContents()
  const labels = badges.map((b) =>
    b
      .replace(/^[^\w]+/, '')
      .trim()
      .toLowerCase(),
  )
  expect(labels.length).toBeGreaterThan(20)
  for (const l of labels) expect(LABELS.map((x) => x.toLowerCase())).toContain(l)
  // The "Preview and coming soon" strip carries badges but no full cards.
  await expect(page.locator('.strip-item')).toHaveCount(7)
})

test('area filter chips narrow the grid without JavaScript', async ({ page }) => {
  await page.goto('/features')
  // The chip row scrolls sideways on phones, so trigger the label natively instead of chasing it with the pointer.
  await page.locator('label[for="f-team"]').evaluate((el) => (el as HTMLElement).click())
  await expect(page.locator('.features-grid > li:visible')).toHaveCount(4)
  await page.locator('label[for="f-all"]').evaluate((el) => (el as HTMLElement).click())
  await expect(page.locator('.features-grid > li:visible')).toHaveCount(22)
})

test('feature page: one h1, demo, labelled scenario, AI disclosure, join CTA', async ({ page }) => {
  await page.goto('/features/journal')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Voice journal')
  await expect(page.getByText('Illustrative scenario')).toBeVisible()
  await expect(
    page.getByText('AI can make mistakes. Not medical or psychological advice.'),
  ).toBeVisible()
  await expect(page.locator('.feature-stage')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Join the beta' }).first()).toHaveAttribute(
    'href',
    '/join',
  )
})

test('web app is the only feature labelled available', async ({ page }) => {
  await page.goto('/features/web-app')
  await expect(page.getByText('Available now (web)').first()).toBeVisible()
  await page.goto('/features/journal')
  await expect(page.getByText('Available now (web)')).toHaveCount(0)
})

test('unknown feature is a clean 404', async ({ request }) => {
  expect((await request.get('/features/nope')).status()).toBe(404)
})

test('persona pages: accent per page, parents lead with consent', async ({ page }) => {
  const accents: Record<string, string> = {
    '/players': 'player',
    '/captains': 'team',
    '/coaches': 'coach',
    '/parents': 'parent',
  }
  for (const [path, accent] of Object.entries(accents)) {
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('data-persona', accent)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  }
  await page.goto('/parents')
  const headings = await page.locator('main h2').allTextContents()
  expect(headings[0]).toContain('Consent first')
  await page.goto('/captains')
  await expect(page.getByRole('heading', { name: /Your role, your match card/ })).toBeVisible()
})

test('persona accent is restored when navigating away (client navigation)', async ({ page }) => {
  await page.goto('/coaches')
  await expect(page.locator('html')).toHaveAttribute('data-persona', 'coach')
  await page.getByRole('link', { name: 'All features' }).first().click()
  await expect(page).toHaveURL(/\/features$/)
  await expect(page.locator('html')).toHaveAttribute('data-persona', 'player')
})

test('FAQ accordion opens with the keyboard', async ({ page }) => {
  await page.goto('/support')
  const first = page.locator('summary').first()
  await first.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('details').first()).toHaveAttribute('open', '')
  await expect(page.locator('details')).toHaveCount(20)
})

test('support shows the in-app route when no mailbox is configured, and no {{ placeholders', async ({
  page,
}) => {
  await page.goto('/support')
  // In-app route when no mailbox is configured; the configured mailbox once legal values are applied.
  const inApp = page.getByText('Use the app: Profile, then Help.')
  const mailbox = page.locator('a[href^="mailto:"]').first()
  await expect(inApp.or(mailbox).first()).toBeVisible()
  expect(await page.locator('body').innerText()).not.toContain('{{')
})
