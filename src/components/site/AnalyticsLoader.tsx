'use client'

import { useEffect } from 'react'
import type { ClientAnalytics } from '@/lib/analytics-config'
import type { TrackEvent } from '@/lib/track'

type Sender = (event: TrackEvent, props?: Record<string, string | number | boolean>) => void

/**
 * Loads AT MOST ONE cookieless analytics snippet, after the browser is idle. Mounted only when a provider is
 * configured (see clientAnalytics), so with none configured no analytics code is shipped or run. No cookie banner is
 * needed: nothing is stored on the device (PostHog cookieless mode, Plausible is cookieless by design).
 */
export function AnalyticsLoader(cfg: ClientAnalytics) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (navigator.doNotTrack === '1') return // honour DNT: never load
    const queue: Array<[TrackEvent, Record<string, string | number | boolean> | undefined]> = []
    window.__snTrack = (e, p) => {
      if (queue.length < 50) queue.push([e, p])
    }
    let cancelled = false
    const install = (send: Sender) => {
      if (cancelled) return
      window.__snTrack = send
      for (const [e, p] of queue.splice(0)) send(e, p)
    }

    const start = async () => {
      try {
        if (cfg.provider === 'posthog') {
          const { default: posthog } = await import('posthog-js')
          posthog.init(cfg.token, {
            api_host: cfg.host,
            cookieless_mode: 'always',
            person_profiles: 'never',
            capture_pageview: 'history_change',
            capture_pageleave: true,
            autocapture: false,
            disable_session_recording: true,
            disable_surveys: true,
            respect_dnt: true,
            capture_performance: { web_vitals: true },
          })
          install((e, p) => posthog.capture(e, p))
        } else {
          const s = document.createElement('script')
          s.defer = true
          s.dataset.domain = cfg.domain
          s.src = `${cfg.host}/js/script.js`
          s.onload = () => {
            const w = window as unknown as {
              plausible?: (e: string, o?: { props: unknown }) => void
            }
            install((e, p) => w.plausible?.(e, p ? { props: p } : undefined))
          }
          document.head.appendChild(s)
        }
      } catch {
        /* a blocked or failed snippet must never affect the page */
      }
    }
    const idle = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
      }
    ).requestIdleCallback
    const handle = idle ? idle(start, { timeout: 4000 }) : window.setTimeout(start, 2000)
    return () => {
      cancelled = true
      if (!idle) window.clearTimeout(handle)
    }
  }, [cfg])
  return null
}
