/* eslint-disable no-empty-pattern */
import { expect, test } from '@playwright/test'

// Snapshots are chromium-desktop only and captured with motion off (final states are deterministic).
test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'visual snapshots: chromium-desktop only')
})
test.use({ reducedMotion: 'reduce' })

const personas = ['player', 'coach', 'parent', 'team'] as const

async function open(
  page: import('@playwright/test').Page,
  persona: string,
  theme: 'dark' | 'light' = 'dark',
) {
  await page.goto('/lab')
  await page
    .getByRole('group', { name: 'Persona' })
    .getByRole('button', { name: persona, exact: true })
    .click()
  if (theme === 'light') await page.getByRole('button', { name: /Theme:/ }).click()
  await page.waitForTimeout(300)
}

for (const persona of personas) {
  test(`lab · ${persona} · dark`, async ({ page }) => {
    await open(page, persona)
    for (const id of ['mstroke-static', 'heat', 'entry-dots', 'squad', 'buttons']) {
      await expect(page.locator(`[data-lab="${id}"]`)).toHaveScreenshot(`${persona}-dark-${id}.png`)
    }
  })
}

test('lab · player · dark · the remaining signature components', async ({ page }) => {
  await open(page, 'player')
  for (const id of [
    'transcript',
    'voice',
    'series',
    'quicklog',
    'bails',
    'badges',
    'forms',
    'cards',
  ]) {
    await expect(page.locator(`[data-lab="${id}"]`)).toHaveScreenshot(`player-dark-${id}.png`)
  }
})

test('lab · player · light tokens (optional theme)', async ({ page }) => {
  await open(page, 'player', 'light')
  for (const id of ['buttons', 'heat', 'cards']) {
    await expect(page.locator(`[data-lab="${id}"]`)).toHaveScreenshot(`player-light-${id}.png`)
  }
})
