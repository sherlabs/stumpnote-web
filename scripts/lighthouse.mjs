// Lighthouse CI (mobile preset, 3 runs, median). Uses Playwright's Chromium so no system Chrome is required.
//   pnpm build && pnpm test:lh                          local production build on :3101
//   pnpm test:lh --url=https://stumpnote-site.vercel.app/   a deployed URL (no local server)
//   pnpm test:lh --base=https://stumpnote-site.vercel.app   every route of the rc file against a deployed origin
//   pnpm test:lh --base=<origin> --only=/privacy,/terms   only those routes (with --base)
//   pnpm test:lh --simulate                             Lighthouse's lantern *estimate* instead of applied throttling
// Default = applied throttling (Chrome DevTools: 4x CPU, 150 ms RTT, 1.6 Mbps), i.e. what a real mid-range phone sees.
// The lantern estimate counts every script requested before first paint as a render dependency, so with a ~140 KB
// framework baseline it reports a much later LCP than is observed (see STATUS.md and decisions D-39).
// HTML/JSON reports go to .lighthouseci/ (gitignored).
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const url = process.argv.find((a) => a.startsWith('--url='))?.slice(6)
const base = process.argv
  .find((a) => a.startsWith('--base='))
  ?.slice(7)
  ?.replace(/\/$/, '')
let config = 'tests/lighthouse/lighthouserc.json'
if (base) {
  // Same routes and assertions, pointed at a deployed origin (no local server).
  const rc = JSON.parse(readFileSync(config, 'utf8').replaceAll('http://localhost:3101', base))
  const only = process.argv
    .find((a) => a.startsWith('--only='))
    ?.slice(7)
    ?.split(',')
  if (only) rc.ci.collect.url = rc.ci.collect.url.filter((u) => only.includes(new URL(u).pathname))
  rc.ci.collect.startServerCommand = ''
  delete rc.ci.collect.startServerReadyPattern
  delete rc.ci.collect.startServerReadyTimeout
  config = join(mkdtempSync(join(tmpdir(), 'lhci-')), 'lighthouserc.json')
  writeFileSync(config, JSON.stringify(rc))
}
const args = ['exec', 'lhci', 'autorun', `--config=${config}`]
if (process.argv.includes('--simulate')) args.push('--collect.settings.throttlingMethod=simulate')
if (url) args.push(`--collect.url=${url}`, '--collect.startServerCommand=')
const r = spawnSync('pnpm', args, {
  stdio: 'inherit',
  env: { ...process.env, CHROME_PATH: chromium.executablePath() },
})
process.exit(r.status ?? 1)
