// Summarise .lighthouseci/lhr-*.json (median performance run per URL) as a markdown table.
import { readdirSync, readFileSync } from 'node:fs'
const dir = '.lighthouseci'
const byUrl = new Map()
for (const f of readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f))) {
  const r = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))
  const u = new URL(r.finalDisplayedUrl ?? r.finalUrl).pathname
  byUrl.set(u, [...(byUrl.get(u) ?? []), r])
}
const pct = (r, c) => Math.round(r.categories[c].score * 100)
const a = (r, id) => r.audits[id]?.numericValue
console.log(
  '| Route | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | Runs |\n|---|---|---|---|---|---|---|---|---|',
)
for (const [u, runs] of [...byUrl].sort()) {
  runs.sort((x, y) => x.categories.performance.score - y.categories.performance.score)
  const m = runs[Math.floor(runs.length / 2)]
  console.log(
    `| ${u} | ${pct(m, 'performance')} | ${pct(m, 'accessibility')} | ${pct(m, 'best-practices')} | ${pct(m, 'seo')} | ${(a(m, 'largest-contentful-paint') / 1000).toFixed(2)} | ${a(m, 'cumulative-layout-shift').toFixed(3)} | ${Math.round(a(m, 'total-blocking-time'))} | ${runs.length} |`,
  )
}
