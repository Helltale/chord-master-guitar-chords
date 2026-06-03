import { describe, expect, it } from 'vitest'
import { formatTabContentAsLyrics } from './formatTabContentAsLyrics'
import { parseLyricsWithChords } from './parseLyricsWithChords'

describe('formatTabContentAsLyrics', () => {
  it('returns empty string for empty content', () => {
    expect(formatTabContentAsLyrics({ sections: [] })).toBe('')
  })

  it('round-trips lyrics with section headers', () => {
    const raw = 'Куплет 1:\n[F] Улетают мысли, [Dm] тянутся\nПрипев:\n[C] Chorus'
    const content = parseLyricsWithChords(raw)
    expect(formatTabContentAsLyrics(content)).toBe(raw)
  })

  it('formats instrumental chords as bracketed tokens', () => {
    const text = formatTabContentAsLyrics({
      sections: [
        {
          type: 'verse',
          label: '',
          blocks: [{ kind: 'instrumental', chords: ['C', 'G', 'Am'] }],
        },
      ],
    })
    expect(text).toBe('[C] [G] [Am]')
  })
})
