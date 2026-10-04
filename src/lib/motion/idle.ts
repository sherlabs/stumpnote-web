type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
  cancelIdleCallback?: (id: number) => void
}

/** Run `fn` when the main thread is idle (timeout fallback for Safari). Returns a cancel function. */
export function whenIdle(fn: () => void, timeout = 1200): () => void {
  if (typeof window === 'undefined') return () => {}
  const w = window as IdleWindow
  if (w.requestIdleCallback && w.cancelIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout })
    return () => w.cancelIdleCallback?.(id)
  }
  const id = window.setTimeout(fn, 200)
  return () => window.clearTimeout(id)
}
