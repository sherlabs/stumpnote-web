// Generates PNG icons from the brand mark: node scripts/make-favicons.mjs  (sharp is already a dependency).
// The mark sits on the brand canvas (#0B1114); the maskable icon keeps the mark inside the 80% safe zone.
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/brand/stumpnote-mark.svg', import.meta.url))
const BG = { r: 11, g: 17, b: 20, alpha: 1 }
async function icon(size, markRatio, out) {
  const mark = await sharp(svg, { density: 600 })
    .resize(Math.round(size * markRatio), Math.round(size * markRatio), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(new URL(`../public/favicons/${out}`, import.meta.url).pathname)
}
await icon(32, 0.78, 'favicon-32.png')
await icon(180, 0.62, 'apple-touch-icon.png')
await icon(192, 0.62, 'icon-192.png')
await icon(512, 0.62, 'icon-512.png')
await icon(512, 0.5, 'icon-maskable-512.png')
console.log('favicons written')
