import type { LocaleDict } from './keys'

export const en: LocaleDict = {
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.backToHome': 'Back to home',
  'common.songNotFound': 'Song not found',
  'common.artistNotFound': 'Artist not found',
  'common.noContent': 'No content',
  'common.found': 'Found',
  'common.nothingFound': 'Nothing found',

  'header.appName': 'ChordMaster',
  'header.lightTheme': 'Light theme',
  'header.darkTheme': 'Dark theme',
  'header.lightThemeAria': 'Switch to light theme',
  'header.darkThemeAria': 'Switch to dark theme',
  'header.createArtist': 'Create artist',
  'header.createSong': 'Create song',
  'header.nav.artists': 'Artists',
  'header.nav.songs': 'Songs',
  'header.nav.favorites': 'Favorites',

  'search.label': 'Search artists and songs',
  'search.placeholder': 'Search...',
  'search.artists': 'Artists',
  'search.songs': 'Songs',
  'search.artistFoundForQuery': 'Artist found for «{query}»',

  'song.tonality': 'Key',

  'artist.songs': 'Songs',
  'artist.noSongs': 'No songs',
  'artist.follow': 'Follow',
  'artist.unfollow': 'Unfollow',

  'artists.pageSubtitle': 'Browse artists and quickly jump to their songs.',
  'artists.viewSongs': 'View songs',
  'artists.countEnOne': 'artist',
  'artists.countEnOther': 'artists',
  'artists.countRuOne': 'исполнитель',
  'artists.countRuFew': 'исполнителя',
  'artists.countRuMany': 'исполнителей',
  'artists.emptyLibrary':
    'No artists in your library yet. Create one with the button above.',

  'songsPage.title': 'Song Library',
  'songsPage.subtitle': 'Browse songs and open full chords and tabs.',
  'songs.tableTitle': 'Title',
  'songs.tableArtist': 'Artist',
  'songs.tableSlug': 'Slug',
  'songs.listFooter': 'Showing {shown} of {total} songs',
  'songs.rowActions': 'Song actions',
  'songs.edit': 'Edit',
  'songs.delete': 'Delete',
  'songs.deleteConfirmTitle': 'Delete song?',
  'songs.deleteConfirmMessage': '“{title}” will be permanently deleted.',
  'songs.deleteConfirm': 'Delete',
  'songs.deleteCancel': 'Cancel',

  'editSong.title': 'Edit song',
  'editSong.subtitle':
    'Change title, key and lyrics with chords. The artist cannot be changed.',
  'editSong.submit': 'Save',
  'editSong.submitting': 'Saving...',
  'editSong.notFound': 'Song not found',

  'favorites.pageSubtitle':
    'Only artists and songs you follow appear here. Use Follow on an artist page or the star on a song.',
  'favorites.bannerTitle': 'Practice now',
  'favorites.bannerText':
    'Resume from songs you saved. Follow artists or star songs to build this list.',
  'favorites.browseSongs': 'Browse songs',
  'favorites.sectionArtists': 'Artists you follow',
  'favorites.sectionSongs': 'Songs you starred',
  'favorites.emptyArtists':
    'No favorite artists yet. Open an artist and tap Follow or the star on their avatar.',
  'favorites.emptySongs':
    'No starred songs yet. Open a song and tap the star in the header.',


  'createSong.title': 'Create song',
  'createSong.artist': 'Artist',
  'createSong.selectArtist': 'Select artist',
  'createSong.songTitle': 'Title',
  'createSong.tonalityOptional': 'Key (number, optional)',
  'createSong.lyricsOptional': 'Lyrics with chords (optional)',
  'createSong.submit': 'Create song',
  'createSong.submitting': 'Creating...',
  'createSong.subtitle':
    'Set artist, title and numeric key (semitones). Optional lyrics editor helps you structure chords above text.',
  'createSong.previewTitle': 'How it will look',
  'createSong.previewText':
    'After saving, the song uses the main song layout with chords above lyrics and chord fingerings on the side.',
  'createSong.statusConnected': 'Connected',
  'createSong.statusDraft': 'Draft song',
  'createSong.noArtistsYet':
    'Add an artist first — open Artists and tap “Create artist”.',
  'createSong.tipSyntax':
    'Use [Am] inside plain text when importing lyrics to automatically place chords above the right words.',

  'createArtist.title': 'Create artist',
  'createArtist.name': 'Name',
  'createArtist.submit': 'Create artist',
  'createArtist.submitting': 'Creating...',
  'createArtist.subtitle':
    'Add a new artist profile to your chord library. The name defines how the artist appears in your collection.',
  'createArtist.tipSyncTitle': 'Automatic sync',
  'createArtist.tipSyncText':
    'Artist data automatically links to its songs so you can update the name in one place.',

  'section.sectionLabel': 'Section name',
  'section.placeholder': 'Verse 1, Chorus...',
  'section.removeSection': 'Remove section',
  'section.removeLine': 'Remove line',
  'section.addLine': '+ Line',
  'section.addSection': '+ Section',

  'segment.selectChord': 'Select chord',
  'segment.textPlaceholder': 'text',
  'segment.insertChordTitle': 'Insert chord here (or Ctrl+Enter in text field)',
  'segment.insertChordAria': 'Insert chord here',

  'lyricsEditor.hint':
    'Editor: click on chord to edit, ⊕ button or Ctrl+Enter in text — insert chord here.',
  'lyricsEditor.pasteFromText': 'Paste from text',
  'lyricsEditor.importTitle': 'Paste from text',
  'lyricsEditor.importHint':
    'Paste text in format [Am] words [C] more words. Line "Chorus:" or "Verse 1:" starts a new section.',
  'lyricsEditor.importPlaceholder': '[F] Thoughts fly away, [Dm] stretch [Am] beyond the horizon...',
  'lyricsEditor.cancel': 'Cancel',
  'lyricsEditor.apply': 'Apply',

  'chordPicker.label': 'Chord picker',
  'chordPicker.otherLabel': 'Other chord',
  'chordPicker.otherPlaceholder': 'Other...',

  'chordCatalog.open': 'All chords…',
  'chordCatalog.title': 'Chord catalog',
  'chordCatalog.searchPlaceholder': 'Search: Am, Bb, A7…',
  'chordCatalog.empty': 'No chords found',
  'chordCatalog.results': 'Found: {count}',
  'chordCatalog.close': 'Close',

  'lyricsBlock.removeSegment': 'Remove segment',
  'lyricsBlock.addSegment': '+ Segment',

  'transpose.label': 'Transpose:',

  'chordPanel.title': 'Chord fingerings',

  'home.heroTitleLine1': 'Every chord, every note.',
  'home.heroTitleLine2': 'Master your favorite songs.',
  'home.heroSubtitle':
    'Search artists, songs and tabs. Save time parsing chords – focus on playing.',
  'home.trendingTitle': 'Trending songs',
  'home.trendingSubtitle': 'Most opened in the last 30 days.',
  'home.trendingEmpty':
    'No views yet — open a few songs and the hottest ones this month will appear here.',
  'home.recentlyAddedTitle': 'Recently added',
  'home.recentlyAddedEmpty':
    'No songs yet. Use “Create artist” and “Create song” in the header to add tracks.',
  'home.topResultsTitle': 'Top match',

  'search.helper': 'Type artist, song or chord name to start.',
  'search.topMatches': 'Top matches below',
  'search.noArtists': 'No artists for this query yet.',
  'search.noSongs': 'No songs for this query yet.',

  'common.view': 'Open',
  'common.favorite': 'Add to favorites',
  'common.removeFavorite': 'Remove from favorites',
  'common.share': 'Share',

  'transpose.original': 'Original',
  'transpose.down': 'Transpose down',
  'transpose.up': 'Transpose up',

  'player.previous': 'Previous song',
  'player.play': 'Play',
  'player.next': 'Next song',
  'player.settings': 'Player settings',
}
