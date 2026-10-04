import Image from 'next/image'

// Skeleton home (S1). Static, no CMS reads: the DB-free build must succeed.
export const dynamic = 'force-static'

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-[var(--content-max)] flex-col justify-center gap-8 px-[var(--gutter)] py-24">
      <div className="flex items-center gap-4">
        <Image src="/brand/stumpnote-mark.svg" alt="" width={56} height={57} priority />
        <span className="font-display text-3xl font-black tracking-tight text-text">StumpNote</span>
      </div>
      <h1 className="max-w-[14ch] font-display text-[clamp(56px,9vw,128px)] font-black leading-[0.9] tracking-[-0.04em] text-text">
        Your cricket, remembered.
      </h1>
      <p className="max-w-[var(--measure)] text-[length:clamp(18px,1.4vw,22px)] leading-normal text-muted">
        A voice-first cricket journal with an AI that remembers your game. The new site is on its way.
        iPhone apps are in TestFlight beta and coming to the App Store.
      </p>
      <p>
        <a
          href="https://app.stumpnote.com"
          className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-semibold text-canvas transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)] hover:-translate-y-0.5"
        >
          Open the web app
        </a>
      </p>
    </div>
  )
}
