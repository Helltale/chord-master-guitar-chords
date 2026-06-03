import { useEffect, useState } from 'react'
import type { CreateSongRequest, TabContent, UpdateSongRequest } from '@/api/schemas'
import type { Artist } from '@/api/schemas'
import { useTranslation } from '@/contexts/I18nContext'
import { formatTabContentAsLyrics } from '@/utils/formatTabContentAsLyrics'
import { parseLyricsWithChords } from '@/utils/parseLyricsWithChords'
import { slugFromString } from '@/utils/slug'

export type SongFormInitial = {
  artistId: string
  title: string
  tonality?: number
  content?: TabContent
}

interface CreateSongFormProps {
  mode?: 'create' | 'edit'
  initial?: SongFormInitial
  artists: Artist[]
  artistsLoading: boolean
  onSubmit: (body: CreateSongRequest | UpdateSongRequest) => void
  loading: boolean
  error: Error | null
  defaultArtistId?: string
  onPreviewChange?: (preview: {
    title: string
    artistName: string
    tonality?: number
    content: TabContent | null
  } | null) => void
}

const CHORD_PRESETS = ['G', 'C', 'D', 'Em', 'Am', 'F', 'Bm'] as const

function buildLyricsInitial(content?: TabContent): string {
  if (!content?.sections?.length) return ''
  return formatTabContentAsLyrics(content)
}

export function CreateSongForm({
  mode = 'create',
  initial,
  artists,
  artistsLoading,
  onSubmit,
  loading,
  error,
  defaultArtistId,
  onPreviewChange,
}: CreateSongFormProps) {
  const { t } = useTranslation()
  const isEdit = mode === 'edit'
  const [artistSearch, setArtistSearch] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState(initial?.artistId ?? '')
  const [lyricsText, setLyricsText] = useState(() => buildLyricsInitial(initial?.content))
  const [title, setTitle] = useState(initial?.title ?? '')
  const [tonalityRaw, setTonalityRaw] = useState(
    initial?.tonality != null ? String(initial.tonality) : ''
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const slug = slugFromString(trimmedTitle)
    if (!trimmedTitle || !slug) return
    const tonality = tonalityRaw ? parseInt(tonalityRaw, 10) : undefined
    const contentToSend = lyricsText.trim() ? parseLyricsWithChords(lyricsText) : undefined

    if (isEdit) {
      onSubmit({ title: trimmedTitle, slug, tonality, content: contentToSend })
      return
    }

    if (!selectedArtistId) return
    onSubmit({
      artist_id: selectedArtistId,
      title: trimmedTitle,
      slug,
      tonality,
      content: contentToSend,
    })
  }

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase())
  )
  const visibleArtists = filteredArtists.slice(0, 8)

  useEffect(() => {
    if (isEdit || !defaultArtistId || selectedArtistId) return
    const a = artists.find((artist) => artist.artist_id === defaultArtistId)
    if (!a) return
    setSelectedArtistId(defaultArtistId)
    setArtistSearch(a.name)
  }, [defaultArtistId, artists, selectedArtistId, isEdit])

  useEffect(() => {
    if (!isEdit || !initial) return
    setTitle(initial.title)
    setTonalityRaw(initial.tonality != null ? String(initial.tonality) : '')
    setLyricsText(buildLyricsInitial(initial.content))
    setSelectedArtistId(initial.artistId)
    const artist = artists.find((a) => a.artist_id === initial.artistId)
    if (artist) setArtistSearch(artist.name)
  }, [isEdit, initial, artists])

  useEffect(() => {
    if (!onPreviewChange) return
    const artist = artists.find((a) => a.artist_id === selectedArtistId)
    const trimmedTitle = title.trim()
    const hasContent = lyricsText.trim().length > 0
    if (!artist && !trimmedTitle && !hasContent && !tonalityRaw) {
      onPreviewChange(null)
      return
    }
    const content: TabContent | null = hasContent ? parseLyricsWithChords(lyricsText) : null
    const tonality = tonalityRaw ? parseInt(tonalityRaw, 10) : undefined
    onPreviewChange({
      title: trimmedTitle || initial?.title || 'Untitled song',
      artistName: artist?.name ?? '',
      tonality,
      content,
    })
  }, [artists, selectedArtistId, title, lyricsText, tonalityRaw, onPreviewChange, initial?.title])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200" role="alert">
          {error.message}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
        >
          {t('createSong.artist')}
        </label>
        <input
          type="search"
          value={artistSearch}
          onChange={(e) => setArtistSearch(e.target.value)}
          disabled={artistsLoading || isEdit}
          placeholder={t('search.placeholder')}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-200/80 focus:border-indigo-400 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50 dark:shadow-black/30 dark:ring-slate-900/60"
        />
        <div className="mt-2 max-h-36 space-y-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/95 p-1 dark:border-slate-800 dark:bg-slate-950/70">
          {visibleArtists.length === 0 ? (
            <p className="px-2 py-1 text-xs text-slate-500">
              {artists.length === 0
                ? t('createSong.noArtistsYet')
                : t('search.noArtists')}
            </p>
          ) : (
            visibleArtists.map((a) => (
              <button
                key={a.artist_id}
                type="button"
                disabled={isEdit}
                onClick={() => setSelectedArtistId(a.artist_id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs disabled:cursor-default ${
                  selectedArtistId === a.artist_id
                    ? 'bg-indigo-500/20 text-indigo-800 ring-1 ring-indigo-400 dark:text-indigo-100'
                    : 'bg-transparent text-slate-700 hover:bg-slate-200/80 dark:text-slate-200 dark:hover:bg-slate-900'
                }`}
                aria-pressed={selectedArtistId === a.artist_id}
              >
                <span className="font-medium">{a.name}</span>
                {selectedArtistId === a.artist_id && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                    selected
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="song-title"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
        >
          {t('createSong.songTitle')}
        </label>
        <input
          id="song-title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-200/80 focus:border-indigo-400 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50 dark:shadow-black/30 dark:ring-slate-900/60"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="song-tonality"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
        >
          {t('createSong.tonalityOptional')}
        </label>
        <input
          id="song-tonality"
          name="tonality"
          type="number"
          step={1}
          value={tonalityRaw}
          onChange={(e) => setTonalityRaw(e.target.value)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-200/80 focus:border-indigo-400 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50 dark:shadow-black/30 dark:ring-slate-900/60"
        />
      </div>
      <div>
        <label
          id="song-content-label"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
        >
          {t('createSong.lyricsOptional')}
        </label>
        <textarea
          aria-labelledby="song-content-label"
          value={lyricsText}
          onChange={(e) => setLyricsText(e.target.value)}
          rows={8}
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-inner shadow-slate-900/5 outline-none ring-1 ring-slate-200 focus:border-indigo-400 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:shadow-black/40 dark:ring-slate-900/80"
          placeholder="[Am] Thoughts fly away, [Dm] stretch [F] beyond the horizon..."
        />
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {t(
                'createSong.tipSyntax',
                'Use [Am] inside plain text to place chords above words when parsed.'
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CHORD_PRESETS.map((chord) => (
              <button
                key={chord}
                type="button"
                onClick={() => setLyricsText((prev) => `${prev}${prev ? ' ' : ''}[${chord}] `)}
                className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-500 hover:text-white dark:text-indigo-200"
              >
                {chord}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || artistsLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(79,70,229,0.6)] transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? isEdit
            ? t('editSong.submitting')
            : t('createSong.submitting')
          : isEdit
            ? t('editSong.submit')
            : t('createSong.submit')}
      </button>
    </form>
  )
}
