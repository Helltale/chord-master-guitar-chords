/**
 * Typed API client for AmDm Guitar Chords backend.
 * Infrastructure layer: only HTTP and schema types.
 */
import { apiBaseUrl } from '@/config/env'
import type {
  Artist,
  ArtistList,
  ArtistWithSongs,
  ChordList,
  CreateArtistRequest,
  CreateSongRequest,
  Song,
  SongList,
  SearchResult,
  UpdateSongRequest,
} from './schemas'

const base = apiBaseUrl.replace(/\/$/, '')

async function request<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body, ...rest } = options
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  }
  const res = await fetch(url, {
    ...rest,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new ApiError(res.status, text || res.statusText)
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// --- Artists ---

export function listArtists(params?: { limit?: number; offset?: number }): Promise<ArtistList> {
  const sp = new URLSearchParams()
  if (params?.limit != null) sp.set('limit', String(params.limit))
  if (params?.offset != null) sp.set('offset', String(params.offset))
  const q = sp.toString()
  return request<ArtistList>(`/artists${q ? `?${q}` : ''}`)
}

export function createArtist(body: CreateArtistRequest): Promise<Artist> {
  return request<Artist>('/artists', { method: 'POST', body })
}

export function getArtistBySlug(artistSlug: string): Promise<ArtistWithSongs> {
  return request<ArtistWithSongs>(`/artists/${encodeURIComponent(artistSlug)}`)
}

// --- Chords ---

export function listChords(): Promise<ChordList> {
  return request<ChordList>('/chords')
}

// --- Songs ---

export function listSongs(params?: {
  artist_id?: string
  limit?: number
  offset?: number
  sort?: 'title' | 'created_at_desc' | 'opens_30d_desc'
}): Promise<SongList> {
  const sp = new URLSearchParams()
  if (params?.artist_id != null) sp.set('artist_id', params.artist_id)
  if (params?.sort != null) sp.set('sort', params.sort)
  if (params?.limit != null) sp.set('limit', String(params.limit))
  if (params?.offset != null) sp.set('offset', String(params.offset))
  const q = sp.toString()
  return request<SongList>(`/songs${q ? `?${q}` : ''}`)
}

export function createSong(body: CreateSongRequest): Promise<Song> {
  return request<Song>('/songs', { method: 'POST', body })
}

export function getSong(songId: string): Promise<Song> {
  return request<Song>(`/songs/${encodeURIComponent(songId)}`)
}

export function updateSong(songId: string, body: UpdateSongRequest): Promise<Song> {
  return request<Song>(`/songs/${encodeURIComponent(songId)}`, { method: 'PUT', body })
}

export function deleteSong(songId: string): Promise<void> {
  return request<void>(`/songs/${encodeURIComponent(songId)}`, { method: 'DELETE' })
}

export function transposeSong(songId: string, semitones: number): Promise<Song> {
  return request<Song>(
    `/songs/${encodeURIComponent(songId)}/transpose?semitones=${encodeURIComponent(semitones)}`,
    { method: 'POST' }
  )
}

// --- Search ---

/** Response may be new (artists+songs) or legacy (items+total). Normalized to SearchResult. */
export async function search(params: {
  q: string
  limit?: number
  offset?: number
}): Promise<SearchResult> {
  const sp = new URLSearchParams()
  sp.set('q', params.q.trim())
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.offset != null) sp.set('offset', String(params.offset))
  const res = await request<SearchResult & { items?: unknown[]; total?: number }>(
    `/search?${sp.toString()}`
  )
  // Support legacy backend response { items, total } → treat as songs only
  if (!Array.isArray(res.artists) && Array.isArray(res.items)) {
    return {
      artists: [],
      total_artists: 0,
      songs: res.items as SearchResult['songs'],
      total_songs: typeof res.total === 'number' ? res.total : 0,
    }
  }
  return {
    artists: res.artists ?? [],
    total_artists: res.total_artists ?? 0,
    songs: res.songs ?? [],
    total_songs: res.total_songs ?? 0,
  }
}
