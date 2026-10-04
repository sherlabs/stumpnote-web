import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Legal pages (docs/spec/06-legal-pages.md section 7).
 * Default (production state): every page renders the notice, noindex, with no placeholder text.
 * With LEGAL_FIXTURE=1 (local DB loaded by `pnpm legal:fixture` with SYNTHETIC values): the full pages, versions and print.
 */
const FIXTURE = process.env.LEGAL_FIXTURE === '1'
const PAGES = ['/privacy', '/terms', '/cookies', '/account-deletion', '/data-safety']

for (const path of PAGES) {
  test(`${path}: no placeholder text in the DOM, and the right mode`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    const html = await page.content()
    const text = await page.locator('body').innerText()
    expect(html).not.toContain('{{')
    expect(text).not.toContain('}}')
    expect(html).not.toContain('LEGAL_REVIEW')
    const robotsTag = page.locator('meta[name="robots"]')
    const robots = (await robotsTag.count()) ? await robotsTag.getAttribute('content') : ''
    if (FIXTURE) {
      // /data-safety stays noindex until the owner decides to publish it (S5-U3)
      if (path === '/data-safety') expect(robots).toContain('noindex')
      else expect(robots).not.toContain('noindex')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByText('being finalised')).toHaveCount(0)
    } else {
      expect(robots).toContain('noindex')
      await expect(page.getByText('This page is being finalised')).toBeVisible()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })
}

test('notice mode points to the app when no support email is set', async ({ page }) => {
  test.skip(FIXTURE, 'fixture sets a support email')
  await page.goto('/privacy')
  await expect(page.getByText('use the app, Profile, then Help')).toBeVisible()
})

test('sitemap lists no notice-mode legal page, /lab, /admin or /api', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  expect(xml).not.toMatch(/\/(lab|admin|api)(\/|<)/)
  if (!FIXTURE) {
    for (const p of PAGES) expect(xml).not.toContain(`${p}<`)
  }
})

test('robots disallows /admin, /api and /lab and names the sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text()
  for (const p of ['/admin', '/api', '/lab']) expect(txt).toContain(`Disallow: ${p}`)
  expect(txt).toContain('Sitemap:')
})

test('history and old-version routes are noindex; unknown versions are 404', async ({ page }) => {
  const res = await page.goto('/privacy/history')
  expect(res?.status()).toBe(200)
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex')
  const missing = await page.goto('/privacy/v/not-a-version')
  expect(missing?.status()).toBe(404)
})

test('/legal lists the legal pages and the Apple EULA', async ({ page }) => {
  await page.goto('/legal')
  for (const name of [
    'Privacy Policy',
    'Terms of Use',
    'Cookies',
    'Account deletion',
    'Apple standard EULA',
  ]) {
    await expect(page.locator('#main').getByRole('link', { name })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'Data safety summary' })).toHaveCount(0)
})

test('footer carries the legal links, the EULA, and a copyright line without an entity', async ({
  page,
}) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()
  await expect(footer.getByRole('link', { name: 'Terms of Use' })).toBeVisible()
  await expect(footer.getByRole('link', { name: 'Apple standard EULA' })).toHaveAttribute(
    'href',
    /apple\.com\/legal\/internet-services\/itunes\/dev\/stdeula/,
  )
  if (!FIXTURE) await expect(footer).toContainText('© 2026 StumpNote')
})

test.describe('full pages (LEGAL_FIXTURE=1, local DB with synthetic values)', () => {
  test.skip(!FIXTURE, 'needs the local legal fixture')

  test('privacy renders substituted values, meta, contents list and no review text', async ({
    page,
  }) => {
    await page.goto('/privacy')
    const body = page.locator('article.legal-prose')
    await expect(body).toContainText('privacy@example.test')
    await expect(body).toContainText('Fixture Co Pty Ltd')
    await expect(page.getByText('Policy version:')).toBeVisible()
    await expect(page.locator('.legal-toc')).toBeVisible() // sticky list on desktop, collapsible on phones
    await expect(
      page.getByText('this paragraph exists only in version two', { exact: false }),
    ).toBeVisible()
    const html = await page.content()
    expect(html).not.toMatch(/LEGAL_REVIEW|being finalised|\{\{/)
  })

  test('version history lists only published versions and old versions render exactly their body', async ({
    page,
  }) => {
    await page.goto('/privacy/history')
    await expect(page.getByRole('link', { name: /Version fixture-1/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Version fixture-2/ })).toBeVisible()
    await page.goto('/privacy/v/fixture-1')
    await expect(page.getByText('exists only in version two')).toHaveCount(0)
    await expect(page.getByText('You are reading an earlier version')).toBeVisible()
    await page.goto('/privacy/v/fixture-2')
    await expect(page.getByText('exists only in version two')).toBeVisible()
  })

  test('sitemap lists the complete legal pages', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    for (const p of ['/privacy', '/terms', '/cookies', '/account-deletion']) {
      expect(xml).toContain(`${p}<`)
    }
    expect(xml).not.toContain('/data-safety<') // not published until S5-U3
  })

  test('keyboard: contents links jump to the section and scrollable tables take focus', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/privacy')
    if (!isMobile) {
      const first = page
        .getByRole('navigation', { name: 'On this page', exact: true })
        .getByRole('link')
        .first()
      await first.focus()
      await expect(first).toBeFocused()
      const outline = await first.evaluate((el) => getComputedStyle(el).outlineStyle)
      expect(outline).not.toBe('none')
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/#1-who-we-are$/)
    }
    const table = page.locator('.legal-table').first()
    await table.focus()
    await expect(table).toBeFocused()
    const o = await table.evaluate((el) => getComputedStyle(el).outlineStyle)
    expect(o).not.toBe('none')
  })

  test('print stylesheet hides chrome and expands links', async ({ page }) => {
    await page.goto('/terms')
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('header').first()).toBeHidden()
    await expect(page.locator('footer').first()).toBeHidden()
    const after = await page.evaluate(() => {
      const a = document.querySelector('.legal-prose a[href^="/"]') as HTMLElement | null
      return a ? getComputedStyle(a, '::after').content : ''
    })
    expect(after).toContain('https://stumpnote.com')
    const ext = await page.evaluate(() => {
      const a = document.querySelector('.legal-prose a[href^="http"]') as HTMLElement | null
      return a ? getComputedStyle(a, '::after').content : ''
    })
    expect(ext).toContain('http')
  })

  for (const path of [
    '/privacy',
    '/terms',
    '/cookies',
    '/account-deletion',
    '/data-safety',
    '/privacy/history',
  ]) {
    test(`axe on full ${path}`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      const bad = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      )
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
})
