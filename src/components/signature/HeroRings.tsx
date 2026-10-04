'use client'

import { useEffect, useRef, useState } from 'react'
import { whenIdle } from '@/lib/motion/idle'
import { cn } from '@/lib/cn'
import { staticAttr } from './types'
import type { SignatureProps } from './types'

/** Static SVG rings: the server-rendered fallback and the layout box for the shader. Identical footprint, so no shift. */
function StaticRings() {
  const radii = Array.from({ length: 11 }, (_, i) => 18 + Math.pow(i, 1.55) * 13)
  return (
    <svg viewBox="-200 -200 400 400" className="absolute inset-0 h-full w-full" aria-hidden fill="none">
      {radii.map((r, i) => (
        <circle key={i} r={r} stroke={i === 4 ? 'var(--accent)' : 'var(--hairline-3)'} strokeOpacity={i === 4 ? 0.7 : 1} />
      ))}
      <circle cx="0" cy={-radii[4]} r="4" fill="var(--accent)" />
    </svg>
  )
}

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform vec3 uColor;
out vec4 outColor;
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  vec2 cursor = (uMouse - 0.5) * vec2(1.0, -1.0);
  vec2 c = cursor * 0.06;
  float d = length(p - c);
  float k = log(d * 8.0 + 1.0) * 6.5 - uTime * 0.045 + uScroll * 0.5;
  float fw = max(fwidth(k), 1e-4);
  float dk = 0.5 - abs(fract(k) - 0.5);
  float line = 1.0 - smoothstep(0.0, fw * 2.0, dk);
  float fade = smoothstep(0.49, 0.06, d);
  float near = exp(-pow(length(p - cursor * 0.5) * 3.2, 2.0));
  float ringIndex = floor(k);
  float accentRing = step(abs(ringIndex - 4.0), 0.5);
  vec3 col = mix(vec3(0.62, 0.68, 0.72), uColor, clamp(near * 0.9 + accentRing * 0.8, 0.0, 1.0));
  float alpha = line * fade * (0.34 + 0.6 * near + 0.45 * accentRing);
  outColor = vec4(col * alpha, alpha);
}`

function accentRgb(host: HTMLElement): [number, number, number] {
  const probe = document.createElement('span')
  probe.style.color = 'var(--accent)'
  probe.style.display = 'none'
  host.appendChild(probe)
  const c = getComputedStyle(probe).color
  host.removeChild(probe)
  const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 185, 174]
  return c.startsWith('color(') ? [m[0], m[1], m[2]] : [m[0] / 255, m[1] / 255, m[2] / 255]
}

/**
 * Concentric hairline rings as a fragment shader (OGL, lazy chunk), nudged by the cursor and by scroll, tinted with
 * the page accent. Every gate must pass or the static SVG stays: motion allowed, 4+ cores, no data-saver, WebGL2, and
 * a 10-frame probe under 20ms per frame. Mounted after idle; never the LCP.
 */
export function HeroRings({ reducedMotion, persona, className }: SignatureProps) {
  const host = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = host.current
    if (!el || reducedMotion) return
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    if (document.documentElement.getAttribute('data-motion') !== 'on') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if ((nav.hardwareConcurrency ?? 4) < 4) return
    if (nav.connection?.saveData) return

    let disposed = false
    let raf = 0
    let cleanup = () => {}

    const cancelIdle = whenIdle(async () => {
      try {
        const { Renderer, Program, Mesh, Triangle } = await import('ogl')
        if (disposed) return
        const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.75), webgl: 2 })
        const gl = renderer.gl
        if (!(gl instanceof WebGL2RenderingContext)) return
        const canvas = gl.canvas as HTMLCanvasElement
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .8s ease'
        canvas.setAttribute('aria-hidden', 'true')
        el.appendChild(canvas)

        const resize = () => renderer.setSize(el.clientWidth, el.clientHeight)
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(el)

        const program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          transparent: true,
          uniforms: {
            uRes: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight] },
            uTime: { value: 0 },
            uMouse: { value: [0.5, 0.5] },
            uScroll: { value: 0 },
            uColor: { value: accentRgb(el) },
          },
        })
        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

        const target = [0.5, 0.5]
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          target[0] = (e.clientX - r.left) / r.width
          target[1] = (e.clientY - r.top) / r.height
        }
        window.addEventListener('pointermove', onMove, { passive: true })

        let visible = true
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
        io.observe(el)

        const colorWatch = new MutationObserver(() => (program.uniforms.uColor.value = accentRgb(el)))
        colorWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-persona'] })

        let frames = 0
        let last = performance.now()
        let probeTotal = 0
        const t0 = last
        const tick = (now: number) => {
          if (disposed) return
          raf = requestAnimationFrame(tick)
          if (!visible) {
            last = now
            return
          }
          if (frames < 10) {
            probeTotal += now - last
            frames++
            if (frames === 10 && probeTotal / 10 > 20) {
              fail()
              return
            }
          }
          last = now
          const m = program.uniforms.uMouse.value as number[]
          m[0] += (target[0] - m[0]) * 0.06
          m[1] += (target[1] - m[1]) * 0.06
          program.uniforms.uTime.value = (now - t0) / 1000
          program.uniforms.uScroll.value = window.scrollY / Math.max(1, window.innerHeight)
          program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight]
          renderer.render({ scene: mesh })
          if (frames === 3) {
            canvas.style.opacity = '1'
            setLive(true)
          }
        }
        const fail = () => {
          cleanup()
          setLive(false)
        }
        cleanup = () => {
          cancelAnimationFrame(raf)
          window.removeEventListener('pointermove', onMove)
          ro.disconnect()
          io.disconnect()
          colorWatch.disconnect()
          gl.getExtension('WEBGL_lose_context')?.loseContext()
          canvas.remove()
          cleanup = () => {}
        }
        raf = requestAnimationFrame(tick)
      } catch {
        /* any failure keeps the static SVG */
      }
    })

    return () => {
      disposed = true
      cancelIdle()
      cleanup()
    }
  }, [reducedMotion])

  return (
    <div
      ref={host}
      data-persona={persona}
      data-hero-rings={live ? 'webgl' : 'static'}
      {...staticAttr(reducedMotion)}
      className={cn('relative aspect-square w-full', className)}
    >
      <div className={cn('absolute inset-0 transition-opacity duration-700', live && 'opacity-0')}>
        <StaticRings />
      </div>
    </div>
  )
}
