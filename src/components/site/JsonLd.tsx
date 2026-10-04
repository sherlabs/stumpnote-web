import { serializeLd } from '@/lib/seo/jsonld'

/** One JSON-LD block. Server component. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(data) }} />
  )
}
