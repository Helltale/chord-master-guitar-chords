import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useChords, useSong, useTransposeSong } from '@/hooks'
import { useTranslation } from '@/contexts/I18nContext'
import { useFollows } from '@/contexts/follows'
import { SongContent } from '@/components/SongContent'
import { ChordFingeringPanel } from '@/components/ChordFingeringPanel'
import { TransposeControl } from '@/components/TransposeControl'
import type { Song } from '@/api/schemas'
import { buildChordTabsFromContent } from '@/utils/tabContent'

export function SongPage() {
  const { songId } = useParams<{ songId: string }>()
  const { t } = useTranslation()
  const { song: fetchedSong, loading, error } = useSong(songId)
  const { chords } = useChords()
  const { transpose, loading: transposeLoading } = useTransposeSong(songId)
  const { isSongFollowed, toggleSongFollow } = useFollows()
  const [song, setSong] = useState<Song | null>(null)
  /** Накопленный сдвиг от контента в БД; сервер каждый раз транспонирует исходный JSON заново. */
  const [transposeOffset, setTransposeOffset] = useState(0)

  useEffect(() => {
    setSong(fetchedSong)
  }, [fetchedSong])

  useEffect(() => {
    setTransposeOffset(0)
  }, [songId])

  const handleTranspose = async (delta: number) => {
    const next = transposeOffset + delta
    const updated = await transpose(next)
    if (updated) {
      setTransposeOffset(next)
      setSong(updated)
    }
  }

  if (loading && !song) {
    return (
      <div className="py-8 text-gray-500 dark:text-gray-400">
        {t('common.loading')}
      </div>
    )
  }
  if (error || !song) {
    return (
      <div className="py-8">
        <p className="text-red-600 dark:text-red-400" role="alert">
          {error ? error.message : t('common.songNotFound')}
        </p>
      </div>
    )
  }

  const content = song.content
  const chordTabs = content ? buildChordTabsFromContent(content, chords) : {}
  const songFollowed = isSongFollowed(song.song_id)
  const handleToggleFavorite = () =>
    toggleSongFollow({
      song_id: song.song_id,
      title: song.title,
      slug: song.slug,
      tonality: song.tonality,
    })

  return (
    <div className="flex h-full min-h-0 flex-col -mx-4 -my-6 px-4 py-4 bg-slate-100 transition-colors duration-300 dark:bg-gray-950">
      {/* Sticky in-page header with song info and quick actions */}
      <header className="z-10 mb-4 flex items-center justify-between gap-4 rounded-xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300">
            <span className="text-lg font-semibold">♫</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              {song.title}
            </h1>
            {song.tonality != null && (
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('song.tonality')}: {song.tonality}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-pressed={songFollowed}
            aria-label={
              songFollowed ? t('common.removeFavorite') : t('common.favorite')
            }
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-base transition ${
              songFollowed
                ? 'border-amber-400/60 bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 dark:border-amber-400/50 dark:text-amber-400'
                : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            ★
          </button>
          <div className="hidden md:inline-flex">
            <TransposeControl
              semitonesFromOriginal={transposeOffset}
              onTranspose={handleTranspose}
              loading={transposeLoading}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left sidebar: transpose (mobile) + chord panel */}
        <aside className="hidden w-72 flex-none flex-col gap-6 overflow-y-auto rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm custom-scrollbar dark:border-gray-800 dark:bg-gray-900/80 lg:flex">
          <div className="mb-2 block md:hidden">
            <TransposeControl
              semitonesFromOriginal={transposeOffset}
              onTranspose={handleTranspose}
              loading={transposeLoading}
            />
          </div>
          <ChordFingeringPanel chordTabs={chordTabs} catalog={chords} />
        </aside>

        {/* Main scrollable lyrics/chords area */}
        <main className="custom-scrollbar flex-1 overflow-y-auto rounded-xl border border-gray-200/70 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/90 md:p-8">
          <div className="mx-auto max-w-3xl">
            {content?.sections && content.sections.length > 0 ? (
              <SongContent content={content} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">{t('common.noContent')}</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
