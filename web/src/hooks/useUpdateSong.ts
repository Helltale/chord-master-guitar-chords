import { useCallback, useState } from 'react'
import { updateSong } from '@/api/client'
import type { Song, UpdateSongRequest } from '@/api/schemas'

export function useUpdateSong(songId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = useCallback(
    async (body: UpdateSongRequest): Promise<Song | null> => {
      setLoading(true)
      setError(null)
      try {
        const song = await updateSong(songId, body)
        return song
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)))
        return null
      } finally {
        setLoading(false)
      }
    },
    [songId]
  )

  return { submit, loading, error }
}
