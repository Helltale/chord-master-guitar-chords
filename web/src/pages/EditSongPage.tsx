import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '@/contexts/I18nContext'
import { useListArtists, useSong, useUpdateSong } from '@/hooks'
import { CreateSongForm, type SongFormInitial } from '@/components/CreateSongForm'
import type { SongEditorPreviewState } from '@/components/SongEditorPreview'
import { SongEditorWorkspace } from '@/components/SongEditorWorkspace'

export function EditSongPage() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { song, loading: songLoading, error: songError } = useSong(songId)
  const { items: artists, loading: artistsLoading } = useListArtists({ limit: 500 })
  const { submit, loading, error } = useUpdateSong(songId ?? '')
  const [preview, setPreview] = useState<SongEditorPreviewState>(null)

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
      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-8">
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

        <SongEditorWorkspace
          preview={preview}
          form={
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
          }
        />
      </div>
    </div>
  )
}
