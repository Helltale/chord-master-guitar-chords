import type { ChordDefinition } from '@/api/schemas'
import { useTranslation } from '@/contexts/I18nContext'
import { catalogByName } from '@/utils/resolveChordTabs'
import { ChordDiagram } from './ChordDiagram'

interface ChordFingeringPanelProps {
  chordTabs: Record<string, string>
  catalog?: ChordDefinition[]
}

export function ChordFingeringPanel({ chordTabs, catalog = [] }: ChordFingeringPanelProps) {
  const { t } = useTranslation()
  const entries = Object.entries(chordTabs)
  const byName = catalogByName(catalog)
  if (entries.length === 0) return null

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/95 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-black/40">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {t('chordPanel.title')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(([chord, shape]) => {
          const def = byName.get(chord)
          const usedFrets = (shape.match(/[1-9]/g) ?? []).map(Number)
          const showFretLabel =
            usedFrets.length > 0 && Math.max(...usedFrets) > 3
          const baseFret = showFretLabel ? Math.min(...usedFrets) : null

          return (
            <div
              key={chord}
              className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5 transition-colors hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-black/40"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-300">
                  {chord}
                </span>
                {baseFret != null && (
                  <span className="text-[10px] font-mono text-slate-400">{baseFret}</span>
                )}
              </div>
              <div className="flex flex-1 items-center justify-center">
                <ChordDiagram chord={chord} shape={shape} barre={def?.barre} />
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
