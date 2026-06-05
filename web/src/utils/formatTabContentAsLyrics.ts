import type { Block, ChordSegment, TabContent } from '@/api/schemas'

function formatLyricsLine(segments: ChordSegment[]): string {
  return segments
    .map((seg) => `${seg.chord ? `[${seg.chord}]` : ''}${seg.text ?? ''}`)
    .join('')
}

function formatBlock(block: Block): string[] {
  if (block.kind === 'lyrics') {
    return [formatLyricsLine(block.segments ?? [])]
  }
  if (block.kind === 'instrumental') {
    const lines: string[] = []
    if (block.chords?.length) {
      lines.push(block.chords.map((ch) => `[${ch}]`).join(' '))
    }
    if (block.tab?.trim()) {
      lines.push(block.tab.trim())
    }
    return lines.length > 0 ? lines : ['']
  }
  return ['']
}

/** Serializes TabContent into plain text for the create/edit lyrics textarea. */
export function formatTabContentAsLyrics(content: TabContent): string {
  const sections = content.sections ?? []
  if (sections.length === 0) return ''

  const parts: string[] = []
  for (const section of sections) {
    if (section.label) {
      parts.push(`${section.label}:`)
    }
    for (const block of section.blocks ?? []) {
      parts.push(...formatBlock(block))
    }
  }

  return parts.join('\n')
}
