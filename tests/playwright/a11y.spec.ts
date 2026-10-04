import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import routes from './routes.json' with { type: 'json' }

const htmlRoutes = routes.ok.filter((r) => !/\.(txt|xml)$/.test(r))

for (const path of [...htmlRoutes, '/this-page-does-not-exist']) {
  test(`axe: no serious or critical violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    // reveal everything below the fold so axe sees the final DOM/colours
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo(0, 0)
    })
    // Feature pages and /lab open with live demos (typing, chips fading in): let it settle so axe sees the final colours.
    await page.waitForTimeout(path.startsWith('/features/') || path === '/lab' ? 4500 : 1800)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(
      bad.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 3)
            .join(' | ')}`,
      ),
    ).toEqual([])
  })
}

test('focus is visible on the first Tab (skip link) and on the next control', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const cs = getComputedStyle(el)
    return { style: cs.outlineStyle, width: cs.outlineWidth }
  })
  expect(outline.style).not.toBe('none')
  expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2)
})

// S5 pass: 400% zoom (a 320 CSS px viewport) on every public route. The light theme is not shipped in v1 (decision D-53),
// so there is no "both themes" run.
test.describe('zoom', () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'desktop project only')
  })

  test('no horizontal scroll at 320 px (400% zoom) on any route', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const path of htmlRoutes) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
})
