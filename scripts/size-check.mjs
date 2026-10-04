// First-load JS budget: gzip size of every <script src> in the built HTML of a route (modern browsers: nomodule skipped).
// Usage: node scripts/size-check.mjs [route=/] [budgetKB=170]   (run after `pnpm build`)
import { readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const route = process.argv[2] ?? '/'
const budget = Number(process.argv[3] ?? 170)
const htmlPath = join('.next/server/app', route === '/' ? 'index.html' : `${route.slice(1)}.html`)
if (!existsSync(htmlPath)) {
  console.error(
    `size-check: ${htmlPath} not found (route must be statically rendered; run pnpm build first)`,
  )
  process.exit(2)
}
const html = readFileSync(htmlPath, 'utf8')
const tags = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)]
const files = tags
  .filter((m) => !/\bnoModule\b|\bnomodule\b/.test(m[0]))
  .map((m) => m[1].split('?')[0])
const unique = [...new Set(files)]
let total = 0
const rows = []
for (const f of unique) {
  const p = join('.next', f.replace(/^\/_next\//, ''))
  if (!existsSync(p)) continue
  const size = gzipSync(readFileSync(p)).length
  total += size
  rows.push([f.split('/').pop(), size])
}
rows.sort((a, b) => b[1] - a[1])
for (const [name, size] of rows.slice(0, 8))
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${name}`)
const kb = total / 1024
console.log(
  `first-load JS (gzip) ${route}: ${kb.toFixed(1)} KB across ${rows.length} scripts (budget ${budget} KB)`,
)
// GSAP / Lenis / OGL must never be in the initial list.
const bad = unique.filter((f) => {
  const p = join('.next', f.replace(/^\/_next\//, ''))
  if (!existsSync(p)) return false
  const src = readFileSync(p, 'utf8')
  return /ScrollTrigger|gsap\.registerPlugin|new Lenis|class Lenis|OGL_VERSION|Renderer\(\{/.test(
    src,
  )
})
if (bad.length) {
  console.error(
    `size-check: heavy motion libraries found in the initial scripts: ${bad.join(', ')}`,
  )
  process.exit(1)
}
process.exit(kb > budget ? 1 : 0)
