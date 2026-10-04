import { expect, test } from '@playwright/test'

test('every plan and add-on card carries the indicative line', async ({ page }) => {
  await page.goto('/pricing')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const cards = page.locator('.plan-card, .addon-card')
  await expect(cards).toHaveCount(6)
  for (let i = 0; i < 6; i++) await expect(cards.nth(i)).toContainText('Indicative price')
  await expect(page.locator('.indicative-line')).toContainText(
    'Final prices are shown in your local currency in the app before you subscribe',
  )
})

test('uses "Pro Player", shows the free tier, and has no buy or subscribe control', async ({
  page,
}) => {
  await page.goto('/pricing')
  await expect(page.getByRole('heading', { name: 'Pro Player', level: 3 })).toBeVisible()
  await expect(page.getByText('Players Pro')).toHaveCount(0)
  const controls = await page.locator('main a, main button').allInnerTexts()
  for (const t of controls) expect(t).not.toMatch(/buy|subscribe|purchase/i)
  await expect(page.getByText('Free tier works for real: 4 entries a month.')).toBeVisible()
})

test('comparison table has real headers and a keyboard-scrollable region', async ({ page }) => {
  await page.goto('/pricing')
  await expect(page.locator('table th[scope="col"]')).toHaveCount(5)
  await expect(page.locator('table tbody th[scope="row"]').first()).toBeVisible()
  await expect(page.getByRole('region', { name: 'Plan comparison table' })).toHaveAttribute(
    'tabindex',
    '0',
  )
})

test('trial line stays off by default and links to Apple EULA', async ({ page }) => {
  await page.goto('/pricing')
  await expect(page.getByText('90-day trial')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Apple standard EULA' }).first()).toHaveAttribute(
    'href',
    /apple\.com/,
  )
})
