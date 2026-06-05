import type { TabContent } from '@/api/schemas'

export function collectUsedChords(content: TabContent): string[] {
  const seen = new Set<string>()
  const list: string[] = []
  const add = (chord: string) => {
    if (!chord || seen.has(chord)) return
    seen.add(chord)
    list.push(chord)
  }

  for (const sec of content.sections ?? []) {
    for (const ch of sec.chord_sequence ?? []) {
      add(ch)
    }
    for (const block of sec.blocks ?? []) {
      if (block.kind === 'instrumental') {
        for (const ch of block.chords ?? []) {
          add(ch)
        }
      } else if (block.kind === 'lyrics') {
        for (const seg of block.segments ?? []) {
          add(seg.chord)
        }
      }
    }
  }
  return list
}
