import { expect, test } from '@playwright/test'
import routes from './routes.json' with { type: 'json' }

const htmlRoutes = routes.ok.filter((r) => !/\.(txt|xml)$/.test(r) && r !== '/lab')
const FORBIDDEN = ['aggregateRating', '"review"', '"offers"', 'ratingValue', 'priceCurrency']

for (const path of htmlRoutes) {
  test(`seo: ${path} has title, description, canonical, social tags and one h1`, async ({
    page,
    request,
  }) => {
    await page.goto(path)
    const title = await page.title()
    expect(title.length).toBeGreaterThan(3)
    expect(title.length).toBeLessThanOrEqual(75)
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc?.length ?? 0).toBeGreaterThan(30)
    expect(desc?.length ?? 0).toBeLessThanOrEqual(220)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical!).pathname.replace(/\/$/, '') || '/').toBe(path)
    for (const p of ['og:title', 'og:description', 'og:image', 'og:site_name']) {
      expect(await page.locator(`meta[property="${p}"]`).count(), p).toBeGreaterThan(0)
    }
    expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe(
      'summary_large_image',
    )
    expect(await page.locator('h1').count()).toBe(1)
    // the social image is a real PNG on this deployment
    const og = await page.locator('meta[property="og:image"]').getAttribute('content')
    const res = await request.get(new URL(og!).pathname + new URL(og!).search)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('image/png')
  })
}

test('home has Organization + 3 iOS apps and no rating, review or offer keys', async ({ page }) => {
  await page.goto('/')
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(blocks.length).toBeGreaterThan(0)
  const raw = blocks.join('\n')
  for (const k of FORBIDDEN) expect(raw).not.toContain(k)
  const graph = blocks.flatMap((b) => JSON.parse(b)['@graph'] as Array<Record<string, unknown>>)
  expect(graph.filter((n) => n['@type'] === 'Organization')).toHaveLength(1)
  const apps = graph.filter((n) => n['@type'] === 'SoftwareApplication')
  expect(apps.map((a) => a.name)).toEqual(['StumpNote', 'StumpNote Coach', 'StumpNote Parent'])
  expect(apps.every((a) => a.operatingSystem === 'iOS')).toBe(true)
  expect(raw).not.toContain('installUrl') // not live on the App Store
})

test('FAQPage structured data only on /support, and only for FAQs the page shows', async ({
  page,
}) => {
  for (const path of htmlRoutes) {
    await page.goto(path)
    const raw = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(
      '\n',
    )
    if (path === '/support') {
      expect(raw).toContain('"FAQPage"')
      const n = (raw.match(/"@type":"Question"/g) ?? []).length
      expect(n).toBe(await page.locator('.faq-item').count())
    } else {
      expect(raw, path).not.toContain('FAQPage')
    }
  }
})

test('manifest and icons resolve', async ({ request, page }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.status()).toBe(200)
  const m = await res.json()
  expect(m.name).toBe('StumpNote')
  for (const i of m.icons as Array<{ src: string }>) {
    expect((await request.get(i.src)).status(), i.src).toBe(200)
  }
  await page.goto('/')
  expect(await page.locator('link[rel="apple-touch-icon"]').count()).toBeGreaterThan(0)
  expect(await page.locator('link[rel="icon"]').count()).toBeGreaterThan(0)
  expect(await page.locator('link[rel="manifest"]').getAttribute('href')).toBe(
    '/manifest.webmanifest',
  )
})

test('every sitemap URL resolves, and none is /lab, /admin or /api', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  expect(urls.length).toBeGreaterThan(10)
  for (const p of urls) {
    expect(p).not.toMatch(/^\/(lab|admin|api)(\/|$)/)
    expect((await request.get(p)).status(), p).toBe(200)
  }
})

test('noindex routes are absent from the sitemap and carry noindex', async ({ page, request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  for (const p of ['/privacy/history', '/terms/history', '/data-safety']) {
    expect(xml).not.toContain(`${p}<`)
    await page.goto(p)
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex')
  }
})
