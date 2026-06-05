import type { ChordDefinition } from '@/api/schemas'

export function filterChords(chords: ChordDefinition[], query: string): ChordDefinition[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return chords
  return chords.filter((ch) => ch.name.toLowerCase().includes(trimmed))
}
