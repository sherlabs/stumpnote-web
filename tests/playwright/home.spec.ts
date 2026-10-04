import { expect, test } from '@playwright/test'

const reduced = (name: string) => name === 'reduced-motion'

const SECTION_HEADINGS = [
  'Most post-match thoughts are gone by Tuesday.',
  'Log once. Every feature knows.',
  'One account. Every role.',
  'Everything reads the same memory.',
  'Everything for match day in one place.',
  'A short spoken routine for the moment it matters.',
  'Wrist-based swing metrics, in preview.',
  'Plan for all eleven.',
  'Clear about your data.',
  'Join the beta',
]

test('home: the hero plus ten sections render in order', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your cricket, remembered.')
  const h2 = await page.locator('main h2').allInnerTexts()
  expect(h2.map((t) => t.replace(/\s+/g, ' ').trim())).toEqual(SECTION_HEADINGS)
})

test('home: the headline is real text, visible and painted before any canvas exists', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toBeVisible()
  const opacity = await h1.evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  // The shader mounts after idle; the static rings are the first thing in the box.
  await expect(page.locator('[data-hero-rings]').first()).toBeAttached()
})

test('home: headline wraps to at most 4 lines at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  const lines = await page.getByRole('heading', { level: 1 }).evaluate((el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight)
    return Math.round(el.getBoundingClientRect().height / lh)
  })
  expect(lines).toBeLessThanOrEqual(4)
})

test('home: persona tabs and hero chips re-theme the whole page', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-persona', 'player')
  await page.getByRole('tab', { name: 'Coach' }).click()
  await expect(html).toHaveAttribute('data-persona', 'coach')
  await expect(page.getByRole('tab', { name: 'Coach' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toContainText('Turn a voice memo into a session plan.')
  // accent really changes (registered colour property, crossfade finishes within ~300ms)
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      ),
    )
    .toMatch(/^(rgb\(253, 148, 35\)|#fd9423)$/i)
  // a hero chip drives the tab selection too
  await page
    .getByRole('group', { name: 'See StumpNote as' })
    .getByRole('button', { name: 'Parent' })
    .click()
  await expect(html).toHaveAttribute('data-persona', 'parent')
  await expect(page.getByRole('tab', { name: 'Parent / guardian' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('home: persona tabs follow the roving-tabindex arrow-key pattern', async ({ page }) => {
  await page.goto('/')
  const first = page.getByRole('tab', { name: 'Player' })
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Captain / vice' })).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('data-persona', 'team')
  await page.keyboard.press('Home')
  await expect(first).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('data-persona', 'player')
})

test('home: the Team chapter turns lime inside the chapter only', async ({ page }) => {
  await page.goto('/')
  const scope = page.locator('#team .chapter-scope')
  await scope.scrollIntoViewIfNeeded()
  const [scoped, root] = await Promise.all([
    scope.evaluate((el) => getComputedStyle(el).getPropertyValue('--accent').trim()),
    page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    ),
  ])
  expect(scoped).toMatch(/^(rgb\(137, 192, 18\)|#89c012)$/i)
  expect(root).not.toBe(scoped)
  await expect(page.locator('html')).toHaveAttribute('data-persona', 'player')
  // derived tokens are recomputed for the scope (not inherited from the page accent)
  const soft = await scope.evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--accent-soft').trim(),
  )
  const rootSoft = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim(),
  )
  expect(soft).not.toBe(rootSoft)
})

test('home: features carousel scrolls with the arrow keys and the buttons', async ({ page }) => {
  await page.goto('/')
  const region = page.getByRole('region', { name: 'Features' })
  await region.scrollIntoViewIfNeeded()
  await expect(region.locator('li')).toHaveCount(8)
  await region.focus()
  const before = await region.evaluate((el) => el.scrollLeft)
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before + 100)
  const mid = await region.evaluate((el) => el.scrollLeft)
  await page.getByRole('button', { name: 'Previous features' }).click()
  await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeLessThan(mid)
})

test('home: How it learns pins on desktop with motion and stacks everywhere else', async ({
  page,
  isMobile,
}, info) => {
  await page.goto('/')
  const pinned = page.locator('.learn-pinned')
  const inline = page.locator('.learn-inline').first()
  const stacked = isMobile || reduced(info.project.name)
  if (stacked) {
    await expect(pinned).toBeHidden()
    await expect(inline).toBeVisible()
    await expect(page.locator('.learn-step')).toHaveCount(4)
    return
  }
  await expect(inline).toBeHidden()
  await expect(pinned).toBeVisible()
  expect(await pinned.evaluate((el) => getComputedStyle(el).position)).toBe('sticky')
  const labels: string[] = []
  for (let i = 0; i < 4; i++) {
    await page.locator('.learn-step').nth(i).scrollIntoViewIfNeeded()
    await page
      .locator('.learn-step')
      .nth(i)
      .evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await expect(page.locator('.learn-step').nth(i)).toHaveAttribute('data-active', '')
    labels.push((await page.locator('.learn-stage-head .eyebrow').innerText()).replace(/\s+/g, ' '))
    await expect(page.locator('.learn-layer.is-active')).toHaveCount(1)
  }
  expect(labels.map((l) => l.split('·')[1].trim().toLowerCase())).toEqual([
    'capture',
    'memory',
    'insight',
    'action',
  ])
})

test('home: reduced motion renders final states and no WebGL', async ({ page }, info) => {
  test.skip(!reduced(info.project.name), 'reduced-motion project only')
  await page.goto('/')
  await page.waitForTimeout(1500)
  expect(await page.locator('canvas').count()).toBe(0)
  expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(
    false,
  )
  // the headline lines and fragments are not offset or hidden
  const moved = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('.hero-line')].map(
      (e) => getComputedStyle(e).transform,
    ),
  )
  expect(moved.every((t) => t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)')).toBe(true)
  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>('main [data-reveal]')].filter(
        (n) => parseFloat(getComputedStyle(n).opacity) < 0.05,
      ).length,
  )
  expect(hidden).toBe(0)
})

test('home: required AI disclosures are present', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByText(
      'Created by StumpNote AI. AI can make mistakes. Not medical or psychological advice.',
    ),
  ).toBeVisible()
  await expect(
    page
      .locator('footer')
      .getByText('AI-generated insights are guidance for reflection and training.'),
  ).toBeVisible()
  // sample data and scenarios are labelled
  await expect(page.getByText('Illustrative scenario').first()).toBeAttached()
  await expect(page.getByText('Sample data', { exact: false }).first()).toBeAttached()
})

test('home: no App Store availability claims, no banned claim words', async ({ page }) => {
  await page.goto('/')
  const text = (await page.locator('body').innerText()).toLowerCase()
  const banned = [
    /available on the app store/,
    /download on the app store/,
    /now on the app store/,
    /google play/,
    /android/,
    /\bdiagnos/,
    /\btreat(ment|ing)?\b/,
    /\bcure\b/,
    /\btherapy\b/,
    /clinically proven/,
    /guaranteed/,
    /score more runs/,
    /reduce injur/,
    /win more/,
    /never repeat a mistake/,
    /cricket brain/,
    /win weekends/,
    /private by design/,
    /coppa/,
    /km\/h/,
    /apple app store/,
  ]
  for (const re of banned) expect(text, String(re)).not.toMatch(re)
  expect(await page.locator('img[alt*="App Store" i], [aria-label*="Download" i]').count()).toBe(0)
})

test('home: the CTA follows the beta state and the primary CTA scrolls to it', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#join')).toBeAttached()
  const primary = page
    .locator('#hero-h')
    .locator('xpath=ancestor::section')
    .getByRole('link', {
      name: /Join the (TestFlight )?beta|Get the app/,
    })
  await expect(primary).toHaveAttribute('href', /^(#join|\/join|https:\/\/)/)
  await expect(
    page.locator('main').getByRole('link', { name: 'Open the web app' }).first(),
  ).toHaveAttribute('href', 'https://app.stumpnote.com')
  const form = page.getByRole('button', { name: 'Request beta access' })
  if ((await form.count()) === 0) {
    await expect(page.getByText('Beta sign-up opens soon.')).toBeVisible()
  }
})

test('home: waitlist form validates, announces errors and accepts a signup', async ({ page }) => {
  await page.goto('/')
  const submit = page.getByRole('button', { name: 'Request beta access' })
  test.skip((await submit.count()) === 0, 'waitlist is off in this environment (default)')
  await submit.scrollIntoViewIfNeeded()
  await submit.click()
  await expect(page.locator('#join').getByRole('alert')).toContainText(
    'Please fix the highlighted fields.',
  )
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await expect(page.getByText('Please tick the box to agree before you continue.')).toBeVisible()
  const email = `e2e+${Date.now()}@example.com`
  await page.locator('input[name="email"]').fill(email)
  await page.getByLabel('I am a').selectOption('player')
  await page.getByRole('checkbox').check()
  await submit.click()
  await expect(page.getByRole('status')).toContainText(/on the list|Thanks/i)
})

test('home: honeypot-filled submissions are not stored', async ({ page }) => {
  await page.goto('/')
  const submit = page.getByRole('button', { name: 'Request beta access' })
  test.skip((await submit.count()) === 0, 'waitlist is off in this environment (default)')
  await page
    .locator('input[name="website"]')
    .evaluate((el: HTMLInputElement) => (el.value = 'spam'))
  await page.locator('input[name="email"]').fill(`bot+${Date.now()}@example.com`)
  await page.getByRole('checkbox').check()
  await submit.click()
  // bots get the same success answer (they learn nothing); storage is verified server-side in the unit test
  await expect(page.getByRole('status')).toBeVisible()
})
