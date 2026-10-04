import { ImageResponse } from 'next/og'
import { ARCHIVO_900_B64, HANKEN_500_B64 } from './fonts-data'
import { MARK_SVG } from './mark'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_TYPE = 'image/png'

type Accent = 'player' | 'coach' | 'parent' | 'team'
// Brand accents (docs/spec/02-design.md). OG images are rendered outside CSS, so the hex lives here, once.
const ACCENT: Record<Accent, string> = {
  player: '#00B9AE',
  coach: '#FD9423',
  parent: '#CC5572',
  team: '#89C012',
}
const CANVAS = '#0B1114'
const TEXT = '#F2F5F4'
const MUTED = '#96A1AB'

const markUri = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString('base64')}`

const toBuf = (b64: string) => {
  const b = Buffer.from(b64, 'base64')
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
}

const fonts = () => [
  { name: 'Archivo', data: toBuf(ARCHIVO_900_B64), weight: 900 as const, style: 'normal' as const },
  { name: 'Hanken', data: toBuf(HANKEN_500_B64), weight: 500 as const, style: 'normal' as const },
]

const clamp = (t: string, n: number) => (t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`)

/** Title size steps down for long titles so it always fits in at most three lines. */
const titleSize = (t: string) => (t.length > 46 ? 64 : t.length > 28 ? 80 : 104)

export async function ogImage({
  title,
  kicker,
  subtitle,
  accent = 'player',
}: {
  title: string
  kicker?: string
  subtitle?: string
  accent?: Accent
}) {
  const color = ACCENT[accent]
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: CANVAS,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Hanken',
          color: TEXT,
        }}
      >
        {/* ambient rings + glow, echoing the site background */}
        <div
          style={{
            position: 'absolute',
            right: -220,
            top: -240,
            width: 900,
            height: 900,
            borderRadius: 900,
            border: '2px solid rgba(255,255,255,0.07)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -80,
            top: -100,
            width: 620,
            height: 620,
            borderRadius: 620,
            border: '2px solid rgba(255,255,255,0.05)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 900,
            height: 630,
            background: `radial-gradient(circle at 0% 0%, ${color}3d 0%, ${color}00 70%)`,
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markUri} width={56} height={57} alt="" />
          <div style={{ display: 'flex', fontFamily: 'Archivo', fontSize: 40, fontWeight: 900 }}>
            StumpNote
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960 }}>
          {kicker && (
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                letterSpacing: 6,
                textTransform: 'uppercase',
                color,
              }}
            >
              {kicker}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              fontFamily: 'Archivo',
              fontWeight: 900,
              fontSize: titleSize(title),
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ display: 'flex', fontSize: 32, lineHeight: 1.35, color: MUTED, maxWidth: 860 }}>
              {clamp(subtitle, 150)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: MUTED }}>
          <div style={{ display: 'flex' }}>stumpnote.com</div>
          <div style={{ display: 'flex', width: 120, height: 6, borderRadius: 6, background: color }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts() },
  )
}
