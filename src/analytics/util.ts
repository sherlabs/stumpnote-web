/** Clamp to an integer in [min, max]. The only way a number reaches a provider query or SQL string. */
export const int = (value: number, min: number, max: number): number => {
  const v = Math.trunc(Number(value))
  if (!Number.isFinite(v)) return min
  return Math.min(max, Math.max(min, v))
}
