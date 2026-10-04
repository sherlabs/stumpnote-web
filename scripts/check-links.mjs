// Internal link checker: crawls the sitemap plus the home page against a running server and checks that every
// internal <a href> returns 200 and that every #fragment exists on its target page. External links are only
// syntax-checked (no network) unless --external is passed (HEAD with a 8 s timeout, warnings only).
//   BASE=http://127.0.0.1:3100 node scripts/check-links.mjs [--external]
const base = (process.env.BASE ?? 'http://127.0.0.1:3100').replace(/\/$/, '')
const checkExternal = process.argv.includes('--external')
const SKIP = /^\/(admin|api|next\/preview)(\/|$)/

const get = async (p) => {
  const r = await fetch(base + p, { redirect: 'manual' })
  return { status: r.status, type: r.headers.get('content-type') ?? '', text: r.headers.get('content-type')?.includes('text/html') ? await r.text() : '' }
}

const sitemap = await (await fetch(base + '/sitemap.xml')).text()
const queue = new Set(['/', ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)])
const pages = new Map()
const failures = []
const externals = new Set()

for (const p of queue) {
  const res = await get(p)
  if (res.status !== 200) failures.push(`${p}: status ${res.status}`)
  pages.set(p, res.text)
}
for (const [from, html] of pages) {
  const ids = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, '&')
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    if (/^https?:\/\//.test(href)) {
      if (!href.startsWith(base)) {
        try { new URL(href); externals.add(href) } catch { failures.push(`${from}: malformed external ${href}`) }
        continue
      }
    }
    const u = new URL(href, base + from)
    if (u.origin !== new URL(base).origin) continue
    const path = u.pathname.replace(/(.)\/$/, '$1')
    if (SKIP.test(path)) continue
    if (!pages.has(path)) {
      const res = await get(path)
      pages.set(path, res.text)
      if (res.status !== 200 && !(res.status >= 300 && res.status < 400)) failures.push(`${from}: ${href} -> ${res.status}`)
    }
    if (u.hash && pages.get(path) && !ids(pages.get(path)).has(decodeURIComponent(u.hash.slice(1)))) {
      failures.push(`${from}: ${href} -> missing anchor`)
    }
  }
}
let warned = 0
if (checkExternal) {
  for (const url of externals) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) })
      if (r.status >= 400 && r.status !== 403 && r.status !== 405) { warned++; console.warn(`warn: ${url} -> ${r.status}`) }
    } catch (e) { warned++; console.warn(`warn: ${url} -> ${e.name}`) }
  }
}
console.log(`links: ${pages.size} pages, ${externals.size} external, ${failures.length} failures, ${warned} warnings`)
if (failures.length) { console.error(failures.join('\n')); process.exit(1) }
