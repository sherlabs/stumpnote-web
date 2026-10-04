import { describe, expect, it } from 'vitest'
import {
  LEGAL_KEYS,
  escapeHtml,
  headingsOf,
  isNoticeMode,
  renderLegal,
  substitute,
  type LegalValueMap,
} from '@/lib/legal/render'

// Synthetic fixture for tests only. These are NOT real legal values and never ship.
const FIXTURE: LegalValueMap = {
  COMPANY_LEGAL_NAME: 'Test Co Pty Ltd',
  COMPANY_ABN: '00 000 000 000',
  COMPANY_ADDRESS: '1 Example Street, Testville',
  PRIVACY_CONTACT_EMAIL: 'privacy@example.test',
  SUPPORT_EMAIL: 'support@example.test',
  GOVERNING_LAW: 'Testland',
  EFFECTIVE_DATE: '1 January 2030',
  LAST_UPDATED: '2 January 2030',
  POLICY_VERSION: '2030-01-01',
  RETENTION_PERIOD: 'within 30 days',
  BACKUP_PURGE_DAYS: '35',
  USAGE_LOG_RETENTION: '12 months',
  DELETE_ACCOUNT_PATH: 'Profile, then Delete account',
  LEGAL_REVIEW: '14 months',
  DPO_OR_REPRESENTATIVE: 'n/a',
  LEGAL_REVIEW_DONE: 'yes',
}

const BODY = `# T\n\nContact {{PRIVACY_CONTACT_EMAIL}} at {{COMPANY_NAME_UNKNOWN}}.\n\n## Section one\n\nText {{LEGAL_REVIEW: confirm this wording}}.\n\n## Section two\n\nRetention {{LEGAL_REVIEW}}.`

describe('legal render: substitution', () => {
  it('covers all 15 value keys in the fixture', () => {
    for (const k of LEGAL_KEYS) expect(FIXTURE[k], k).toBeTruthy()
  })

  it('replaces a key with its value and leaves unknown keys', () => {
    const r = substitute('a {{SUPPORT_EMAIL}} b {{NOPE}}', FIXTURE)
    expect(r.text).toBe('a support@example.test b {{NOPE}}')
    expect(r.remaining).toEqual(['{{NOPE}}'])
  })

  it('treats an empty or whitespace value as unset', () => {
    expect(substitute('{{SUPPORT_EMAIL}}', { SUPPORT_EMAIL: '' }).remaining).toHaveLength(1)
    expect(substitute('{{SUPPORT_EMAIL}}', { SUPPORT_EMAIL: '   ' }).remaining).toHaveLength(1)
    expect(substitute('{{SUPPORT_EMAIL}}', {}).remaining).toHaveLength(1)
    expect(substitute('{{SUPPORT_EMAIL}}', { SUPPORT_EMAIL: null }).remaining).toHaveLength(1)
  })

  it('escapes HTML in values', () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe(
      '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;',
    )
    const out = renderLegal('Hi {{COMPANY_LEGAL_NAME}}', {
      COMPANY_LEGAL_NAME: '<script>alert(1)</script>',
    })
    expect(out.mode).toBe('full')
    expect(out.html).not.toContain('<script')
    expect(out.html).toContain('&#x3C;script>') // escaped text, not a tag
  })

  it('neutralises markdown syntax in values (no injected links or emphasis)', () => {
    const out = renderLegal('Hi {{COMPANY_LEGAL_NAME}}', {
      COMPANY_LEGAL_NAME: '[x](https://evil.test) *b*',
    })
    expect(out.html).not.toContain('>x</a>') // no markdown link was created from the value
    expect(out.html).not.toContain('<em>')
  })

  it('does not double-substitute (a value containing a token is not re-expanded)', () => {
    const r = substitute('{{COMPANY_LEGAL_NAME}}', {
      COMPANY_LEGAL_NAME: '{{COMPANY_ABN}}',
      COMPANY_ABN: 'x',
    })
    expect(r.text).not.toContain('x') // COMPANY_ABN was not expanded inside the value
    expect(r.remaining).toHaveLength(1) // a value that smuggles a token keeps the page in notice mode (safe direction)
  })
})

describe('legal render: review markers', () => {
  it('keeps markers as placeholders until LEGAL_REVIEW_DONE is yes', () => {
    const v = { ...FIXTURE, LEGAL_REVIEW_DONE: '' }
    const r = substitute('Text {{LEGAL_REVIEW: confirm}} end', v)
    expect(r.remaining).toEqual(['{{LEGAL_REVIEW: confirm}}'])
  })

  it('strips markers (and the space before them) when review is done', () => {
    const r = substitute('Text {{LEGAL_REVIEW: confirm}}. End', FIXTURE)
    expect(r.text).toBe('Text. End')
    expect(r.remaining).toEqual([])
  })

  it('distinguishes the {{LEGAL_REVIEW}} value key from a marker', () => {
    const v = { LEGAL_REVIEW: '14 months', LEGAL_REVIEW_DONE: '' }
    const r = substitute('Kept {{LEGAL_REVIEW}} {{LEGAL_REVIEW: confirm}}', v)
    expect(r.text.startsWith('Kept 14 months')).toBe(true)
    expect(r.remaining).toEqual(['{{LEGAL_REVIEW: confirm}}'])
  })

  it('an unset {{LEGAL_REVIEW}} key stays a placeholder even when review is done', () => {
    const r = substitute('Kept {{LEGAL_REVIEW}}', { LEGAL_REVIEW_DONE: 'yes' })
    expect(r.remaining).toEqual(['{{LEGAL_REVIEW}}'])
  })
})

describe('legal render: notice mode', () => {
  it('is notice mode with empty values and never emits body HTML', () => {
    const out = renderLegal(BODY, {})
    expect(out.mode).toBe('notice')
    expect(out.html).toBe('')
    expect(isNoticeMode(BODY, {})).toBe(true)
  })

  it('stays notice mode when only one placeholder remains', () => {
    const out = renderLegal(BODY, FIXTURE) // {{COMPANY_NAME_UNKNOWN}} is not a known key
    expect(out.mode).toBe('notice')
  })

  it('renders the full page with a complete fixture and leaves no braces', () => {
    const out = renderLegal(
      BODY.replace('{{COMPANY_NAME_UNKNOWN}}', '{{COMPANY_LEGAL_NAME}}'),
      FIXTURE,
    )
    expect(out.mode).toBe('full')
    expect(out.html).toContain('privacy@example.test')
    expect(out.html).toContain('Test Co Pty Ltd')
    expect(out.html).not.toContain('{{')
    expect(out.html).not.toContain('}}')
  })
})

describe('legal render: markdown', () => {
  const full = (md: string) => renderLegal(md, FIXTURE)

  it('renders GFM tables and heading anchors', () => {
    const out = full('## A heading\n\n| a | b |\n|---|---|\n| 1 | 2 |\n')
    expect(out.html).toContain('<h2 id="a-heading">A heading</h2>')
    expect(out.html).toContain('<table>')
  })

  it('drops raw HTML', () => {
    const out = full('Hello <script>alert(1)</script> <img src=x onerror=alert(1)> world')
    expect(out.html).not.toContain('<script')
    expect(out.html).not.toContain('<img')
    expect(out.html).not.toContain('onerror')
  })

  it('opens external links safely and keeps internal links relative', () => {
    const out = full('[Apple](https://www.apple.com/legal/) and [Privacy](/privacy)')
    expect(out.html).toContain('rel="noopener noreferrer"')
    expect(out.html).toContain('href="/privacy"')
    expect(out.html.match(/target="_blank"/g)).toHaveLength(1)
  })

  it('lists h2 headings for a contents list', () => {
    expect(headingsOf('## One\n\ntext\n\n## Two & three\n')).toEqual([
      { id: 'one', text: 'One' },
      { id: 'two--three', text: 'Two &#x26; three' },
    ])
  })
})

describe('legal render: tables', () => {
  it('wraps tables in a focusable labelled region', () => {
    const out = renderLegal('| a | b |\n|---|---|\n| 1 | 2 |\n', FIXTURE)
    expect(out.html).toContain('class="legal-table"')
    expect(out.html).toContain('tabindex="0"')
    expect(out.html).toContain('role="region"')
    expect(out.html).toContain('aria-label=')
  })
})
