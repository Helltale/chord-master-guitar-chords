import { describe, expect, it } from 'vitest'
import {
  getHangingLeadChord,
  segmentChordForDisplay,
  segmentTextForDisplay,
} from './lyricsLineLayout'

describe('getHangingLeadChord', () => {
  it('returns null when first segment has no chord', () => {
    expect(getHangingLeadChord([{ chord: '', text: '   hello' }])).toBeNull()
  })

  it('returns null when chord is immediately followed by text', () => {
    expect(getHangingLeadChord([{ chord: 'Em', text: 'Что мы' }])).toBeNull()
  })

  it('detects leading chord with whitespace before text', () => {
    expect(getHangingLeadChord([{ chord: 'Em', text: '    Знаешь, од' }])).toEqual({
      chord: 'Em',
      leadingSpaces: 4,
    })
  })
})

describe('segment display helpers', () => {
  const hanging = { chord: 'Em', leadingSpaces: 4 }

  it('strips leading whitespace and hides inline chord for first segment', () => {
    const seg = { chord: 'Em', text: '    Знаешь, од' }
    expect(segmentChordForDisplay(seg, 0, hanging)).toBe('')
    expect(segmentTextForDisplay(seg, 0, hanging)).toBe('Знаешь, од')
  })

  it('keeps later segments unchanged', () => {
    const seg = { chord: 'Em', text: 'нажды' }
    expect(segmentChordForDisplay(seg, 1, hanging)).toBe('Em')
    expect(segmentTextForDisplay(seg, 1, hanging)).toBe('нажды')
  })
})
