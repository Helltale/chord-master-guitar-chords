export function parseChordShape(shape: string): number[] | null {
  const trimmed = shape.trim()
  if (!trimmed || trimmed.length !== 6) return null
  const frets: number[] = []
  for (const ch of trimmed) {
    if (ch === 'x' || ch === 'X') {
      frets.push(-1)
    } else if (ch === '0') {
      frets.push(0)
    } else if (ch >= '1' && ch <= '9') {
      frets.push(Number(ch))
    } else {
      return null
    }
  }
  return frets
}
