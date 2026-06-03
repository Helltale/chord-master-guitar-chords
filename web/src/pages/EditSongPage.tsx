import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '@/contexts/I18nContext'
import type { TabContent } from '@/api/schemas'
import { useListArtists, useSong, useUpdateSong } from '@/hooks'
import { CreateSongForm, type SongFormInitial } from '@/components/CreateSongForm'
import { SongContent } from '@/components/SongContent'

export function EditSongPage() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { song, loading: songLoading, error: songError } = useSong(songId)
  const { items: artists, loading: artistsLoading } = useListArtists({ limit: 500 })
  const { submit, loading, error } = useUpdateSong(songId ?? '')
  const [preview, setPreview] = useState<{
    title: string
    artistName: string
    tonality?: number
    content: TabContent | null
  } | null>(null)

  const formInitial = useMemo<SongFormInitial | null>(() => {
    if (!song?.artist_id) return null
    return {
      artistId: song.artist_id,
      title: song.title,
      tonality: song.tonality,
      content: song.content,
    }
  }, [song])

  const handleSubmit = async (body: Parameters<typeof submit>[0]) => {
    const updated = await submit(body)
    if (updated) {
      navigate(`/song/${updated.song_id}`)
    }
  }

  if (!songId) {
    return (
      <div className="py-8 text-slate-600 dark:text-slate-400">
        <Link to="/songs" className="text-indigo-600 hover:underline dark:text-indigo-300">
          {t('songsPage.title')}
        </Link>
      </div>
    )
  }

  if (songLoading && !song) {
    return (
      <div className="py-8 text-slate-600 dark:text-slate-400">
        {t('common.loading')}
      </div>
    )
  }

  if (songError || !song || !formInitial) {
    return (
      <div className="py-8">
        <p className="text-red-500 dark:text-red-400" role="alert">
          {songError?.message ?? t('editSong.notFound')}
        </p>
        <Link
          to="/songs"
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-300"
        >
          {t('songsPage.title')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500">
            SongCraft Editor
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            {t('editSong.title')}
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            {t('editSong.subtitle')}
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-6 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-[0_16px_52px_rgba(15,23,42,0.08)] transition-[border-color,background-color,box-shadow] duration-300 md:flex-row md:p-6 lg:gap-8 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_26px_70px_rgba(15,23,42,0.9)]">
          <div className="flex-1 border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6 dark:border-slate-800">
            <CreateSongForm
              key={song.song_id}
              mode="edit"
              initial={formInitial}
              artists={artists}
              artistsLoading={artistsLoading}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              onPreviewChange={setPreview}
            />
          </div>

          <aside className="mt-4 flex flex-1 flex-col gap-4 md:mt-0 md:pl-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {t('createSong.previewTitle')}
              </h2>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                {t('createSong.previewText')}
              </p>
            </div>
            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/95 p-4 dark:border-slate-800 dark:bg-slate-950/80">
              {preview && preview.content ? (
                <div className="flex h-full flex-col gap-4">
                  <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {preview.title}
                    </h3>
                    {preview.artistName && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {preview.artistName}
                      </p>
                    )}
                    {typeof preview.tonality === 'number' && (
                      <p className="mt-1 inline-flex rounded-full bg-slate-200/90 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                        {t('song.tonality')}: {preview.tonality}
                      </p>
                    )}
                  </div>
                  <div className="custom-scrollbar flex-1 overflow-y-auto pr-1 text-sm">
                    <SongContent content={preview.content} />
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-xs text-slate-600 dark:text-slate-500">
                  <p>{t('createSong.statusDraft')}</p>
                  <p className="mt-1 text-[11px]">
                    {t('createSong.tipSyntax')}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
