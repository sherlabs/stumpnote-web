'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { serverURLClient } from '@/lib/env-client'

/** Re-renders the preview route whenever the editor saves a draft in the admin (Payload Live Preview). */
export function PreviewRefresh() {
  const router = useRouter()
  return <RefreshRouteOnSave serverURL={serverURLClient()} refresh={() => router.refresh()} />
}
