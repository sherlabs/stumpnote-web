/**
 * Fixed hairline rings behind everything (root layout, persists across routes). Five concentric rings with
 * different dash patterns rotate very slowly so the motion is visible; one small "ball" orbits the third.
 * Pure SVG + CSS: paused by the global motion-off rules. Decorative.
 */
export function AmbientRings() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute left-1/2 top-[42%] h-[165vmax] w-[165vmax] -translate-x-1/2 -translate-y-1/2"
        fill="none"
      >
        <g className="ambient-rings">
          <circle r="110" stroke="var(--hairline-2)" />
          <circle r="190" stroke="var(--hairline-1)" strokeDasharray="2 14" className="ambient-spin-a" />
          <g className="ambient-spin-b">
            <circle r="290" stroke="var(--hairline-2)" strokeDasharray="620 1200" />
            <circle cx="290" cy="0" r="4.5" fill="var(--accent)" stroke="none" opacity="0.9" />
          </g>
          <circle r="400" stroke="var(--hairline-1)" strokeDasharray="1 9" className="ambient-spin-c" />
          <circle r="520" stroke="var(--hairline-1)" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--accent)_9%,transparent),transparent_70%)]" />
    </div>
  )
}
