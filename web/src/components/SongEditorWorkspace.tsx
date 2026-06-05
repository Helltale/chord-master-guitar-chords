import type { ReactNode } from 'react'
import { ChordFingeringPanel } from '@/components/ChordFingeringPanel'
import { SongEditorPreview, type SongEditorPreviewState } from '@/components/SongEditorPreview'
import { useChords } from '@/hooks/useChords'
import { resolveChordTabs } from '@/utils/resolveChordTabs'

interface SongEditorWorkspaceProps {
  form: ReactNode
  preview: SongEditorPreviewState
}

export function SongEditorWorkspace({ form, preview }: SongEditorWorkspaceProps) {
  const { chords } = useChords()
  const chordTabs =
    preview?.content != null ? resolveChordTabs(preview.content, chords) : {}

  return (
    <div className="grid flex-1 grid-cols-1 gap-5 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-[0_16px_52px_rgba(15,23,42,0.08)] transition-[border-color,background-color,box-shadow] duration-300 md:p-6 lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)_minmax(14rem,16rem)] lg:gap-6 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_26px_70px_rgba(15,23,42,0.9)]">
      <div className="min-w-0 border-b border-slate-200 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5 dark:border-slate-800">
        {form}
      </div>

      <div className="min-w-0 lg:px-1">
        <SongEditorPreview preview={preview} />
      </div>

      <aside className="min-w-0 border-t border-slate-200 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 dark:border-slate-800">
        <div className="custom-scrollbar lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <ChordFingeringPanel chordTabs={chordTabs} catalog={chords} />
        </div>
      </aside>
    </div>
  )
}
