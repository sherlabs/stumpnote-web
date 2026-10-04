'use client'

import { useSyncExternalStore } from 'react'
import { MOTION_STORAGE_KEY } from './init-script'

const MQ = '(prefers-reduced-motion: reduce)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(MQ)
  mq.addEventListener('change', cb)
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
  return () => {
    mq.removeEventListener('change', cb)
    mo.disconnect()
  }
}

function snapshot(): boolean {
  const attr = document.documentElement.getAttribute('data-motion')
  if (attr === 'off') return true
  if (attr === 'on') return false
  return window.matchMedia(MQ).matches
}

/** True when motion must be off: the OS setting or the footer toggle. Server snapshot is false (static final state renders anyway). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false)
}

/** Footer toggle: persists the choice and updates <html data-motion>. */
export function setMotionEnabled(enabled: boolean) {
  document.documentElement.setAttribute('data-motion', enabled ? 'on' : 'off')
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    /* storage can be unavailable (private mode); the attribute still applies for this page */
  }
}
