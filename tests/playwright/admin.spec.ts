import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

/**
 * Admin analytics (S6). Needs a database with three fixture users:
 *   TEST_ADMIN_PASSWORD=... TEST_EDITOR_PASSWORD=... TEST_VIEWER_PASSWORD=... TEST_THROTTLE_PASSWORD=... pnpm analytics:users
 *   ADMIN_FIXTURE=1 TEST_ADMIN_PASSWORD=... (same four) pnpm test:e2e tests/playwright/admin.spec.ts
 * Skipped without ADMIN_FIXTURE=1 so DB-free runs and production runs stay green. Passwords come from the
 * environment; none is written in the repository.
 */
const ON = process.env.ADMIN_FIXTURE === '1'
const VIEWS = [
  { path: '/admin/analytics/web', h1: 'Website analytics' },
  { path: '/admin/analytics/ai-spend', h1: 'AI spend' },
  { path: '/admin/analytics/product', h1: 'Product analytics' },
]
const USERS = {
  admin: { email: 'admin@analytics-fixture.test', pw: process.env.TEST_ADMIN_PASSWORD },
  editor: { email: 'editor@analytics-fixture.test', pw: process.env.TEST_EDITOR_PASSWORD },
  viewer: { email: 'viewer@analytics-fixture.test', pw: process.env.TEST_VIEWER_PASSWORD },
  throttle: { email: 'throttle@analytics-fixture.test', pw: process.env.TEST_THROTTLE_PASSWORD },
} as const

/** One admin account per Playwright project, so the per-user view throttle cannot couple parallel projects. */
const ADMIN_BY_PROJECT: Record<string, string> = {
  'chromium-desktop': 'admin@analytics-fixture.test',
  'reduced-motion': 'admin-rm@analytics-fixture.test',
  'chromium-mobile': 'admin-mobile@analytics-fixture.test',
}

async function login(request: APIRequestContext, who: keyof typeof USERS) {
  const u = USERS[who]
  const email = who === 'admin' ? (ADMIN_BY_PROJECT[test.info().project.name] ?? u.email) : u.email
  const res = await request.post('/api/users/login', { data: { email, password: u.pw } })
  expect(res.ok(), `login ${who}`).toBeTruthy()
  // Secure cookies are not replayed by API request contexts over plain http: REST calls also send the JWT.
  return ((await res.json()) as { token: string }).token
}

async function expectNoAnalyticsContent(page: Page, h1: string) {
  const text = await page.locator('body').innerText()
  expect(text).not.toContain('Sample data')
  expect(text).not.toContain(h1)
  expect(text).not.toMatch(/Month to date|Daily cost|Visitors and pageviews/)
}

test.describe('admin analytics', () => {
  test.skip(!ON, 'needs ADMIN_FIXTURE=1 and the fixture users (pnpm analytics:users)')

  for (const v of VIEWS) {
    test(`anonymous cannot see ${v.path} (404 or redirect to login)`, async ({ page }) => {
      await page.goto(v.path)
      await page.waitForLoadState('networkidle')
      await expectNoAnalyticsContent(page, v.h1)
      const onLogin = /\/admin\/login/.test(page.url())
      const hasLoginForm = (await page.locator('input[type="password"]').count()) > 0
      const notFound = /not found|nothing found|404/i.test(await page.locator('body').innerText())
      expect(onLogin || hasLoginForm || notFound).toBeTruthy()
    })

    for (const who of ['editor', 'viewer'] as const) {
      test(`${who} gets a 404 for ${v.path}`, async ({ page }) => {
        await login(page.request, who)
        await page.goto(v.path)
        await expectNoAnalyticsContent(page, v.h1)
        await expect(page.getByText(/nothing found|not found|404/i).first()).toBeVisible()
      })
    }

    test(`admin sees ${v.path} with the sample data banner, a text alternative for charts, and no serious a11y issues`, async ({
      page,
    }) => {
      await login(page.request, 'admin')
      await page.goto(v.path)
      await expect(page.getByRole('heading', { level: 1, name: v.h1 })).toBeVisible()
      await expect(page.getByRole('note').filter({ hasText: 'Sample data' })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Date range' })).toBeVisible()
      expect(await page.locator('.sn-an__panel').count()).toBeGreaterThanOrEqual(5)
      // every chart has a hidden table twin
      const charts = await page.locator('.sn-an__chart').count()
      if (charts)
        expect(await page.locator('.sn-an__sr table').count()).toBeGreaterThanOrEqual(charts)
      const results = await new AxeBuilder({ page }).include('.sn-an').analyze()
      const bad = results.violations.filter(
        (x) => x.impact === 'serious' || x.impact === 'critical',
      )
      expect(bad.map((b) => `${b.id}: ${b.nodes[0]?.html.slice(0, 120)}`)).toEqual([])
    })

    test(`admin: ${v.path} does not overflow horizontally`, async ({ page }) => {
      await login(page.request, 'admin')
      await page.goto(v.path)
      await expect(page.getByRole('heading', { level: 1, name: v.h1 })).toBeVisible()
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(over).toBeLessThanOrEqual(1)
    })
  }

  test('range picker drives the URL and panels', async ({ page }) => {
    await login(page.request, 'admin')
    await page.goto('/admin/analytics/web?range=7d')
    await expect(page.getByRole('link', { name: '7d' })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByText(/in the last 7d/)).toBeVisible()
    await page.getByRole('link', { name: '90d' }).click()
    await expect(page).toHaveURL(/range=90d/)
    await expect(page.getByText(/in the last 90d/)).toBeVisible()
  })

  test('product view hides cells below k and says so', async ({ page }) => {
    await login(page.request, 'admin')
    await page.goto('/admin/analytics/product')
    await expect(page.getByText('hidden (< k)').first()).toBeVisible()
    await expect(page.getByText(/Cells with fewer than k users are hidden/)).toBeVisible()
  })

  test('ai-spend: filters apply, scenarios ship empty, no ids anywhere', async ({ page }) => {
    await login(page.request, 'admin')
    await page.goto('/admin/analytics/ai-spend?model=gemini-3.5-flash')
    await expect(page.getByText('(filtered)')).toBeVisible()
    await expect(page.getByText('No scenarios yet')).toBeVisible()
    const html = await page.locator('.sn-an').evaluate((el) => el.innerHTML)
    expect(html).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
  })

  test('dashboard shows analytics tiles and nav for admins only', async ({ page, browser }) => {
    await login(page.request, 'admin')
    await page.goto('/admin')
    await expect(page.getByRole('link', { name: /Visitors, last 7 days/ })).toBeVisible()
    const ctx = await browser.newContext()
    const editor = await ctx.newPage()
    await login(editor.request, 'editor')
    await editor.goto('/admin')
    await expect(editor.getByRole('heading', { name: 'Collections' })).toBeVisible()
    await expect(editor.getByText(/Visitors, last 7 days/)).toHaveCount(0)
    await expect(editor.getByRole('link', { name: 'AI spend' })).toHaveCount(0)
    await ctx.close()
  })

  test('viewing writes audit rows readable only by admins', async ({ page, browser }) => {
    const token = await login(page.request, 'admin')
    await page.goto('/admin/analytics/web')
    await expect(page.getByRole('heading', { level: 1, name: 'Website analytics' })).toBeVisible()
    const res = await page.request.get(
      '/api/audit-log?where%5Baction%5D%5Bequals%5D=view%3Aweb&limit=1',
      { headers: { Authorization: `JWT ${token}` } },
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.totalDocs).toBeGreaterThan(0)
    const ctx = await browser.newContext()
    const editorToken = await login(ctx.request, 'editor')
    const asEditor = await ctx.request.get('/api/audit-log', {
      headers: { Authorization: `JWT ${editorToken}` },
    })
    expect(asEditor.status()).toBe(403)
    const anon = await browser.newContext()
    expect((await anon.request.get('/api/audit-log')).status()).toBe(403)
    await ctx.close()
    await anon.close()
  })

  test('throttle: the 31st view inside a minute shows "slow down" instead of querying', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'one throttle run per suite is enough')
    test.setTimeout(120_000)
    await login(page.request, 'throttle')
    let slowed = false
    for (let i = 0; i < 40 && !slowed; i++) {
      await page.goto('/admin/analytics/product')
      slowed = (await page.getByRole('heading', { name: 'Slow down' }).count()) > 0
    }
    expect(slowed).toBeTruthy()
  })
})

test('public site: no cost data and no chart library on the marketing pages', async ({
  request,
}) => {
  const res = await request.get('/')
  const html = await res.text()
  expect(html).not.toMatch(/ai_daily|cost_usd|analytics\/ai-spend/)
  const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1] as string)
  for (const s of srcs) {
    const js = await (await request.get(s)).text()
    expect(js, s).not.toContain('recharts')
  }
})
