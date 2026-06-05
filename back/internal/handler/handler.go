package handler

import (
	"context"
	"errors"
	"maps"
	"strings"
	"time"

	"github.com/Helltale/amdm-guitar-chords/back/internal/cases"
	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
	"github.com/Helltale/amdm-guitar-chords/back/internal/handler/gen"
	"github.com/Helltale/amdm-guitar-chords/back/internal/repository"
)

var _ gen.StrictServerInterface = (*server)(nil)

type server struct {
	artistCases *cases.ArtistCases
	songCases   *cases.SongCases
	chordCases  *cases.ChordCases
}

// NewServer returns the HTTP handler implementation (server is unexported by design).
//
//revive:disable-next-line:unexported-return
func NewServer(artistCases *cases.ArtistCases, songCases *cases.SongCases, chordCases *cases.ChordCases) *server {
	return &server{
		artistCases: artistCases,
		songCases:   songCases,
		chordCases:  chordCases,
	}
}

func (srv *server) ListArtists(
	ctx context.Context,
	request gen.ListArtistsRequestObject,
) (gen.ListArtistsResponseObject, error) {
	limit, offset := 20, 0
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	if request.Params.Offset != nil {
		offset = *request.Params.Offset
	}
	list, total, err := srv.artistCases.List(ctx, limit, offset)
	if err != nil {
		return nil, err
	}
	items := make([]gen.Artist, 0, len(list))
	for _, a := range list {
		items = append(items, srv.artistToAPI(a))
	}
	return gen.ListArtists200JSONResponse{
		Items: &items,
		Total: ptr(int(total)),
	}, nil
}

func (srv *server) CreateArtist(
	ctx context.Context,
	request gen.CreateArtistRequestObject,
) (gen.CreateArtistResponseObject, error) {
	if request.Body == nil {
		return gen.CreateArtist400Response{}, nil
	}
	a, err := srv.artistCases.Create(ctx, request.Body.Name, request.Body.Slug)
	if err != nil {
		// Валидация и дубликат slug — клиентская ошибка (намеренно возвращаем 400, не err).
		//nolint:nilerr // возврат 400 по контракту API при любой ошибке создания
		return gen.CreateArtist400Response{}, nil
	}
	artist := srv.artistToAPI(a)
	return gen.CreateArtist201JSONResponse(artist), nil
}

func (srv *server) GetArtistBySlug(
	ctx context.Context,
	request gen.GetArtistBySlugRequestObject,
) (gen.GetArtistBySlugResponseObject, error) {
	a, err := srv.artistCases.GetBySlug(ctx, request.ArtistSlug)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return gen.GetArtistBySlug404Response{}, nil
		}
		return nil, err
	}
	if a == nil {
		return gen.GetArtistBySlug404Response{}, nil
	}
	songs, err := srv.songCases.ListByArtistID(ctx, a.ArtistID)
	if err != nil {
		return nil, err
	}
	songItems := make([]gen.SongListItem, 0, len(songs))
	for _, s := range songs {
		songItems = append(songItems, srv.songToListItem(s))
	}
	return gen.GetArtistBySlug200JSONResponse{
		ArtistId:  a.ArtistID,
		Name:      a.Name,
		Slug:      a.Slug,
		CreatedAt: timePtr(a.CreatedAt),
		Songs:     &songItems,
	}, nil
}

func (srv *server) ListSongs(
	ctx context.Context,
	request gen.ListSongsRequestObject,
) (gen.ListSongsResponseObject, error) {
	limit, offset := 20, 0
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	if request.Params.Offset != nil {
		offset = *request.Params.Offset
	}
	sort := "title"
	if request.Params.Sort != nil && request.Params.Sort.Valid() {
		sort = string(*request.Params.Sort)
	}
	list, total, err := srv.songCases.List(ctx, request.Params.ArtistId, limit, offset, sort)
	if err != nil {
		return nil, err
	}
	items := make([]gen.SongListItem, 0, len(list))
	for _, s := range list {
		items = append(items, srv.songToListItem(s))
	}
	return gen.ListSongs200JSONResponse{
		Items: &items,
		Total: ptr(int(total)),
	}, nil
}

func (srv *server) Search(
	ctx context.Context,
	request gen.SearchRequestObject,
) (gen.SearchResponseObject, error) {
	limit, offset := 20, 0
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	if request.Params.Offset != nil {
		offset = *request.Params.Offset
	}
	q := strings.TrimSpace(request.Params.Q)
	if q == "" {
		return gen.Search200JSONResponse{
			Artists:      []gen.Artist{},
			TotalArtists: 0,
			Songs:        []gen.SongListItem{},
			TotalSongs:   0,
		}, nil
	}
	artistList, totalArtists, err := srv.artistCases.Search(ctx, q, limit, offset)
	if err != nil {
		return nil, err
	}
	songList, totalSongs, err := srv.songCases.Search(ctx, q, limit, offset)
	if err != nil {
		return nil, err
	}
	artists := make([]gen.Artist, 0, len(artistList))
	for _, a := range artistList {
		artists = append(artists, srv.artistToAPI(a))
	}
	songs := make([]gen.SongListItem, 0, len(songList))
	for _, s := range songList {
		songs = append(songs, srv.songToListItem(s))
	}
	return gen.Search200JSONResponse{
		Artists:      artists,
		TotalArtists: int(totalArtists),
		Songs:        songs,
		TotalSongs:   int(totalSongs),
	}, nil
}

func (srv *server) CreateSong(
	ctx context.Context,
	request gen.CreateSongRequestObject,
) (gen.CreateSongResponseObject, error) {
	if request.Body == nil {
		return gen.CreateSong400Response{}, nil
	}
	tonality := 0
	if request.Body.Tonality != nil {
		tonality = *request.Body.Tonality
	}
	content := tabContentFromAPI(request.Body.Content)
	s, err := srv.songCases.Create(
		ctx,
		request.Body.ArtistId,
		request.Body.Title,
		request.Body.Slug,
		tonality,
		content,
	)
	if err != nil {
		// Валидация и дубликат slug — клиентская ошибка (намеренно возвращаем 400, не err).
		//nolint:nilerr // возврат 400 по контракту API при любой ошибке создания
		return gen.CreateSong400Response{}, nil
	}
	return gen.CreateSong201JSONResponse{
		SongId:    s.SongID,
		ArtistId:  ptr(s.ArtistID),
		Title:     s.Title,
		Slug:      s.Slug,
		Tonality:  ptr(s.Tonality),
		Content:   srv.tabContentToGen(ctx, &s.Content),
		CreatedAt: timePtr(s.CreatedAt),
		UpdatedAt: timePtr(s.UpdatedAt),
	}, nil
}

func (srv *server) GetSong(ctx context.Context, request gen.GetSongRequestObject) (gen.GetSongResponseObject, error) {
	s, err := srv.songCases.GetByID(ctx, request.SongId)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return gen.GetSong404Response{}, nil
		}
		return nil, err
	}
	if s == nil {
		return gen.GetSong404Response{}, nil
	}
	srv.songCases.RecordSongOpen(ctx, s.SongID)
	return gen.GetSong200JSONResponse{
		SongId:    s.SongID,
		ArtistId:  ptr(s.ArtistID),
		Title:     s.Title,
		Slug:      s.Slug,
		Tonality:  ptr(s.Tonality),
		Content:   srv.tabContentToGen(ctx, &s.Content),
		CreatedAt: timePtr(s.CreatedAt),
		UpdatedAt: timePtr(s.UpdatedAt),
	}, nil
}

func (srv *server) UpdateSong(
	ctx context.Context,
	request gen.UpdateSongRequestObject,
) (gen.UpdateSongResponseObject, error) {
	var content *entity.TabContent
	if request.Body != nil && request.Body.Content != nil {
		c := tabContentFromAPI(request.Body.Content)
		content = &c
	}
	var title, slug *string
	var tonality *int
	if request.Body != nil {
		title = request.Body.Title
		slug = request.Body.Slug
		tonality = request.Body.Tonality
	}
	s, err := srv.songCases.Update(ctx, request.SongId, title, slug, tonality, content)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return gen.UpdateSong404Response{}, nil
		}
		return gen.UpdateSong400Response{}, nil
	}
	if s == nil {
		return gen.UpdateSong404Response{}, nil
	}
	return gen.UpdateSong200JSONResponse{
		SongId:    s.SongID,
		ArtistId:  ptr(s.ArtistID),
		Title:     s.Title,
		Slug:      s.Slug,
		Tonality:  ptr(s.Tonality),
		Content:   srv.tabContentToGen(ctx, &s.Content),
		CreatedAt: timePtr(s.CreatedAt),
		UpdatedAt: timePtr(s.UpdatedAt),
	}, nil
}

func (srv *server) DeleteSong(
	ctx context.Context,
	request gen.DeleteSongRequestObject,
) (gen.DeleteSongResponseObject, error) {
	if err := srv.songCases.Delete(ctx, request.SongId); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return gen.DeleteSong404Response{}, nil
		}
		return nil, err
	}
	return gen.DeleteSong204Response{}, nil
}

func (srv *server) TransposeSong(
	ctx context.Context,
	request gen.TransposeSongRequestObject,
) (gen.TransposeSongResponseObject, error) {
	s, err := srv.songCases.Transpose(ctx, request.SongId, request.Params.Semitones)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return gen.TransposeSong404Response{}, nil
		}
		return nil, err
	}
	if s == nil {
		return gen.TransposeSong404Response{}, nil
	}
	return gen.TransposeSong200JSONResponse{
		SongId:    s.SongID,
		ArtistId:  ptr(s.ArtistID),
		Title:     s.Title,
		Slug:      s.Slug,
		Tonality:  ptr(s.Tonality),
		Content:   srv.tabContentToGen(ctx, &s.Content),
		CreatedAt: timePtr(s.CreatedAt),
		UpdatedAt: timePtr(s.UpdatedAt),
	}, nil
}

func ptr[T any](v T) *T { return &v }

func timePtr(t time.Time) *time.Time { return &t }

func (srv *server) artistToAPI(a *entity.Artist) gen.Artist {
	return gen.Artist{
		ArtistId:  a.ArtistID,
		Name:      a.Name,
		Slug:      a.Slug,
		CreatedAt: timePtr(a.CreatedAt),
	}
}

func (srv *server) songToListItem(s *entity.Song) gen.SongListItem {
	item := gen.SongListItem{
		SongId:   s.SongID,
		Title:    s.Title,
		Slug:     s.Slug,
		ArtistId: ptr(s.ArtistID),
		Tonality: ptr(s.Tonality),
	}
	if s.Artist != nil {
		item.ArtistName = ptr(s.Artist.Name)
	}
	if s.Opens30d > 0 {
		item.Opens30d = ptr(s.Opens30d)
	}
	return item
}

func (srv *server) ListChords(
	ctx context.Context,
	_ gen.ListChordsRequestObject,
) (gen.ListChordsResponseObject, error) {
	list, err := srv.chordCases.List(ctx)
	if err != nil {
		return nil, err
	}
	chords := make([]gen.ChordDefinition, 0, len(list))
	for _, ch := range list {
		chords = append(chords, chordToAPI(ch))
	}
	return gen.ListChords200JSONResponse{Chords: chords}, nil
}

func chordToAPI(ch *entity.Chord) gen.ChordDefinition {
	out := gen.ChordDefinition{
		Name:      ch.Name,
		Shape:     ch.Shape,
		IsPreset:  ch.IsPreset,
		SortOrder: ch.SortOrder,
	}
	if ch.BarreFret != nil && ch.BarreFrom != nil && ch.BarreTo != nil {
		out.Barre = &gen.ChordBarre{
			Fret: *ch.BarreFret,
			From: *ch.BarreFrom,
			To:   *ch.BarreTo,
		}
	}
	return out
}

func (srv *server) tabContentToGen(ctx context.Context, c *entity.TabContent) *gen.TabContent {
	if c == nil {
		return nil
	}
	var sections *[]gen.Section
	if len(c.Sections) > 0 {
		list := make([]gen.Section, 0, len(c.Sections))
		for _, sec := range c.Sections {
			list = append(list, section(sec))
		}
		sections = &list
	}
	usedTabs, err := srv.chordCases.UsedChordTabs(ctx, *c)
	if err != nil {
		usedTabs = map[string]string{}
	}
	var chordTabs *map[string]string
	if len(usedTabs) > 0 {
		chordTabs = &usedTabs
	}
	return &gen.TabContent{Sections: sections, ChordTabs: chordTabs}
}

func section(s entity.Section) gen.Section {
	var chordSeq *[]string
	if len(s.ChordSequence) > 0 {
		chordSeq = &s.ChordSequence
	}
	var blocks *[]gen.Block
	if len(s.Blocks) > 0 {
		list := make([]gen.Block, 0, len(s.Blocks))
		for _, b := range s.Blocks {
			list = append(list, blockToGen(b))
		}
		blocks = &list
	}
	return gen.Section{
		Type:          ptr(s.Type),
		Label:         ptr(s.Label),
		ChordSequence: chordSeq,
		Blocks:        blocks,
	}
}

func blockToGen(b entity.Block) gen.Block {
	out := gen.Block{Kind: gen.BlockKind(b.Kind)}
	if b.Label != "" {
		out.Label = ptr(b.Label)
	}
	if len(b.Chords) > 0 {
		out.Chords = &b.Chords
	}
	if b.Tab != "" {
		out.Tab = ptr(b.Tab)
	}
	if len(b.Segments) > 0 {
		list := make([]gen.ChordSegment, 0, len(b.Segments))
		for _, seg := range b.Segments {
			list = append(list, chordSegmentToGen(seg))
		}
		out.Segments = &list
	}
	return out
}

func chordSegmentToGen(s entity.ChordSegment) gen.ChordSegment {
	out := gen.ChordSegment{Chord: s.Chord}
	out.Text = ptr(s.Text)
	return out
}

func tabContentFromAPI(c *gen.TabContent) entity.TabContent {
	if c == nil {
		return entity.TabContent{}
	}
	var sections []entity.Section
	if c.Sections != nil {
		sections = make([]entity.Section, 0, len(*c.Sections))
		for _, sec := range *c.Sections {
			sections = append(sections, sectionFromAPI(sec))
		}
	}
	out := entity.TabContent{Sections: sections}
	if c.ChordTabs != nil && len(*c.ChordTabs) > 0 {
		out.ChordTabs = make(map[string]string, len(*c.ChordTabs))
		maps.Copy(out.ChordTabs, *c.ChordTabs)
	}
	return out
}

func sectionFromAPI(s gen.Section) entity.Section {
	var chordSeq []string
	if s.ChordSequence != nil {
		chordSeq = *s.ChordSequence
	}
	var blocks []entity.Block
	if s.Blocks != nil {
		blocks = make([]entity.Block, 0, len(*s.Blocks))
		for _, b := range *s.Blocks {
			blocks = append(blocks, blockFromAPI(b))
		}
	}
	out := entity.Section{ChordSequence: chordSeq, Blocks: blocks}
	if s.Type != nil {
		out.Type = *s.Type
	}
	if s.Label != nil {
		out.Label = *s.Label
	}
	return out
}

func blockFromAPI(b gen.Block) entity.Block {
	out := entity.Block{Kind: string(b.Kind)}
	if b.Label != nil {
		out.Label = *b.Label
	}
	if b.Chords != nil {
		out.Chords = *b.Chords
	}
	if b.Tab != nil {
		out.Tab = *b.Tab
	}
	if b.Segments != nil {
		out.Segments = make([]entity.ChordSegment, 0, len(*b.Segments))
		for _, seg := range *b.Segments {
			out.Segments = append(out.Segments, chordSegmentFromAPI(seg))
		}
	}
	return out
}

func chordSegmentFromAPI(s gen.ChordSegment) entity.ChordSegment {
	out := entity.ChordSegment{Chord: s.Chord}
	if s.Text != nil {
		out.Text = *s.Text
	}
	return out
}
