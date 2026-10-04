/** Beats are marked [[like this]] and land with emphasis as the transcript advances. Original sample copy. */
export const DEFAULT_SCRIPT = [
  'Before you walk out, slow down for a second.',
  'You have faced this bowler in the nets all week, and [[you already know his length]].',
  'The first few balls are not a test. [[Trust your first ten balls]].',
  'Watch it out of the hand, then [[soft hands, balanced head]].',
  'If a thought gets loud, [[breathe out longer than you breathe in]].',
  'One ball at a time. [[The next ball is the only one that matters]].',
]

type Word = { text: string; beat: boolean; line: number }

export function parseScript(script: string[]): Word[] {
  const words: Word[] = []
  script.forEach((line, li) => {
    let beat = false
    let afterClose = false
    line.split(/(\[\[|\]\])/).forEach((chunk) => {
      if (chunk === '[[') {
        beat = true
        afterClose = false
      } else if (chunk === ']]') {
        beat = false
        afterClose = true
      } else {
        // Punctuation that follows a marker directly (e.g. "]]." ) attaches to the previous word.
        const tokens = chunk.split(/\s+/).filter(Boolean)
        const glued =
          afterClose &&
          tokens.length > 0 &&
          !/^\s/.test(chunk) &&
          words.length > 0 &&
          words[words.length - 1].line === li
        tokens.forEach((text, ti) => {
          if (ti === 0 && glued) words[words.length - 1].text += text
          else words.push({ text, beat, line: li })
        })
        afterClose = false
      }
    })
  })
  return words
}
