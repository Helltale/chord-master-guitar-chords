import { useEffect, useMemo, useRef, useState } from 'react'
import { ChordDiagram } from '@/components/ChordDiagram'
import { useTranslation } from '@/contexts/I18nContext'
import { useChords } from '@/hooks/useChords'
import { filterChords } from '@/utils/filterChords'

interface ChordCatalogModalProps {
  open: boolean
  onClose: () => void
  onSelect: (chord: string) => void
}

export function ChordCatalogModal({ open, onClose, onSelect }: ChordCatalogModalProps) {
  const { t } = useTranslation()
  const { chords, loading } = useChords()
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const customRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => filterChords(chords, query), [chords, query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const id = requestAnimationFrame(() => searchRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleSelect = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSelect(trimmed)
    onClose()
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault()
      handleSelect(filtered[0].name)
    }
  }

  const handleCustomSubmit = () => {
    const value = customRef.current?.value ?? ''
    handleSelect(value)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chord-catalog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label={t('chordCatalog.close')}
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2
            id="chord-catalog-title"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300"
          >
            {t('chordCatalog.title')}
          </h2>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('chordCatalog.searchPlaceholder')}
            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-800 focus:border-indigo-500 focus:ring-indigo-500/40"
          />
          {!loading && (
            <p className="mt-2 text-xs text-slate-500">
              {t('chordCatalog.results').replace('{count}', String(filtered.length))}
            </p>
          )}
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-slate-500">{t('common.loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">{t('chordCatalog.empty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((chord) => (
                <button
                  key={chord.name}
                  type="button"
                  aria-label={chord.name}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3 transition hover:border-indigo-500/60 hover:bg-indigo-500/10"
                  onClick={() => handleSelect(chord.name)}
                >
                  <span className="font-mono text-sm font-bold text-indigo-300" aria-hidden>
                    {chord.name}
                  </span>
                  <ChordDiagram
                    chord={chord.name}
                    shape={chord.shape}
                    barre={chord.barre}
                    compact
                    decorative
                    className="h-16 w-14"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-800 px-5 py-4">
          <label className="sr-only" htmlFor="chord-catalog-custom">
            {t('chordPicker.otherLabel')}
          </label>
          <input
            id="chord-catalog-custom"
            ref={customRef}
            type="text"
            placeholder={t('chordPicker.otherPlaceholder')}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCustomSubmit()
              }
            }}
          />
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            onClick={handleCustomSubmit}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
