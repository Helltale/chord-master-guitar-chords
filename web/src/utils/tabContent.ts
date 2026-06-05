import type { ChordDefinition, TabContent } from '@/api/schemas'
import { resolveChordTabs } from '@/utils/resolveChordTabs'

export function isContentEmpty(content: TabContent): boolean {
  const sections = content.sections ?? []
  if (sections.length === 0) return true
  if (sections.length > 1) return false
  const sec = sections[0]
  const blocks = sec.blocks ?? []
  if (blocks.length === 0) return true
  if (blocks.length > 1) return false
  const segs = blocks[0].segments ?? []
  if (segs.length === 0) return true
  if (segs.length > 1) return false
  const seg = segs[0]
  return !seg.chord && !(seg.text ?? '').trim()
}

export function buildChordTabsFromContent(
  content: TabContent,
  catalog: ChordDefinition[] = [],
): Record<string, string> {
  return resolveChordTabs(content, catalog)
}
