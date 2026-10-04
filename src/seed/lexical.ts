/**
 * Minimal Lexical document builder for seed and fallback content. The same JSON is stored in Payload (seed) and passed
 * straight to <RichText> (code fallback), so both render identically.
 */
export type LexicalRoot = {
  root: {
    type: 'root'
    format: ''
    indent: 0
    version: 1
    direction: 'ltr'
    children: Array<Record<string, unknown>>
  }
}

const text = (t: string) => ({
  type: 'text',
  text: t,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const paragraph = (t: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [text(t)],
})

const heading = (t: string, tag: 'h2' | 'h3' | 'h4') => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [text(t)],
})

const list = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items.map((t, i) => ({
    type: 'listitem',
    value: i + 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [text(t)],
  })),
})

export type Piece = string | { h2: string } | { h3: string } | { ul: string[] }

/** `lexical('Plain paragraph', { h2: 'Heading' }, { ul: ['a', 'b'] })`. Plain strings become paragraphs. */
export function lexical(...pieces: Piece[]): LexicalRoot {
  const children = pieces.map((p) => {
    if (typeof p === 'string') return paragraph(p)
    if ('h2' in p) return heading(p.h2, 'h2')
    if ('h3' in p) return heading(p.h3, 'h3')
    return list(p.ul)
  })
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}

/** Plain text of a document (used by unit tests and JSON-LD). */
export function lexicalToText(doc: LexicalRoot | null | undefined): string {
  const out: string[] = []
  const walk = (n: unknown) => {
    if (!n || typeof n !== 'object') return
    const node = n as { text?: unknown; children?: unknown[] }
    if (typeof node.text === 'string') out.push(node.text)
    node.children?.forEach(walk)
  }
  walk(doc?.root)
  return out.join(' ')
}
