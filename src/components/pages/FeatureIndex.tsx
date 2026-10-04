import { Badge } from '@/components/ui/Badge'
import type { FeatureVM } from '@/lib/cms/content'
import { AREA_LABELS } from '@/seed/data/features'
import type { FeatureArea } from '@/seed/data/features'
import { stripItems } from '@/seed/data/features'
import { FeatureCardLink } from './FeatureCardLink'
import { STATUS_LABEL } from './status'

const AREA_ORDER: FeatureArea[] = [
  'journal-memory',
  'mental-game',
  'game-day',
  'team',
  'coach',
  'parent',
  'platform',
]

/**
 * Feature grid with area filter chips. The filter is pure CSS (radio inputs + :has, see pages.css): no JavaScript,
 * works on the static page, keyboard operable with arrow keys. Cards stay in the DOM so crawlers see all 22.
 */
export function FeatureIndex({ features }: { features: FeatureVM[] }) {
  const areas = AREA_ORDER.filter((a) => features.some((f) => f.area === a))
  return (
    <div className="features-filter">
      <fieldset className="filter-chips">
        <legend className="sr-only">Filter features by area</legend>
        <input type="radio" name="area" id="f-all" defaultChecked className="chip-input" />
        <label htmlFor="f-all" className="chip">
          All
        </label>
        {areas.map((a) => (
          <span key={a} className="contents">
            <input type="radio" name="area" id={`f-${a}`} className="chip-input" />
            <label htmlFor={`f-${a}`} className="chip">
              {AREA_LABELS[a]}
            </label>
          </span>
        ))}
      </fieldset>
      <ul className="features-grid mt-8" role="list">
        {features.map((f, n) => (
          <li key={f.slug} data-area={f.area}>
            <FeatureCardLink f={f} n={n} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Preview and Coming soon: teasers only, never full cards. */
export function ComingSoonStrip() {
  return (
    <ul className="strip" role="list">
      {stripItems.map((s) => (
        <li key={s.title} className="strip-item">
          <Badge status={STATUS_LABEL[s.status]} />
          <p className="title !text-[19px] mt-4">{s.title}</p>
          {s.text && <p className="mt-2 text-[15px] leading-[1.5] text-muted">{s.text}</p>}
        </li>
      ))}
    </ul>
  )
}
