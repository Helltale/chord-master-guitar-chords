import type { TabContent } from '@/api/schemas'
import { SongContent } from '@/components/SongContent'
import { useTranslation } from '@/contexts/I18nContext'
import { useChords } from '@/hooks/useChords'
import { resolveChordTabs } from '@/utils/resolveChordTabs'

export type SongEditorPreviewState = {
  title: string
  artistName: string
  tonality?: number
  content: TabContent | null
} | null

interface SongEditorPreviewProps {
  preview: SongEditorPreviewState
}

export function SongEditorPreview({ preview }: SongEditorPreviewProps) {
  const { t } = useTranslation()
  const { chords } = useChords()
  const chordTabs =
    preview?.content != null ? resolveChordTabs(preview.content, chords) : {}

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {t('createSong.previewTitle')}
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {t('createSong.previewText')}
        </p>
      </div>

      <div className="flex min-h-[20rem] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/95 p-5 dark:border-slate-800 dark:bg-slate-950/80">
        {preview && preview.content ? (
          <>
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {preview.title}
              </h3>
              {preview.artistName && (
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  {preview.artistName}
                </p>
              )}
              {typeof preview.tonality === 'number' && (
                <p className="mt-2 inline-flex rounded-full bg-slate-200/90 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                  {t('song.tonality')}: {preview.tonality}
                </p>
              )}
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto pt-4 pr-1 leading-relaxed">
              <SongContent
                content={preview.content}
                chordTabs={chordTabs}
                catalog={chords}
              />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-sm text-slate-600 dark:text-slate-500">
            <p>{t('createSong.statusDraft')}</p>
            <p className="mt-1 text-xs">{t('createSong.tipSyntax')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
