import { describe, expect, it } from 'vitest'
import type { ChordDefinition } from '@/api/schemas'
import { filterChords } from './filterChords'

const sample: ChordDefinition[] = [
  { name: 'Am', shape: 'x02210', is_preset: true, sort_order: 50 },
  { name: 'Bb', shape: 'x13331', is_preset: false, sort_order: 160 },
  { name: 'A7', shape: 'x02020', is_preset: false, sort_order: 210 },
]

describe('filterChords', () => {
  it('returns all chords for empty query', () => {
    expect(filterChords(sample, '')).toEqual(sample)
    expect(filterChords(sample, '   ')).toEqual(sample)
  })

  it('filters by substring case-insensitively', () => {
    expect(filterChords(sample, 'am').map((c) => c.name)).toEqual(['Am'])
    expect(filterChords(sample, 'A').map((c) => c.name)).toEqual(['Am', 'A7'])
    expect(filterChords(sample, 'bb').map((c) => c.name)).toEqual(['Bb'])
  })

  it('returns empty array when nothing matches', () => {
    expect(filterChords(sample, 'xyz')).toEqual([])
  })
})
