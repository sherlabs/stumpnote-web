import { Check } from 'lucide-react'
import { Section } from '@/components/site/Section'
import { Overline } from '@/components/ui/Overline'
import { TextLink } from '@/components/ui/TextLink'
import { INDICATIVE_LINE, TRIAL_LINE } from '@/seed/pages/content-pages'
import { APPLE_EULA_URL, isRouteReady } from '@/lib/site-config'
import type { BlockContext, BlockOf } from './types'

/**
 * Indicative pricing (D-14). The indicative line is rendered here, not from CMS data, so an editor cannot remove it,
 * and there is deliberately no buy or subscribe control anywhere in this block.
 */
export function PricingTable({
  block,
  ctx,
}: {
  block: BlockOf<'pricing-table'>
  ctx: BlockContext
}) {
  const plans = block.plans ?? []
  const addons = block.addons ?? []
  const rows = block.comparison ?? []
  return (
    <Section labelledBy="plans-h">
      <div className="flex flex-col gap-5">
        {block.overline && <Overline accent>{block.overline}</Overline>}
        <h2 id="plans-h" className="display-2 max-w-[10ch]">
          {block.heading}
        </h2>
        <p className="indicative-line body-lg max-w-[56ch]">{INDICATIVE_LINE}</p>
      </div>

      <ul className="plan-grid mt-12 lg:mt-16" role="list">
        {plans.map((p, i) => (
          <li key={p.id ?? p.name} className="plan-item">
            <article
              className="plan-card"
              data-highlight={p.highlight ? 'true' : undefined}
              data-plan={p.name}
            >
              <header className="flex items-baseline justify-between gap-3">
                <h3 className="title">{p.name}</h3>
                <span
                  aria-hidden
                  className="plan-num mono-num"
                  data-n={String(i + 1).padStart(2, '0')}
                />
              </header>
              <p className="plan-price mt-8">
                <span className="plan-amount">{p.priceLabel}</span>
                {p.period && <span className="plan-period">{p.period}</span>}
              </p>
              {p.summary && <p className="mt-3 text-[16px] leading-[1.5] text-body">{p.summary}</p>}
              <ul className="mt-7 flex flex-col gap-3" role="list">
                {(p.bullets ?? []).map((b, n) => (
                  <li key={b.id ?? n} className="flex gap-3 text-[16px] leading-[1.45] text-body">
                    <Check
                      aria-hidden
                      size={17}
                      strokeWidth={2.5}
                      className="mt-[3px] shrink-0 text-accent-text"
                    />
                    {b.text}
                  </li>
                ))}
              </ul>
              <p className="indicative-tag mt-auto pt-8">
                Indicative price. Final price shown in the app.
              </p>
            </article>
          </li>
        ))}
      </ul>

      {addons.length > 0 && (
        <ul className="addon-grid mt-5" role="list">
          {addons.map((a) => (
            <li key={a.id ?? a.name} className="addon-card" data-plan={a.name}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="title">{a.name}</h3>
                <p className="plan-price">
                  <span className="plan-amount !text-[28px]">{a.priceLabel}</span>
                  {a.period && <span className="plan-period">{a.period}</span>}
                </p>
              </div>
              {a.text && (
                <p className="mt-3 max-w-[58ch] text-[16px] leading-[1.5] text-body">{a.text}</p>
              )}
              <p className="indicative-tag mt-4">Indicative price. Final price shown in the app.</p>
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 && plans.length > 0 && (
        <div className="compare mt-16 lg:mt-24">
          <h3 className="display-3 mb-8 max-w-[14ch]">Compare plans</h3>
          <div
            className="compare-scroll"
            tabIndex={0}
            role="region"
            aria-label="Plan comparison table"
          >
            <table className="compare-table">
              <caption className="sr-only">
                Comparison of the Free, Player, Pro Player and Team plans
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="compare-corner">
                    <span className="sr-only">Feature</span>
                  </th>
                  {plans.map((p) => (
                    <th key={p.id ?? p.name} scope="col">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id ?? r.row}>
                    <th scope="row">{r.row}</th>
                    {plans.map((p, i) => (
                      <td key={p.id ?? p.name}>{r.values?.[i]?.value ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-14 flex flex-col gap-4 lg:mt-20">
        <ul className="flex flex-col gap-3" role="list">
          {(block.notes ?? []).map((n, i) => (
            <li key={n.id ?? i} className="flex gap-3 text-[17px] text-text">
              <Check
                aria-hidden
                size={18}
                strokeWidth={2.5}
                className="mt-[5px] shrink-0 text-accent-text"
              />
              {n.text}
            </li>
          ))}
          {ctx.showTrialLine && (
            <li className="flex gap-3 text-[17px] text-text">
              <Check
                aria-hidden
                size={18}
                strokeWidth={2.5}
                className="mt-[5px] shrink-0 text-accent-text"
              />
              {TRIAL_LINE}
            </li>
          )}
        </ul>
        {block.footnote && <p className="body-sm max-w-[60ch] text-muted">{block.footnote}</p>}
        <p className="body-sm flex flex-wrap gap-x-5 gap-y-1 text-muted">
          {isRouteReady('/terms') && <TextLink href="/terms">Terms of Use</TextLink>}
          <TextLink href={APPLE_EULA_URL} rel="noopener">
            Apple standard EULA
          </TextLink>
        </p>
      </div>
    </Section>
  )
}
