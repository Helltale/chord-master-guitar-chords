import type { ChordSegment } from '@/api/schemas'

export type HangingLeadChord = {
  chord: string
  leadingSpaces: number
}

/** Leading chord followed by whitespace — text aligns normally, chord hangs in the left margin. */
export function getHangingLeadChord(segments: ChordSegment[]): HangingLeadChord | null {
  const first = segments[0]
  if (!first?.chord) return null

  const match = (first.text ?? '').match(/^(\s+)/)
  if (!match) return null

  return { chord: first.chord, leadingSpaces: match[1].length }
}

export function segmentChordForDisplay(
  seg: ChordSegment,
  index: number,
  hanging: HangingLeadChord | null
): string {
  if (index === 0 && hanging) return ''
  return seg.chord ?? ''
}

export function segmentTextForDisplay(
  seg: ChordSegment,
  index: number,
  hanging: HangingLeadChord | null
): string {
  if (index === 0 && hanging) return (seg.text ?? '').trimStart()
  return seg.text ?? ''
}
