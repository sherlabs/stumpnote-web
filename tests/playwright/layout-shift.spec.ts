import { expect, test } from '@playwright/test'

// Cumulative layout shift while scrolling the whole home page (shifts right after input are excluded, like CLS).
test('home: layout shift stays under 0.05 while scrolling', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as { __cls: number }).__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as Array<{
        value: number
        hadRecentInput: boolean
      }>) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6)
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    await new Promise((r) => setTimeout(r, 600))
  })
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
  expect(cls).toBeLessThan(0.05)
})
