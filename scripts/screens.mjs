// Headless screenshots against a running server: node scripts/screens.mjs <prefix> <path>...
// Output: docs/ops/screens/<prefix>-<name>-{1440,390}.png (needs `next start` running; BASE defaults to http://127.0.0.1:3100).
import { chromium } from '@playwright/test'
const [prefix, ...paths] = process.argv.slice(2)
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const browser = await chromium.launch()
for (const [w, h] of [
  [1440, 900],
  [390, 844],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const name = p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-')
    await page.screenshot({ path: `docs/ops/screens/${prefix}-${name}-${w}.png`, fullPage: false })
  }
  await ctx.close()
}
await browser.close()
