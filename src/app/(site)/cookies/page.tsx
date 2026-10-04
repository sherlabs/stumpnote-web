import { LegalRoute, legalMetadata } from '@/components/legal/LegalRoute'

export const revalidate = 300
export const generateMetadata = () => legalMetadata('cookies')

export default function Page() {
  return <LegalRoute slug="cookies" />
}
