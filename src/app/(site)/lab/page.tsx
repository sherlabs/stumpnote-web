import { LabClient } from './LabClient'

export const metadata = { title: 'Lab', robots: { index: false, follow: false } }
export const dynamic = 'force-static'

// Component demo route (noindex). Server wrapper; every demo lives in the client island so controls can drive them.
export default function LabPage() {
  return <LabClient />
}
