import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDeleteSong, useListSongs, useListArtists } from '@/hooks'
import { useTranslation } from '@/contexts/I18nContext'
import { useFollows } from '@/contexts/follows'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { RowActionsMenu } from '@/components/RowActionsMenu'
import type { SongListItem } from '@/api/schemas'

export function SongsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, total, loading, error, refetch } = useListSongs({ limit: 500 })
  const { items: artists } = useListArtists({ limit: 500 })
  const { remove, loading: deleteLoading, error: deleteError } = useDeleteSong()
  const { isSongFollowed, toggleSongFollow } = useFollows()
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SongListItem | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((s) => s.title.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q))
  }, [items, query])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const ok = await remove(deleteTarget.song_id)
    if (!ok) return
    if (isSongFollowed(deleteTarget.song_id)) {
      toggleSongFollow({
        song_id: deleteTarget.song_id,
        title: deleteTarget.title,
        slug: deleteTarget.slug,
        tonality: deleteTarget.tonality,
      })
    }
    setDeleteTarget(null)
    refetch()
  }

  if (loading && items.length === 0) {
    return (
      <div className="py-8 text-slate-600 dark:text-slate-400">
        {t('common.loading')}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <p className="text-red-500 dark:text-red-400" role="alert">
          {error.message}
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="relative flex min-h-0 flex-1 flex-col -mx-4 -my-6 overflow-hidden bg-slate-100 px-4 py-8 transition-colors duration-300 dark:bg-slate-950">
      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col gap-8">
        {/* Header */}
        <section className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
              {t('songsPage.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-600 md:text-base dark:text-slate-400">
              {t('songsPage.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/songs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_26px_rgba(99,102,241,0.9)] transition hover:bg-indigo-400"
            >
              <span>＋</span>
              <span>{t('header.createSong')}</span>
            </Link>
          </div>
        </section>

        {/* Filters / search */}
        <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-[0_14px_44px_rgba(15,23,42,0.07)] transition-[border-color,background-color,box-shadow] duration-300 dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_18px_60px_rgba(15,23,42,0.85)]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[220px] flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                🔍
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.label')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100"
              />
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_14px_44px_rgba(15,23,42,0.06)] transition-[border-color,background-color,box-shadow] duration-300 dark:border-slate-800/80 dark:bg-slate-950/90 dark:shadow-[0_18px_60px_rgba(15,23,42,0.85)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm text-slate-800 dark:text-slate-200">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/90 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                  <th className="px-5 py-3">{t('songs.tableTitle')}</th>
                  <th className="px-5 py-3">{t('songs.tableArtist')}</th>
                  <th className="px-5 py-3">{t('songs.tableSlug')}</th>
                  <th className="px-5 py-3 text-right">{t('song.tonality')}</th>
                  <th className="w-12 px-3 py-3">
                    <span className="sr-only">{t('songs.rowActions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/90 dark:divide-slate-800/80">
                {filtered.map((song) => {
                  const artistName =
                    artists.find((a) => a.artist_id === song.artist_id)?.name ?? '—'

                  return (
                    <tr
                      key={song.song_id}
                      className="cursor-pointer bg-white/80 transition hover:bg-indigo-50/50 dark:bg-slate-950/40 dark:hover:bg-slate-900/80"
                    >
                      <td className="px-5 py-3">
                        <Link
                          to={`/song/${song.song_id}`}
                          className="flex items-center gap-3 text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-200"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                            ♪
                          </div>
                          <span className="truncate text-sm font-semibold">{song.title}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-300">{artistName}</td>
                      <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{song.slug}</td>
                      <td className="px-5 py-3 text-right text-xs">
                        {song.tonality != null && (
                          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-300">
                            {song.tonality}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <RowActionsMenu
                          ariaLabel={t('songs.rowActions')}
                          items={[
                            {
                              id: 'edit',
                              label: t('songs.edit'),
                              onSelect: () => navigate(`/songs/${song.song_id}/edit`),
                            },
                            {
                              id: 'delete',
                              label: t('songs.delete'),
                              variant: 'danger',
                              onSelect: () => setDeleteTarget(song),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/90 px-5 py-3 text-xs text-slate-500 dark:border-slate-800/80">
            <span>
              {t('songs.listFooter')
                .replace('{shown}', String(filtered.length))
                .replace('{total}', String(total || filtered.length))}
            </span>
          </div>
        </section>
      </div>
    </div>
    <ConfirmDialog
      open={deleteTarget != null}
      title={t('songs.deleteConfirmTitle')}
      message={
        deleteTarget
          ? t('songs.deleteConfirmMessage').replace('{title}', deleteTarget.title)
          : undefined
      }
      confirmLabel={t('songs.deleteConfirm')}
      cancelLabel={t('songs.deleteCancel')}
      loading={deleteLoading}
      destructive
      onCancel={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
    />
    {deleteError && (
      <p className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-800 shadow-lg dark:text-red-200" role="alert">
        {deleteError.message}
      </p>
    )}
    </>
  )
}

