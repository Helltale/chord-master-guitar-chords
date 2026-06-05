import { useRef, useEffect } from 'react'
import { useTranslation } from '@/contexts/I18nContext'
import { useChords } from '@/hooks/useChords'

interface ChordPickerProps {
  isOpen: boolean
  onClose: () => void
  value: string
  onSelect: (chord: string) => void
}

export function ChordPicker({ isOpen, onClose, value, onSelect }: ChordPickerProps) {
  const { t } = useTranslation()
  const { chords } = useChords()
  const customInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && customInputRef.current) {
      customInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 z-20 mt-1 w-64 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 shadow-lg"
      role="listbox"
      aria-label={t('chordPicker.label')}
    >
      <div className="mb-2 grid grid-cols-4 gap-1">
        {chords.map((chord) => (
          <button
            key={chord.name}
            type="button"
            role="option"
            className={`rounded px-2 py-1 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/50 ${
              value === chord.name ? 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => {
              onSelect(chord.name)
              onClose()
            }}
          >
            {chord.name}
          </button>
        ))}
      </div>
      <div className="flex gap-1 border-t border-gray-100 dark:border-gray-600 pt-2">
        <label className="sr-only" htmlFor="chord-picker-custom">
          {t('chordPicker.otherLabel')}
        </label>
        <input
          id="chord-picker-custom"
          ref={customInputRef}
          type="text"
          placeholder={t('chordPicker.otherPlaceholder')}
          className="flex-1 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = (e.currentTarget.value || '').trim()
              if (v) {
                onSelect(v)
                onClose()
              }
            }
            if (e.key === 'Escape') onClose()
          }}
        />
        <button
          type="button"
          className="rounded bg-indigo-600 dark:bg-indigo-500 px-2 py-1 text-sm text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
          onClick={() => {
            const v = customInputRef.current?.value?.trim()
            if (v) {
              onSelect(v)
              onClose()
            }
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}
