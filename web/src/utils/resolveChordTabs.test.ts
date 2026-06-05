import { describe, expect, it } from 'vitest'
import type { ChordDefinition, TabContent } from '@/api/schemas'
import { resolveChordTabs } from './resolveChordTabs'

const catalog: ChordDefinition[] = [
  { name: 'C', shape: 'x32010', is_preset: true, sort_order: 20 },
  { name: 'Am', shape: 'x02210', is_preset: true, sort_order: 50 },
]

describe('resolveChordTabs', () => {
  it('returns empty map for empty content', () => {
    expect(resolveChordTabs({}, catalog)).toEqual({})
  })

  it('uses explicit chord_tabs when provided', () => {
    const content: TabContent = {
      sections: [{ blocks: [{ kind: 'lyrics', segments: [{ chord: 'C', text: ' hi' }] }] }],
      chord_tabs: { C: 'custom1' },
    }
    expect(resolveChordTabs(content, catalog)).toEqual({ C: 'custom1' })
  })

  it('falls back to catalog for used chords', () => {
    const content: TabContent = {
      sections: [{ blocks: [{ kind: 'lyrics', segments: [{ chord: 'Am', text: 'line' }] }] }],
    }
    expect(resolveChordTabs(content, catalog)).toEqual({ Am: 'x02210' })
  })

  it('ignores catalog chords not used in content', () => {
    const content: TabContent = {
      sections: [{ chord_sequence: ['C'] }],
    }
    const tabs = resolveChordTabs(content, catalog)
    expect(tabs).toEqual({ C: 'x32010' })
    expect(tabs.Am).toBeUndefined()
  })
})
