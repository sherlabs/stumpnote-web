import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

/**
 * Legal rendering (docs/spec/06-legal-pages.md section 2). Pure and synchronous so it is unit-testable.
 * Import it only from server modules: the markdown stack must never reach a client chunk.
 *
 * Behaviours:
 * 1. Substitution: {{KEY}} becomes the (escaped) value. An empty value counts as unset: the token stays.
 * 2. Review markers: {{LEGAL_REVIEW: free text}} are text, not values; stripped only when LEGAL_REVIEW_DONE is "yes".
 * 3. Notice mode: any {{...}} left after substitution means the route renders the minimal notice, never the draft.
 * 4. Markdown to HTML: GitHub-flavoured, raw HTML is never passed through.
 */

export const LEGAL_KEYS = [
  'COMPANY_LEGAL_NAME',
  'COMPANY_ABN',
  'COMPANY_ADDRESS',
  'PRIVACY_CONTACT_EMAIL',
  'SUPPORT_EMAIL',
  'GOVERNING_LAW',
  'EFFECTIVE_DATE',
  'LAST_UPDATED',
  'POLICY_VERSION',
  'RETENTION_PERIOD',
  'BACKUP_PURGE_DAYS',
  'USAGE_LOG_RETENTION',
  'DELETE_ACCOUNT_PATH',
  'LEGAL_REVIEW',
  'DPO_OR_REPRESENTATIVE',
] as const

export type LegalKey = (typeof LEGAL_KEYS)[number]
export type LegalValueMap = Partial<Record<LegalKey | 'LEGAL_REVIEW_DONE', string | null>>

/** A review marker: `{{LEGAL_REVIEW: text}}`. The colon distinguishes it from the `{{LEGAL_REVIEW}}` value key. */
const MARKER = /[ \t]*\{\{\s*LEGAL_REVIEW\s*:[^}]*\}\}/g
const TOKEN = /\{\{\s*([^}]*?)\s*\}\}/g

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Values are admin-entered text: neutralise markdown syntax as well as HTML so a value can never add formatting or links. */
export function escapeValue(s: string): string {
  return escapeHtml(s.trim()).replace(/([\\`*_[\]~|])/g, '\\$1')
}

export function reviewDone(values: LegalValueMap): boolean {
  return (values.LEGAL_REVIEW_DONE ?? '').trim().toLowerCase() === 'yes'
}

export type Substituted = { text: string; remaining: string[] }

/** Step 1 + 2. `remaining` lists every token (value keys and review markers) still unresolved. */
export function substitute(body: string, values: LegalValueMap): Substituted {
  let text = body
  if (reviewDone(values)) text = text.replace(MARKER, '')
  text = text.replace(TOKEN, (whole, raw: string) => {
    const key = raw.trim()
    if (/^LEGAL_REVIEW\s*:/.test(key)) return whole
    const v = (values as Record<string, string | null | undefined>)[key]
    if (typeof v === 'string' && v.trim() !== '') return escapeValue(v)
    return whole
  })
  const remaining = [...text.matchAll(TOKEN)].map((m) => `{{${m[1]}}}`)
  return { text, remaining }
}

/** True when the page may not be shown: any placeholder or unresolved review marker remains. Same detector for routes and sitemap. */
export function isNoticeMode(body: string, values: LegalValueMap): boolean {
  return substitute(body, values).remaining.length > 0
}

type HNode = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HNode[]
}

/** Wraps every table in a focusable, labelled scroll region so wide tables stay reachable by keyboard and screen reader. */
function rehypeTableScroll() {
  const walk = (node: HNode) => {
    if (!node.children) return
    node.children = node.children.map((child) => {
      walk(child)
      if (child.type === 'element' && child.tagName === 'table') {
        return {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['legal-table'],
            role: 'region',
            tabIndex: 0,
            ariaLabel: 'Table (scrolls sideways on small screens)',
          },
          children: [child],
        }
      }
      return child
    })
  }
  return (tree: HNode) => walk(tree)
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype) // no allowDangerousHtml: raw HTML in markdown is dropped
  .use(rehypeSlug)
  .use(rehypeTableScroll)
  .use(rehypeExternalLinks, { rel: ['noopener', 'noreferrer'], target: '_blank' })
  .use(rehypeStringify)

export function markdownToHtml(md: string): string {
  return String(processor.processSync(md))
}

export type LegalRender =
  { mode: 'notice'; html: ''; remaining: string[] } | { mode: 'full'; html: string; remaining: [] }

/** Placeholder text and draft markers are never emitted: in notice mode no body HTML is produced at all. */
export function renderLegal(body: string, values: LegalValueMap): LegalRender {
  const { text, remaining } = substitute(body, values)
  if (remaining.length > 0) return { mode: 'notice', html: '', remaining }
  return { mode: 'full', html: markdownToHtml(text), remaining: [] }
}

/** The h2 headings of rendered HTML, for a contents list. */
export function htmlHeadings(html: string): Array<{ id: string; text: string }> {
  return [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2]
      .replace(/<[^>]+>/g, '')
      .replace(/&#x26;/g, '&')
      .replace(/&#x3C;/g, '<'),
  }))
}

/** The h2 headings of a body, for a table of contents. */
export function headingsOf(md: string): Array<{ id: string; text: string }> {
  const html = markdownToHtml(md)
  return [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2].replace(/<[^>]+>/g, ''),
  }))
}
