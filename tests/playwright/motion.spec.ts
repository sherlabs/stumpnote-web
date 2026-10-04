import { expect, test } from '@playwright/test'

const reduced = (name: string) => name === 'reduced-motion'

test('data-motion reflects the OS setting', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute(
    'data-motion',
    reduced(info.project.name) ? 'off' : 'on',
  )
})

test('reduced motion: no WebGL canvas, no smooth scroll, final static states', async ({
  page,
}, info) => {
  test.skip(!reduced(info.project.name), 'reduced-motion project only')
  await page.goto('/lab')
  await page.waitForTimeout(1500)
  expect(await page.locator('canvas').count()).toBe(0)
  await expect(page.locator('[data-hero-rings]').first()).toHaveAttribute(
    'data-hero-rings',
    'static',
  )
  expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(
    false,
  )

  // transcript fully visible: no word is dimmed (body words text-body, beats text)
  const colors = await page.evaluate(() => ({
    words: [
      ...new Set(
        [...document.querySelectorAll('.kt-w:not(.kt-beat)')].map((w) => getComputedStyle(w).color),
      ),
    ],
    beats: [
      ...new Set([...document.querySelectorAll('.kt-beat')].map((w) => getComputedStyle(w).color)),
    ],
  }))
  expect(colors.words).toEqual(['rgb(201, 208, 214)'])
  expect(colors.beats).toEqual(['rgb(242, 245, 244)'])

  // charts fully drawn, reveal targets fully visible
  const drawn = await page.evaluate(() =>
    [...document.querySelectorAll<SVGElement>('[data-reveal-style="draw"]')].every(
      (n) => parseFloat(getComputedStyle(n).strokeDashoffset) === 0,
    ),
  )
  expect(drawn).toBe(true)
  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
        (n) => parseFloat(getComputedStyle(n).opacity) < 0.05,
      ).length,
  )
  expect(hidden).toBe(0)

  // no pinned/sticky stage rules apply to chapters without the pinned prop, and nothing is animating
  const animating = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (a) =>
            a.playState === 'running' &&
            !(a.effect as KeyframeEffect)?.target?.closest?.('.ambient-rings'),
        ).length,
  )
  expect(animating).toBe(0)
})

test('motion on: heat cells reveal when scrolled into view', async ({ page }, info) => {
  test.skip(reduced(info.project.name), 'motion projects only')
  await page.goto('/lab')
  const cell = page.locator('.heat-cell').first()
  await expect(cell).toHaveAttribute('data-reveal', 'idle')
  await cell.scrollIntoViewIfNeeded()
  await expect(cell).toHaveAttribute('data-reveal', 'in')
  await expect
    .poll(async () => parseFloat(await cell.evaluate((n) => getComputedStyle(n).opacity)))
    .toBe(1)
})

test('lenis: active on fine pointers with motion, absent on touch and with reduced motion', async ({
  page,
  isMobile,
}, info) => {
  await page.goto('/')
  await page.waitForTimeout(2500)
  const active = await page.evaluate(() => document.documentElement.classList.contains('lenis'))
  expect(active).toBe(!isMobile && !reduced(info.project.name))
})

test('lenis sanity: anchor links, PageDown and programmatic scrolling still work', async ({
  page,
  isMobile,
}, info) => {
  test.skip(isMobile || reduced(info.project.name), 'desktop with motion only')
  await page.goto('/lab')
  await page.waitForTimeout(2500)
  await page.getByRole('link', { name: 'Signature' }).click()
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Math.abs(document.getElementById('signature')!.getBoundingClientRect().top),
        ),
      { timeout: 8000 },
    )
    .toBeLessThan(200)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.locator('body').click({ position: { x: 5, y: 300 } })
  const before = await page.evaluate(() => window.scrollY)
  await page.keyboard.press('PageDown')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 200)
  // find-in-page and focus both use native programmatic scrolling (let the PageDown glide settle first)
  await page.waitForTimeout(1500)
  await page.evaluate(() => document.querySelector('[data-lab="squad"]')!.scrollIntoView())
  await expect
    .poll(() =>
      page.evaluate(
        () => document.querySelector('[data-lab="squad"]')!.getBoundingClientRect().top,
      ),
    )
    .toBeLessThan(300)
})

test('no horizontal overflow at 320, 375, 768, 1024, 1440', async ({ page }) => {
  for (const w of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width: w, height: 800 })
    for (const path of ['/', '/lab']) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `${path} at ${w}`).toBeLessThanOrEqual(0)
    }
  }
})
