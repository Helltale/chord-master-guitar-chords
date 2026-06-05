import { useCallback, useEffect, useState } from 'react'
import { listChords as listChordsApi } from '@/api/client'
import type { ChordDefinition } from '@/api/schemas'

let cachedChords: ChordDefinition[] | null = null
let cachePromise: Promise<ChordDefinition[]> | null = null

function loadChords(): Promise<ChordDefinition[]> {
  if (cachedChords) {
    return Promise.resolve(cachedChords)
  }
  if (!cachePromise) {
    cachePromise = listChordsApi()
      .then((res) => {
        cachedChords = res.chords ?? []
        return cachedChords
      })
      .catch((err) => {
        cachePromise = null
        throw err
      })
  }
  return cachePromise
}

export function useChords() {
  const [chords, setChords] = useState<ChordDefinition[]>(cachedChords ?? [])
  const [loading, setLoading] = useState(!cachedChords)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(() => {
    cachedChords = null
    cachePromise = null
    setLoading(true)
    setError(null)
    return loadChords()
      .then((list) => {
        setChords(list)
      })
      .catch((e: Error) => {
        setError(e)
        setChords([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (cachedChords) {
      setChords(cachedChords)
      setLoading(false)
      return
    }
    refetch()
  }, [refetch])

  const presets = chords.filter((ch) => ch.is_preset)

  return { chords, presets, loading, error, refetch }
}
