/** Categorical chart colours: the four persona accents (tokens from src/styles/tokens.css), then muted for "other". */
export const SERIES = [
  'var(--accent-player)',
  'var(--accent-coach)',
  'var(--accent-parent)',
  'var(--accent-team)',
] as const
export const OTHER = 'var(--an-muted)'
export const seriesColor = (i: number): string => SERIES[i] ?? OTHER
export const PERSONA_COLOR: Record<string, string> = {
  player: 'var(--accent-player)',
  coach: 'var(--accent-coach)',
  parent: 'var(--accent-parent)',
  team: 'var(--accent-team)',
}
export const personaTone = (p: string): 'player' | 'coach' | 'parent' | 'team' =>
  p === 'coach' || p === 'parent' || p === 'team' ? p : 'player'
