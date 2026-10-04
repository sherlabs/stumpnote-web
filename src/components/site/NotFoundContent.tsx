import { BailsLoader } from '@/components/signature/BailsLoader'
import { Button } from '@/components/ui/Button'
import { Overline } from '@/components/ui/Overline'

export function NotFoundContent() {
  return (
    <div className="container-x flex min-h-[calc(100svh-68px)] flex-col justify-center gap-8 py-[var(--s-9)]">
      <div className="w-[180px] sm:w-[220px]">
        <BailsLoader />
      </div>
      <div className="flex flex-col gap-5">
        <Overline>404</Overline>
        <h1 className="display-1">Bowled.</h1>
        <p className="body-lg measure max-w-[36ch] text-muted">
          That page is gone. Head back to the crease.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button href="/" arrow>
          Back to home
        </Button>
        <Button href="https://app.stumpnote.com" variant="secondary">
          Open the web app
        </Button>
      </div>
    </div>
  )
}
