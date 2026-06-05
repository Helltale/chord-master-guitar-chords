import { describe, expect, it } from 'vitest'
import { parseChordShape } from './chordShape'

describe('parseChordShape', () => {
  it('parses valid 6-char shape', () => {
    expect(parseChordShape('x32010')).toEqual([-1, 3, 2, 0, 1, 0])
  })

  it('returns null for invalid shape', () => {
    expect(parseChordShape('bad')).toBeNull()
  })
})
