import { LegalRoute, legalMetadata } from '@/components/legal/LegalRoute'

export const revalidate = 300
export const generateMetadata = () => legalMetadata('data-safety')

export default function Page() {
  return <LegalRoute slug="data-safety" />
}
