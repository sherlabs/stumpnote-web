// Lighthouse CI (mobile preset, 3 runs, median). Uses Playwright's Chromium so no system Chrome is required.
//   pnpm build && pnpm test:lh                          local production build on :3101
//   pnpm test:lh --url=https://stumpnote-site.vercel.app/   a deployed URL (no local server)
//   pnpm test:lh --simulate                             Lighthouse's lantern *estimate* instead of applied throttling
// Default = applied throttling (Chrome DevTools: 4x CPU, 150 ms RTT, 1.6 Mbps), i.e. what a real mid-range phone sees.
// The lantern estimate counts every script requested before first paint as a render dependency, so with a ~140 KB
// framework baseline it reports a much later LCP than is observed (see STATUS.md and decisions D-39).
// HTML/JSON reports go to .lighthouseci/ (gitignored).
import { spawnSync } from 'node:child_process'
import { chromium } from '@playwright/test'

const url = process.argv.find((a) => a.startsWith('--url='))?.slice(6)
const args = ['exec', 'lhci', 'autorun', '--config=tests/lighthouse/lighthouserc.json']
if (process.argv.includes('--simulate')) args.push('--collect.settings.throttlingMethod=simulate')
if (url) args.push(`--collect.url=${url}`, '--collect.startServerCommand=')
const r = spawnSync('pnpm', args, {
  stdio: 'inherit',
  env: { ...process.env, CHROME_PATH: chromium.executablePath() },
})
process.exit(r.status ?? 1)
