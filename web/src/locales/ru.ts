import type { LocaleDict } from './keys'

export const ru: LocaleDict = {
  'common.loading': 'Загрузка...',
  'common.error': 'Ошибка',
  'common.backToHome': 'На главную',
  'common.songNotFound': 'Песня не найдена',
  'common.artistNotFound': 'Артист не найден',
  'common.noContent': 'Нет контента',
  'common.found': 'Найдено',
  'common.nothingFound': 'Ничего не найдено',

  'header.appName': 'ChordMaster',
  'header.lightTheme': 'Светлая тема',
  'header.darkTheme': 'Тёмная тема',
  'header.lightThemeAria': 'Включить светлую тему',
  'header.darkThemeAria': 'Включить тёмную тему',
  'header.createArtist': 'Создать артиста',
  'header.createSong': 'Создать песню',
  'header.nav.artists': 'Артисты',
  'header.nav.songs': 'Песни',
  'header.nav.favorites': 'Избранное',

  'search.label': 'Поиск исполнителей и произведений',
  'search.placeholder': 'Поиск...',
  'search.artists': 'Исполнители',
  'search.songs': 'Песни',
  'search.artistFoundForQuery': 'По запросу «{query}» найден исполнитель',

  'song.tonality': 'Тональность',

  'artist.songs': 'Песни',
  'artist.noSongs': 'Нет песен',
  'artist.follow': 'Подписаться',
  'artist.unfollow': 'Отписаться',

  'artists.pageSubtitle':
    'Просматривайте исполнителей и переходите к их песням.',
  'artists.viewSongs': 'К песням',
  'artists.countEnOne': 'artist',
  'artists.countEnOther': 'artists',
  'artists.countRuOne': 'исполнитель',
  'artists.countRuFew': 'исполнителя',
  'artists.countRuMany': 'исполнителей',
  'artists.emptyLibrary':
    'В библиотеке пока нет исполнителей. Создайте первого кнопкой выше.',

  'songsPage.title': 'Библиотека песен',
  'songsPage.subtitle':
    'Просматривайте песни и открывайте аккорды с полными аппликатурами.',
  'songs.tableTitle': 'Название',
  'songs.tableArtist': 'Исполнитель',
  'songs.tableSlug': 'Слаг',
  'songs.listFooter': 'Показано {shown} из {total} песен',
  'songs.rowActions': 'Действия с песней',
  'songs.edit': 'Редактировать',
  'songs.delete': 'Удалить',
  'songs.deleteConfirmTitle': 'Удалить песню?',
  'songs.deleteConfirmMessage': 'Песня «{title}» будет удалена без возможности восстановления.',
  'songs.deleteConfirm': 'Удалить',
  'songs.deleteCancel': 'Отмена',

  'editSong.title': 'Редактировать песню',
  'editSong.subtitle':
    'Измените название, тональность и текст с аккордами. Исполнителя сменить нельзя.',
  'editSong.submit': 'Сохранить',
  'editSong.submitting': 'Сохранение...',
  'editSong.notFound': 'Песня не найдена',

  'favorites.pageSubtitle':
    'Здесь только те артисты и песни, на которые вы подписались или поставили звезду.',
  'favorites.bannerTitle': 'Продолжить занятие',
  'favorites.bannerText':
    'Возвращайтесь к сохранённым песням. Подписка на артиста и звезда у песни — одно и то же избранное.',
  'favorites.browseSongs': 'К списку песен',
  'favorites.sectionArtists': 'Артисты в избранном',
  'favorites.sectionSongs': 'Песни в избранном',
  'favorites.emptyArtists':
    'Пока никого нет. Откройте страницу артиста и нажмите «Подписаться» или звезду на аватаре.',
  'favorites.emptySongs':
    'Пока нет песен. Откройте песню и нажмите звезду в шапке.',


  'createSong.title': 'Создать песню',
  'createSong.artist': 'Артист',
  'createSong.selectArtist': 'Выберите артиста',
  'createSong.songTitle': 'Название',
  'createSong.tonalityOptional': 'Тональность (число, опционально)',
  'createSong.lyricsOptional': 'Текст с аккордами (опционально)',
  'createSong.submit': 'Создать песню',
  'createSong.submitting': 'Создание...',
  'createSong.subtitle':
    'Выберите артиста, задайте название и числовую тональность (в полутонах). Редактор текста помогает расположить аккорды над словами.',
  'createSong.previewTitle': 'Как это будет выглядеть',
  'createSong.previewText':
    'После сохранения песня откроется в основном просмотрщике: аккорды над строками текста и панель аппликатур сбоку.',
  'createSong.statusConnected': 'Подключено',
  'createSong.statusDraft': 'Черновик песни',
  'createSong.noArtistsYet':
    'Сначала создайте исполнителя: раздел «Артисты» → «Создать артиста».',
  'createSong.tipSyntax':
    'Вставляйте аккорды в квадратных скобках внутри текста, например [Am], чтобы при импорте они автоматически встали над нужными словами.',

  'createArtist.title': 'Создать артиста',
  'createArtist.name': 'Имя',
  'createArtist.submit': 'Создать артиста',
  'createArtist.submitting': 'Создание...',
  'createArtist.subtitle':
    'Добавьте нового артиста в библиотеку аккордов. Имя определяет, как он будет отображаться в коллекции.',
  'createArtist.tipSyncTitle': 'Автоматическая связка',
  'createArtist.tipSyncText':
    'Данные артиста автоматически связываются со всеми его песнями, поэтому имя можно менять в одном месте.',

  'section.sectionLabel': 'Название секции',
  'section.placeholder': 'Куплет 1, Припев...',
  'section.removeSection': 'Удалить секцию',
  'section.removeLine': 'Удалить строку',
  'section.addLine': '+ Строка',
  'section.addSection': '+ Секция',

  'segment.selectChord': 'Выбрать аккорд',
  'segment.textPlaceholder': 'текст',
  'segment.insertChordTitle': 'Вставить аккорд здесь (или Ctrl+Enter в поле текста)',
  'segment.insertChordAria': 'Вставить аккорд здесь',

  'lyricsEditor.hint':
    'Редактор: клик по аккорду — изменить, кнопка ⊕ или Ctrl+Enter в тексте — вставить аккорд здесь.',
  'lyricsEditor.pasteFromText': 'Вставить из текста',
  'lyricsEditor.importTitle': 'Вставить из текста',
  'lyricsEditor.importHint':
    'Вставьте текст в формате [Am] слова [C] ещё слова. Строка «Припев:» или «Куплет 1:» начинает новую секцию.',
  'lyricsEditor.importPlaceholder': '[F] Улетают мысли, [Dm] тянутся [Am] за горизонт...',
  'lyricsEditor.cancel': 'Отмена',
  'lyricsEditor.apply': 'Применить',

  'chordPicker.label': 'Выбор аккорда',
  'chordPicker.otherLabel': 'Другой аккорд',
  'chordPicker.otherPlaceholder': 'Другой...',

  'chordCatalog.open': 'Все аккорды…',
  'chordCatalog.title': 'Каталог аккордов',
  'chordCatalog.searchPlaceholder': 'Поиск: Am, Bb, A7…',
  'chordCatalog.empty': 'Ничего не найдено',
  'chordCatalog.results': 'Найдено: {count}',
  'chordCatalog.close': 'Закрыть',

  'lyricsBlock.removeSegment': 'Удалить сегмент',
  'lyricsBlock.addSegment': '+ Сегмент',

  'transpose.label': 'Транспонировать:',

  'chordPanel.title': 'Аппликатуры аккордов',

  'home.heroTitleLine1': 'Каждый аккорд, каждая нота.',
  'home.heroTitleLine2': 'Освой любимые песни.',
  'home.heroSubtitle':
    'Ищи исполнителей, песни и табулатуры. Меньше времени на разбор аккордов — больше на игру.',
  'home.trendingTitle': 'Популярные песни',
  'home.trendingSubtitle': 'Чаще всего открываемые за последние 30 дней.',
  'home.trendingEmpty':
    'Пока нет просмотров — откройте несколько песен, и сюда попадут самые популярные за месяц.',
  'home.recentlyAddedTitle': 'Недавно добавленные',
  'home.recentlyAddedEmpty':
    'Пока нет песен. Добавьте артиста и песню через кнопки «Создать артиста» и «Создать песню» в шапке.',
  'home.topResultsTitle': 'Лучшее совпадение',

  'search.helper': 'Введите имя исполнителя, песню или аккорд, чтобы начать.',
  'search.topMatches': 'Лучшие совпадения ниже',
  'search.noArtists': 'По этому запросу пока нет исполнителей.',
  'search.noSongs': 'По этому запросу пока нет песен.',

  'common.view': 'Открыть',
  'common.favorite': 'В избранное',
  'common.removeFavorite': 'Убрать из избранного',
  'common.share': 'Поделиться',

  'transpose.original': 'Оригинал',
  'transpose.down': 'Транспонировать ниже',
  'transpose.up': 'Транспонировать выше',

  'player.previous': 'Предыдущая песня',
  'player.play': 'Воспроизвести',
  'player.next': 'Следующая песня',
  'player.settings': 'Настройки плеера',
}
