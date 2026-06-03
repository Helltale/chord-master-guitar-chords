import { useCallback, useState } from 'react'
import { deleteSong } from '@/api/client'

export function useDeleteSong() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const remove = useCallback(async (songId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await deleteSong(songId)
      return true
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}
