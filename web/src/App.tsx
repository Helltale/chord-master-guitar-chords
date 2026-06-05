import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { ArtistsPage } from '@/pages/ArtistsPage'
import { SongsPage } from '@/pages/SongsPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { ArtistPage } from '@/pages/ArtistPage'
import { SongPage } from '@/pages/SongPage'
import { CreateArtistPage } from '@/pages/CreateArtistPage'
import { CreateSongPage } from '@/pages/CreateSongPage'
import { EditSongPage } from '@/pages/EditSongPage'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/artist/:artistSlug" element={<ArtistPage />} />
        <Route path="/song/:songId" element={<SongPage />} />
        <Route path="/artists/new" element={<CreateArtistPage />} />
        <Route path="/songs/new" element={<CreateSongPage />} />
        <Route path="/songs/:songId/edit" element={<EditSongPage />} />
      </Route>
    </Routes>
  )
}

export default App
