import { LegalHistoryRoute, legalHistoryMetadata } from '@/components/legal/LegalRoute'

export const revalidate = 300
export const metadata = legalHistoryMetadata('privacy')

export default function Page() {
  return <LegalHistoryRoute slug="privacy" />
}
