// Computes WCAG 2.2 contrast ratios for every token pair used for text or UI. Run: node scripts/contrast.mjs
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (h) => {
  const [r, g, b] = hex(h).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const T = {
  canvas: '#0b1114',
  surface: '#141920',
  text: '#f2f5f4',
  body: '#c9d0d6',
  muted: '#96a1ab',
  tertiary: '#7c8894',
  error: '#ff8a80',
  player: '#00b9ae',
  coach: '#fd9423',
  parent: '#cc5572',
  parentText: '#e07a93',
  team: '#89c012',
}
const rows = []
for (const bg of ['canvas', 'surface']) {
  for (const fg of [
    'text',
    'body',
    'muted',
    'tertiary',
    'error',
    'player',
    'coach',
    'parent',
    'parentText',
    'team',
  ])
    rows.push([`${fg} on ${bg}`, ratio(T[fg], T[bg])])
}
for (const a of ['player', 'coach', 'parent', 'parentText', 'team'])
  rows.push([`canvas label on ${a} fill`, ratio(T.canvas, T[a])])
for (const [k, v] of rows)
  console.log(
    k.padEnd(34),
    v.toFixed(2) + ':1',
    v >= 7 ? 'AAA' : v >= 4.5 ? 'AA' : v >= 3 ? 'AA large/UI only' : 'FAIL',
  )
