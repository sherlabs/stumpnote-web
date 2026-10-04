import 'server-only'
import type { Payload } from 'payload'
import { faqAnswer, faqSeeds } from '@/seed/data/faqs'
import type { FaqSeed } from '@/seed/data/faqs'
import { featureSeeds } from '@/seed/data/features'
import type { FeatureSeed } from '@/seed/data/features'
import { personaSeeds } from '@/seed/data/personas'
import type { PersonaSeed } from '@/seed/data/personas'
import { betaAccessSeed, navigationSeed, siteSettingsSeed } from '@/seed/globals'
import { contentPageBySlug } from '@/seed/pages/content-pages'
import type { LexicalRoot } from '@/seed/lexical'
import type { ChangelogEntry, Faq, Feature, Media, Page, Persona, Post } from '@/payload-types'
import { DEFAULT_BETA, getBetaState } from './home'
import type { BetaState } from './home'
import { getPayloadOrNull } from './payload'
import { APPLE_EULA_URL, navItem } from '@/lib/site-config'
import type { NavItem } from '@/lib/site-config'

/**
 * Content reads for the S4 routes. Every function returns CMS data when a database is attached and has the
 * document, and the typed seed otherwise, so every route renders in the DB-free production deploy and never 500s.
 * `draft: true` (Live Preview only, after the route verified a staff session) reads unpublished drafts.
 */
export type ReadOpts = { draft?: boolean }

const featureIcon = Object.fromEntries(featureSeeds.map((f) => [f.slug, f.icon]))
const AREA_ICON: Record<string, string> = {
  'journal-memory': 'Brain',
  'mental-game': 'Headphones',
  'game-day': 'Target',
  team: 'Users',
  coach: 'MessageCircle',
  parent: 'ShieldCheck',
  platform: 'GalleryHorizontal',
}

export type FeatureVM = Omit<FeatureSeed, 'copyRules'> & {
  media?: { url: string; alt: string; width?: number; height?: number }
}
export type FaqVM = {
  slug: string
  question: string
  answer: LexicalRoot | NonNullable<Faq['answer']>
  paragraphs?: string[]
  category: string
  personas: string[]
  order: number
}
export type PersonaVM = Omit<PersonaSeed, 'featureBlocks' | 'faqs'> & {
  features: FeatureVM[]
  faqList: FaqVM[]
}
export type PageVM = {
  title: string
  slug: string
  persona: 'player' | 'coach' | 'parent' | 'team' | 'none'
  hero: NonNullable<Page['hero']>
  layout: NonNullable<Page['layout']>
  metaTitle?: string
  metaDescription?: string
  noindex: boolean
  source: 'cms' | 'fallback'
}

const draftArgs = (o?: ReadOpts) => (o?.draft ? { draft: true, overrideAccess: true } : {})

function mediaOf(m: number | Media | null | undefined): FeatureVM['media'] {
  if (!m || typeof m !== 'object' || !m.url) return undefined
  return {
    url: m.sizes?.hero?.url || m.url,
    alt: m.alt,
    width: m.sizes?.hero?.width ?? m.width ?? undefined,
    height: m.sizes?.hero?.height ?? m.height ?? undefined,
  }
}

function featureFromSeed(f: FeatureSeed): FeatureVM {
  const { copyRules: _internal, ...rest } = f
  return rest
}

function featureFromDoc(d: Feature): FeatureVM {
  return {
    slug: d.slug,
    title: d.title,
    area: d.area,
    status: d.status,
    benefit: d.benefit ?? '',
    bullets: (d.bullets ?? []).map((b) => b.text),
    howItWorks: d.howItWorks ?? '',
    scenario: { persona: d.scenario?.persona ?? '', text: d.scenario?.text ?? '' },
    demo: d.demo ?? 'none',
    personas: d.personas ?? [],
    related: (d.related ?? [])
      .map((r) => (typeof r === 'object' && r ? r.slug : ''))
      .filter(Boolean),
    order: d.order ?? 100,
    comingSoonTeaser: d.comingSoonTeaser ?? undefined,
    icon: featureIcon[d.slug] ?? AREA_ICON[d.area] ?? 'Mic',
    media: mediaOf(d.media),
  }
}

function faqFromSeed(f: FaqSeed): FaqVM {
  return {
    slug: f.slug,
    question: f.question,
    answer: faqAnswer(f),
    paragraphs: f.paragraphs,
    category: f.category,
    personas: f.personas,
    order: f.order,
  }
}

function faqFromDoc(d: Faq): FaqVM {
  return {
    slug: d.slug,
    question: d.question,
    answer: d.answer,
    category: d.category ?? 'general',
    personas: d.personas ?? [],
    order: d.order ?? 100,
  }
}

const fallbackFeatures = () => featureSeeds.map(featureFromSeed).sort((a, b) => a.order - b.order)
const fallbackFaqs = () => faqSeeds.map(faqFromSeed).sort((a, b) => a.order - b.order)

async function withPayload<T>(
  read: (p: Payload) => Promise<T | null>,
  fallback: () => T,
): Promise<{ value: T; source: 'cms' | 'fallback' }> {
  const payload = await getPayloadOrNull()
  if (!payload) return { value: fallback(), source: 'fallback' }
  try {
    const v = await read(payload)
    return v === null ? { value: fallback(), source: 'fallback' } : { value: v, source: 'cms' }
  } catch {
    return { value: fallback(), source: 'fallback' }
  }
}

export async function getFeatures(o?: ReadOpts): Promise<FeatureVM[]> {
  const { value } = await withPayload(async (p) => {
    const r = await p.find({
      collection: 'features',
      limit: 100,
      depth: 1,
      pagination: false,
      sort: 'order',
      ...draftArgs(o),
    })
    return r.docs.length ? r.docs.map(featureFromDoc) : null
  }, fallbackFeatures)
  return value
}

export async function getFeature(slug: string, o?: ReadOpts) {
  const all = await getFeatures(o)
  const feature = all.find((f) => f.slug === slug)
  if (!feature) return null
  const related = feature.related
    .map((s) => all.find((f) => f.slug === s))
    .filter((f): f is FeatureVM => Boolean(f))
  return { feature, related, all }
}

export async function getFaqs(o?: ReadOpts & { category?: string }): Promise<FaqVM[]> {
  const { value } = await withPayload(async (p) => {
    const r = await p.find({
      collection: 'faqs',
      limit: 100,
      depth: 0,
      pagination: false,
      sort: 'order',
      ...draftArgs(o),
    })
    return r.docs.length ? r.docs.map(faqFromDoc) : null
  }, fallbackFaqs)
  return o?.category ? value.filter((f) => f.category === o.category) : value
}

function personaFromSeed(seed: PersonaSeed, features: FeatureVM[], faqs: FaqVM[]): PersonaVM {
  const { featureBlocks, faqs: faqSlugs, ...rest } = seed
  return {
    ...rest,
    features: featureBlocks
      .map((s) => features.find((f) => f.slug === s))
      .filter((f): f is FeatureVM => Boolean(f)),
    faqList: faqSlugs
      .map((s) => faqs.find((f) => f.slug === s))
      .filter((f): f is FaqVM => Boolean(f)),
  }
}

function personaFromDoc(d: Persona, routeBySlug: Record<string, string | null>): PersonaVM {
  const docs = <T extends { slug: string }>(list?: (number | T)[] | null): T[] =>
    (list ?? []).filter((x): x is T => typeof x === 'object' && x !== null)
  const lead = d.lead?.heading
    ? {
        heading: d.lead.heading,
        body: d.lead.body ?? '',
        items: (d.lead.items ?? []).map((i) => ({ title: i.title, text: i.text })),
      }
    : undefined
  return {
    slug: d.slug as PersonaVM['slug'],
    title: d.title,
    eyebrow: d.eyebrow ?? '',
    accent: d.accent ?? 'player',
    headline: d.headline ?? d.title,
    subcopy: d.subcopy ?? '',
    proofPoints: (d.proofPoints ?? []).map((p) => p.text),
    leadWith: d.leadWith ?? 'default',
    lead,
    route: routeBySlug[d.slug] ?? `/${d.slug}`,
    metaTitle: d.meta?.title ?? `${d.title} | StumpNote`,
    metaDescription: d.meta?.description ?? d.subcopy ?? '',
    features: docs<Feature>(d.featureBlocks).map(featureFromDoc),
    faqList: docs<Faq>(d.faqs).map(faqFromDoc),
  }
}

export async function getPersonas(o?: ReadOpts): Promise<PersonaVM[]> {
  const features = await getFeatures(o)
  const faqs = await getFaqs(o)
  const routeBySlug = Object.fromEntries(personaSeeds.map((p) => [p.slug, p.route]))
  const { value } = await withPayload(
    async (p) => {
      const r = await p.find({
        collection: 'personas',
        limit: 20,
        depth: 2,
        pagination: false,
        ...draftArgs(o),
      })
      return r.docs.length ? r.docs.map((d) => personaFromDoc(d, routeBySlug)) : null
    },
    () => personaSeeds.map((s) => personaFromSeed(s, features, faqs)),
  )
  // Keep the canonical order of the brief regardless of source.
  const order = personaSeeds.map((p) => p.slug as string)
  return [...value].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
}

export async function getPersona(slug: string, o?: ReadOpts) {
  return (await getPersonas(o)).find((p) => p.slug === slug) ?? null
}

/** A CMS `pages` document by slug, or the seed for the four built-in content pages. Other slugs exist only in the CMS. */
export async function getContentPage(slug: string, o?: ReadOpts): Promise<PageVM | null> {
  const seed = contentPageBySlug[slug]
  const fromSeed = (): PageVM | null =>
    seed
      ? {
          title: seed.title,
          slug: seed.slug,
          persona: seed.persona ?? 'none',
          hero: seed.hero ?? { type: 'none' },
          layout: seed.layout ?? [],
          metaTitle: seed.metaTitle,
          metaDescription: seed.metaDescription,
          noindex: false,
          source: 'fallback',
        }
      : null
  const payload = await getPayloadOrNull()
  if (!payload) return fromSeed()
  try {
    const r = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      pagination: false,
      ...draftArgs(o),
    })
    const d = r.docs[0]
    if (!d) return fromSeed()
    return {
      title: d.title,
      slug: d.slug,
      persona: d.persona ?? 'none',
      hero: d.hero ?? { type: 'none' },
      layout: d.layout ?? [],
      metaTitle: d.meta?.title ?? seed?.metaTitle ?? `${d.title} | StumpNote`,
      metaDescription: d.meta?.description ?? seed?.metaDescription,
      noindex: Boolean(d.noindex),
      source: 'cms',
    }
  } catch {
    return fromSeed()
  }
}

export type PostVM = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string | null
  authorName: string
  tags: string[]
  content: Post['content']
  coverImage?: FeatureVM['media']
}

const postFromDoc = (d: Post): PostVM => ({
  slug: d.slug,
  title: d.title,
  excerpt: d.excerpt ?? '',
  publishedAt: d.publishedAt ?? d.createdAt,
  authorName: d.authorName || 'The StumpNote team',
  tags: (d.tags ?? []).map((t) => t.tag),
  content: d.content ?? null,
  coverImage: mediaOf(d.coverImage),
})

export async function getPosts(o?: ReadOpts): Promise<PostVM[]> {
  const { value } = await withPayload(
    async (p) => {
      const r = await p.find({
        collection: 'posts',
        limit: 100,
        depth: 1,
        pagination: false,
        sort: '-publishedAt',
        ...draftArgs(o),
      })
      return r.docs.map(postFromDoc)
    },
    () => [] as PostVM[],
  )
  return value
}

export async function getPost(slug: string, o?: ReadOpts): Promise<PostVM | null> {
  return (await getPosts(o)).find((p) => p.slug === slug) ?? null
}

export type ChangelogVM = {
  title: string
  date: string
  kind: 'new' | 'improved' | 'fixed'
  apps: string[]
  publicStatus: 'in-beta' | 'available-web'
  summary: ChangelogEntry['summary']
}

export async function getChangelog(o?: ReadOpts): Promise<ChangelogVM[]> {
  const { value } = await withPayload(
    async (p) => {
      const r = await p.find({
        collection: 'changelog-entries',
        limit: 200,
        depth: 0,
        pagination: false,
        sort: '-date',
        ...draftArgs(o),
      })
      return r.docs.map((d) => ({
        title: d.title,
        date: d.date,
        kind: d.kind ?? 'new',
        apps: d.app ?? [],
        publicStatus: d.publicStatus ?? 'in-beta',
        summary: d.summary ?? null,
      }))
    },
    () => [] as ChangelogVM[],
  )
  return value
}

// ---------------------------------------------------------------- site chrome

export type SiteSettingsVM = typeof siteSettingsSeed

export type Chrome = {
  primaryNav: NavItem[]
  cta: NavItem
  footerColumns: Array<{ title: string; items: NavItem[] }>
  settings: SiteSettingsVM
}

const toItems = (list: Array<{ label: string; url: string }> | null | undefined) =>
  (list ?? []).map((i) => navItem(i.label, i.url))

export async function getSettings(): Promise<{ settings: SiteSettingsVM; beta: BetaState }> {
  const payload = await getPayloadOrNull()
  if (!payload) return { settings: siteSettingsSeed, beta: DEFAULT_BETA }
  try {
    const s = await payload.findGlobal({ slug: 'site-settings' })
    return {
      settings: {
        siteName: s.siteName || siteSettingsSeed.siteName,
        tagline: s.tagline ?? siteSettingsSeed.tagline,
        webAppUrl: s.webAppUrl || siteSettingsSeed.webAppUrl,
        showPricing: s.showPricing ?? true,
        showTrialLine: Boolean(s.showTrialLine),
        footerDisclosure: s.footerDisclosure || siteSettingsSeed.footerDisclosure,
        copyrightLine: s.copyrightLine || siteSettingsSeed.copyrightLine,
        motionDefault: s.motionDefault ?? 'auto',
      },
      beta: await getBetaState(),
    }
  } catch {
    return { settings: siteSettingsSeed, beta: DEFAULT_BETA }
  }
}

/** Header, footer and CTA from the Navigation global (code defaults when absent). Pricing disappears when switched off. */
export async function getChrome(): Promise<Chrome> {
  const { settings } = await getSettings()
  let nav: typeof navigationSeed = navigationSeed
  const payload = await getPayloadOrNull()
  if (payload) {
    try {
      const n = await payload.findGlobal({ slug: 'navigation' })
      if (n.headerItems?.length) {
        nav = {
          headerItems: n.headerItems.map((i) => ({ label: i.label, url: i.url })),
          headerCta: {
            label: n.headerCta?.label || navigationSeed.headerCta.label,
            url: n.headerCta?.url || navigationSeed.headerCta.url,
          },
          footerColumns: (n.footerColumns ?? []).map((c) => ({
            heading: c.heading,
            items: (c.items ?? []).map((i) => ({ label: i.label, url: i.url })),
          })),
          footerLegalItems: (n.footerLegalItems ?? []).map((i) => ({ label: i.label, url: i.url })),
        }
      }
    } catch {
      // keep defaults
    }
  }
  const hidePricing = (i: NavItem) => settings.showPricing || i.href !== '/pricing'
  return {
    primaryNav: toItems(nav.headerItems).filter(hidePricing),
    cta: navItem(nav.headerCta.label, nav.headerCta.url),
    footerColumns: [
      ...nav.footerColumns.map((c) => ({
        title: c.heading,
        items: toItems(c.items).filter(hidePricing),
      })),
      {
        title: 'Legal',
        items: [...toItems(nav.footerLegalItems), navItem('Apple standard EULA', APPLE_EULA_URL)],
      },
    ],
    settings,
  }
}

/** One value from the Legal values global (empty string when unset or no database). Never invented. */
export async function getLegalValue(
  key: 'SUPPORT_EMAIL' | 'PRIVACY_CONTACT_EMAIL' | 'COMPANY_LEGAL_NAME',
): Promise<string> {
  const payload = await getPayloadOrNull()
  if (!payload) return ''
  try {
    const g = (await payload.findGlobal({ slug: 'legal-values' })) as unknown as Record<
      string,
      unknown
    >
    const v = g[key]
    return typeof v === 'string' ? v.trim() : ''
  } catch {
    return ''
  }
}

export { betaAccessSeed }
