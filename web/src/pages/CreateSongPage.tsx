import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/contexts/I18nContext'
import { useCreateSong, useListArtists } from '@/hooks'
import { CreateSongForm } from '@/components/CreateSongForm'
import { SongEditorWorkspace } from '@/components/SongEditorWorkspace'
import type { SongEditorPreviewState } from '@/components/SongEditorPreview'

export function CreateSongPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { submit, loading, error } = useCreateSong()
  const { items: artists, loading: artistsLoading } = useListArtists({ limit: 500 })
  const [searchParams] = useSearchParams()
  const defaultArtistId = searchParams.get('artist_id') ?? undefined
  const [preview, setPreview] = useState<SongEditorPreviewState>(null)

  const handleSubmit = async (body: Parameters<typeof submit>[0]) => {
    const song = await submit(body)
    if (song) {
      navigate(`/song/${song.song_id}`)
    }
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6 md:py-10">
      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500">
            SongCraft Editor
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            {t('createSong.title')}
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            {t(
              'createSong.subtitle',
              'Set artist, title and key, then craft lyrics with chords in the editor below.'
            )}
          </p>
        </div>

        <SongEditorWorkspace
          preview={preview}
          form={
            <CreateSongForm
              artists={artists}
              artistsLoading={artistsLoading}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              defaultArtistId={defaultArtistId}
              onPreviewChange={setPreview}
            />
          }
        />
      </div>
    </div>
  )
}
