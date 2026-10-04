import { notFound } from 'next/navigation'
import {
  LegalVersionView,
  legalVersionMetadata,
  loadLegalVersion,
} from '@/components/legal/LegalRoute'

export const revalidate = 300

type Props = { params: Promise<{ policyVersion: string }> }

export async function generateMetadata({ params }: Props) {
  const { policyVersion } = await params
  return legalVersionMetadata('privacy', decodeURIComponent(policyVersion))
}

export default async function Page({ params }: Props) {
  const { policyVersion } = await params
  const view = await loadLegalVersion('privacy', decodeURIComponent(policyVersion))
  if (!view) notFound()
  return <LegalVersionView slug="privacy" view={view} />
}
