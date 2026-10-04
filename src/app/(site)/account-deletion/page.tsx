import { LegalRoute, legalMetadata } from '@/components/legal/LegalRoute'

export const revalidate = 300
export const generateMetadata = () => legalMetadata('account-deletion')

export default function Page() {
  return <LegalRoute slug="account-deletion" />
}
