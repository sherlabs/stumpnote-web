import type { Metadata } from 'next'
import { LegalIndex } from '@/components/blocks/LegalIndex'
import { PageHero } from '@/components/pages/PageHero'

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Privacy Policy, Terms of Use, cookies and account deletion for StumpNote.',
  alternates: { canonical: '/legal' },
}

export default function Page() {
  return (
    <>
      <PageHero
        overline="Legal"
        headline="Legal"
        subcopy="The policies and terms that apply to StumpNote."
        size="lg"
        headingId="legal-h"
      />
      <LegalIndex />
    </>
  )
}
