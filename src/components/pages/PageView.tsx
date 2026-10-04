import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { Block, BlockContext } from '@/components/blocks/types'
import { Button } from '@/components/ui/Button'
import { TextLink } from '@/components/ui/TextLink'
import type { PageVM } from '@/lib/cms/content'
import { PageAccent } from './PageAccent'
import { PageHero } from './PageHero'
import type { Persona } from '@/lib/site-config'

/** A CMS `pages` document: optional hero then its layout blocks. Shared by the fixed routes, [slug] and Live Preview. */
export function PageView({
  page,
  ctx,
  extra,
  afterHero,
}: {
  page: PageVM
  ctx: BlockContext
  extra?: React.ReactNode
  /** Rendered between the hero and the blocks (support contact line). */
  afterHero?: React.ReactNode
}) {
  const hero = page.hero
  const persona: Persona | null =
    hero?.type === 'persona' && hero.persona
      ? (hero.persona as Persona)
      : page.persona !== 'none'
        ? (page.persona as Persona)
        : null
  const showHero = hero && hero.type !== 'none' && hero.headline
  return (
    <>
      {persona && persona !== 'player' && <PageAccent persona={persona} />}
      {showHero && (
        <PageHero
          overline={hero.overline}
          headline={hero.headline as string}
          subcopy={hero.subcopy}
          actions={
            hero.primaryCta?.label && hero.primaryCta.url ? (
              <>
                <Button href={hero.primaryCta.url} arrow>
                  {hero.primaryCta.label}
                </Button>
                {hero.secondaryCta?.label && hero.secondaryCta.url && (
                  <TextLink href={hero.secondaryCta.url}>{hero.secondaryCta.label}</TextLink>
                )}
              </>
            ) : undefined
          }
        />
      )}
      {afterHero}
      <RenderBlocks
        blocks={(page.layout ?? []) as Block[]}
        ctx={{ ...ctx, eagerFirst: Boolean(showHero) }}
      />
      {extra}
    </>
  )
}
