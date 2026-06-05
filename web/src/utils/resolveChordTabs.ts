import type { ChordDefinition, TabContent } from '@/api/schemas'
import { collectUsedChords } from '@/utils/collectUsedChords'

export function resolveChordTabs(
  content: TabContent,
  catalog: ChordDefinition[] = [],
): Record<string, string> {
  const used = new Set(collectUsedChords(content))
  const catalogByName = new Map(catalog.map((ch) => [ch.name, ch.shape]))
  const out: Record<string, string> = {}

  for (const [name, shape] of Object.entries(content.chord_tabs ?? {})) {
    if (used.has(name) && shape) {
      out[name] = shape
    }
  }

  for (const name of used) {
    if (out[name]) continue
    const shape = catalogByName.get(name)
    if (shape) {
      out[name] = shape
    }
  }

  return out
}

export function catalogByName(
  catalog: ChordDefinition[],
): Map<string, ChordDefinition> {
  return new Map(catalog.map((ch) => [ch.name, ch]))
}
