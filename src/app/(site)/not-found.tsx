import { NotFoundContent } from '@/components/site/NotFoundContent'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return <NotFoundContent />
}
