import { RevealGroup } from '@/components/site/RevealGroup'
import { Section } from '@/components/site/Section'
import { Overline } from '@/components/ui/Overline'
import { TextLink } from '@/components/ui/TextLink'
import { isRouteReady } from '@/lib/site-config'
import { BlockIcon } from './icons'
import type { BlockOf } from './types'

/** Privacy chapter: three calm principles. Motion is intentionally minimal (one fade through data-reveal). */
export function Principles({ block, eager }: { block: BlockOf<'principles'>; eager?: boolean }) {
  const link =
    block.link?.url && block.link.label && isRouteReady(block.link.url) ? block.link : null
  return (
    <Section id="privacy" labelledBy="privacy-h">
      <div className="flex flex-col gap-4">
        {block.overline && <Overline>{block.overline}</Overline>}
        <h2 id="privacy-h" className="display-2 max-w-[14ch]">
          {block.heading}
        </h2>
      </div>
      <RevealGroup
        as="ul"
        className="mt-12 grid gap-px overflow-hidden rounded-3 border border-[var(--hairline-2)] bg-[var(--hairline-2)] lg:mt-16 lg:grid-cols-3"
      >
        {(block.items ?? []).map((it, i) => (
          <li
            key={it.id ?? i}
            data-reveal={eager ? undefined : 'idle'}
            data-reveal-style={eager ? undefined : 'fade'}
            className="flex flex-col gap-5 bg-canvas p-7 md:p-9"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--hairline-3)] text-text">
              <BlockIcon name={it.icon} />
            </span>
            <h3 className="title">{it.title}</h3>
            <p className="text-[16px] leading-[1.6] text-body">{it.text}</p>
          </li>
        ))}
      </RevealGroup>
      {link && (
        <p className="mt-8">
          <TextLink href={link.url as string}>{link.label}</TextLink>
        </p>
      )}
    </Section>
  )
}
