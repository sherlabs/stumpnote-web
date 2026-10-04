import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { leaks, normalise, scrubIdentifiers, stripReviewBlock } from '../../../scripts/import-legal'

const SRC = `# StumpNote Privacy Policy

**Effective date:** {{EFFECTIVE_DATE}}

## Review block (delete before publishing)

| Placeholder | What is needed |
|---|---|
| \`{{COMPANY_LEGAL_NAME}}\` | internal review text, project ref abcdefghijklmnopqrst, GH #123 |

---

# Privacy Policy

We store data (\`share_cricket\`). Contact \`{{PRIVACY_CONTACT_EMAIL}}\`.

---

## Appendix A

| Data | Where | P |
|---|---|---|
| Email | Supabase Auth and \`profiles\` | Supabase |
| DOB | \`profiles\`, \`guardian_players\` | Supabase |
`

describe('legal importer', () => {
  it('cuts at the first WHOLE-LINE --- (table separator rows do not match)', () => {
    const body = stripReviewBlock(SRC)
    expect(body).not.toContain('Review block')
    expect(body).not.toContain('abcdefghijklmnopqrst')
    expect(body.trimStart().startsWith('# Privacy Policy')).toBe(true)
  })

  it('normalises privacy: no review text, tokens unwrapped, identifiers scrubbed, metadata lines added', () => {
    const out = normalise('privacy', SRC)
    expect(out).toContain('**Effective date:** {{EFFECTIVE_DATE}}')
    expect(out).toContain('**Policy version:** {{POLICY_VERSION}}')
    expect(out).toContain('Contact {{PRIVACY_CONTACT_EMAIL}}.')
    expect(out).not.toContain('share_cricket')
    expect(out).not.toContain('`')
    expect(out).toContain('| Email | Supabase Auth | Supabase |')
    expect(out).toContain('| DOB | Supabase Postgres | Supabase |')
    expect(leaks(out)).toEqual([])
    expect(out).not.toMatch(/^# /m)
  })

  it('flags leaked internals', () => {
    expect(leaks('see lib/features/home/profile_screen.dart')).toContain('source path')
    expect(leaks('GH #123')).toContain('issue number')
    expect(leaks('project ref abcdefghijklmnopqrst')).toContain('project ref')
    expect(leaks('DRAFT FOR LEGAL REVIEW')).toContain('review block')
    expect(leaks('plain public text')).toEqual([])
  })

  it('scrubs backticked names but keeps tokens', () => {
    expect(scrubIdentifiers('a (`x_y`) b {{K}}')).toBe('a b {{K}}')
  })

  it('the committed seed markdown contains no internal content', () => {
    for (const f of ['privacy', 'terms', 'support', 'cookies', 'account-deletion', 'data-safety']) {
      const p = path.join(__dirname, '../../../src/seed/legal', `${f}.md`)
      let text = ''
      try {
        text = readFileSync(p, 'utf8')
      } catch {
        continue // drafted pages arrive in later steps
      }
      expect(leaks(text), f).toEqual([])
      expect(text, f).not.toMatch(/^## Review block/m)
    }
  })
})
