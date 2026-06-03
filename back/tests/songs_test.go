//go:build integration

package tests

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"
)

func createArtistAndGetID(t *testing.T, base string, client *http.Client, name, slug string) string {
	t.Helper()
	body := `{"name":"` + name + `","slug":"` + slug + `"}`
	resp, err := client.Post(base+"/artists", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("create artist: status = %d", resp.StatusCode)
	}
	var a struct {
		ArtistId string `json:"artist_id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&a); err != nil {
		t.Fatal(err)
	}
	return a.ArtistId
}

func TestSongs_CreateSuccess(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistID := createArtistAndGetID(t, base, client, "Song Artist", "song-artist")

	body := `{"artist_id":"` + artistID + `","title":"My Song","slug":"my-song","tonality":0}`
	resp, err := client.Post(base+"/songs", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("POST /songs: status = %d, want 201", resp.StatusCode)
	}
	var song struct {
		SongId   string `json:"song_id"`
		ArtistId string `json:"artist_id"`
		Title    string `json:"title"`
		Slug     string `json:"slug"`
		Tonality *int   `json:"tonality"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&song); err != nil {
		t.Fatal("decode:", err)
	}
	if song.Title != "My Song" || song.Slug != "my-song" || song.SongId == "" || song.ArtistId != artistID {
		t.Errorf("song = %+v", song)
	}

	// Get по ID возвращает те же данные
	getResp, err := client.Get(base + "/songs/" + song.SongId)
	if err != nil {
		t.Fatal(err)
	}
	defer getResp.Body.Close()
	if getResp.StatusCode != http.StatusOK {
		t.Errorf("GET /songs/{id}: status = %d", getResp.StatusCode)
	}
	var got struct {
		Title string `json:"title"`
		Slug  string `json:"slug"`
	}
	if err := json.NewDecoder(getResp.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if got.Title != "My Song" || got.Slug != "my-song" {
		t.Errorf("get song = %+v", got)
	}
}

func TestSongs_CreateSuccess_WithCyrillicTitleAndSlug(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistID := createArtistAndGetID(t, base, client, "Русский Бэнд", "русский-бэнд")

	title := "Привет, песня"
	slug := "привет-песня"
	body := `{"artist_id":"` + artistID + `","title":"` + title + `","slug":"` + slug + `","tonality":0}`
	resp, err := client.Post(base+"/songs", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("POST /songs: status = %d, want 201", resp.StatusCode)
	}

	var song struct {
		SongId   string `json:"song_id"`
		ArtistId string `json:"artist_id"`
		Title    string `json:"title"`
		Slug     string `json:"slug"`
		Tonality *int   `json:"tonality"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&song); err != nil {
		t.Fatal("decode:", err)
	}
	if song.Title != title || song.Slug != slug || song.SongId == "" || song.ArtistId != artistID {
		t.Errorf("song = %+v", song)
	}
}

func TestSongs_CreateDuplicateSlug_Returns400(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistID := createArtistAndGetID(t, base, client, "Dup Artist", "dup-artist")

	body := `{"artist_id":"` + artistID + `","title":"One","slug":"same-slug"}`
	resp1, _ := client.Post(base+"/songs", "application/json", strings.NewReader(body))
	resp1.Body.Close()
	if resp1.StatusCode != http.StatusCreated {
		t.Fatalf("first create: %d", resp1.StatusCode)
	}

	resp2, err := client.Post(base+"/songs", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp2.Body.Close()
	if resp2.StatusCode != http.StatusBadRequest {
		t.Errorf("duplicate slug: status = %d, want 400", resp2.StatusCode)
	}
}

func TestSongs_CreateValidation_Returns400(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistID := createArtistAndGetID(t, base, client, "Val Artist", "val-artist")

	tests := []struct {
		name string
		body string
	}{
		{"empty title", `{"artist_id":"` + artistID + `","title":"","slug":"ok"}`},
		{"empty slug", `{"artist_id":"` + artistID + `","title":"T","slug":""}`},
		{"invalid slug", `{"artist_id":"` + artistID + `","title":"T","slug":"bad slug"}`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := client.Post(base+"/songs", "application/json", strings.NewReader(tt.body))
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusBadRequest {
				t.Errorf("status = %d, want 400", resp.StatusCode)
			}
		})
	}
}

func TestSongs_Get_NotFound_Returns404(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase

	// валидный UUID, но записи нет
	resp, err := server.Client().Get(base + "/songs/11111111-1111-1111-1111-111111111111")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("GET non-existent song: status = %d, want 404", resp.StatusCode)
	}
}

func TestSongs_ListTrending_Opens30d(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

  artistName := "Trend Artist"
  artistID := createArtistAndGetID(t, base, client, artistName, "trend-artist")
	createBody := `{"artist_id":"` + artistID + `","title":"Popular Hit","slug":"popular-hit"}`
	cr, err := client.Post(base+"/songs", "application/json", strings.NewReader(createBody))
	if err != nil {
		t.Fatal(err)
	}
	var created struct {
		SongId string `json:"song_id"`
	}
	if err := json.NewDecoder(cr.Body).Decode(&created); err != nil {
		cr.Body.Close()
		t.Fatal(err)
	}
	cr.Body.Close()

	for range 4 {
		r, errGet := client.Get(base + "/songs/" + created.SongId)
		if errGet != nil {
			t.Fatal(errGet)
		}
		r.Body.Close()
		if r.StatusCode != http.StatusOK {
			t.Fatalf("GET song: %d", r.StatusCode)
		}
	}

	listResp, err := client.Get(base + "/songs?sort=opens_30d_desc&limit=10")
	if err != nil {
		t.Fatal(err)
	}
	defer listResp.Body.Close()
	if listResp.StatusCode != http.StatusOK {
		t.Fatalf("list trending: %d", listResp.StatusCode)
	}
	var list struct {
		Items *[]struct {
			SongId   string `json:"song_id"`
			Title    string `json:"title"`
			ArtistName *string `json:"artist_name"`
			Opens30d *int   `json:"opens_30d"`
		} `json:"items"`
	}
	if err := json.NewDecoder(listResp.Body).Decode(&list); err != nil {
		t.Fatal(err)
	}
	if list.Items == nil || len(*list.Items) < 1 {
		t.Fatal("expected trending items")
	}
	first := (*list.Items)[0]
	if first.SongId != created.SongId || first.Title != "Popular Hit" {
		t.Fatalf("first item = %+v, want our song", first)
	}
	if first.ArtistName == nil || *first.ArtistName != artistName {
		t.Errorf("artist_name = %v, want %q", first.ArtistName, artistName)
	}
	if first.Opens30d == nil || *first.Opens30d != 4 {
		t.Errorf("opens_30d = %v, want 4", first.Opens30d)
	}
}

func TestSongs_ListByArtistId(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistName := "List Artist"
	artistID := createArtistAndGetID(t, base, client, artistName, "list-artist")
	// одна песня
	createBody := `{"artist_id":"` + artistID + `","title":"Only Song","slug":"only-song"}`
	resp, _ := client.Post(base+"/songs", "application/json", strings.NewReader(createBody))
	resp.Body.Close()

	listResp, err := client.Get(base + "/songs?artist_id=" + artistID)
	if err != nil {
		t.Fatal(err)
	}
	defer listResp.Body.Close()
	if listResp.StatusCode != http.StatusOK {
		t.Fatalf("list: %d", listResp.StatusCode)
	}
	var list struct {
		Items *[]struct {
			Title string `json:"title"`
			ArtistName *string `json:"artist_name"`
		} `json:"items"`
		Total *int `json:"total"`
	}
	if err := json.NewDecoder(listResp.Body).Decode(&list); err != nil {
		t.Fatal(err)
	}
	if list.Total == nil || *list.Total != 1 {
		t.Errorf("total = %v, want 1", list.Total)
	}
	if list.Items == nil || len(*list.Items) != 1 || (*list.Items)[0].Title != "Only Song" {
		t.Errorf("items = %+v", list.Items)
	}
	if (*list.Items)[0].ArtistName == nil || *(*list.Items)[0].ArtistName != artistName {
		t.Errorf("artist_name = %v, want %q", (*list.Items)[0].ArtistName, artistName)
	}
}

func TestSongs_UpdateSuccess(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistID := createArtistAndGetID(t, base, client, "Upd Artist", "upd-artist")
	createBody := `{"artist_id":"` + artistID + `","title":"Old","slug":"old"}`
	cr, _ := client.Post(base+"/songs", "application/json", strings.NewReader(createBody))
	var created struct {
		SongId string `json:"song_id"`
	}
	json.NewDecoder(cr.Body).Decode(&created)
	cr.Body.Close()

	updateBody := `{"title":"New Title","slug":"new-slug"}`
	req, _ := http.NewRequest(http.MethodPut, base+"/songs/"+created.SongId, strings.NewReader(updateBody))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("PUT: status = %d, want 200", resp.StatusCode)
	}
	var updated struct {
		Title string `json:"title"`
		Slug  string `json:"slug"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&updated); err != nil {
		t.Fatal(err)
	}
	if updated.Title != "New Title" || updated.Slug != "new-slug" {
		t.Errorf("updated = %+v", updated)
	}

	getResp, _ := client.Get(base + "/songs/" + created.SongId)
	defer getResp.Body.Close()
	var got struct {
		Title string `json:"title"`
		Slug  string `json:"slug"`
	}
	json.NewDecoder(getResp.Body).Decode(&got)
	if got.Title != "New Title" || got.Slug != "new-slug" {
		t.Errorf("get after update = %+v", got)
	}
}

func TestSongs_DeleteSuccess(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistID := createArtistAndGetID(t, base, client, "Del Artist", "del-artist")
	createBody := `{"artist_id":"` + artistID + `","title":"To Delete","slug":"to-delete"}`
	cr, _ := client.Post(base+"/songs", "application/json", strings.NewReader(createBody))
	var created struct {
		SongId string `json:"song_id"`
	}
	json.NewDecoder(cr.Body).Decode(&created)
	cr.Body.Close()

	req, _ := http.NewRequest(http.MethodDelete, base+"/songs/"+created.SongId, nil)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("DELETE: status = %d, want 204", resp.StatusCode)
	}

	getResp, _ := client.Get(base + "/songs/" + created.SongId)
	defer getResp.Body.Close()
	if getResp.StatusCode != http.StatusNotFound {
		t.Errorf("GET after delete: status = %d, want 404", getResp.StatusCode)
	}
}

func TestSongs_Delete_NotFound_Returns404(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	req, _ := http.NewRequest(http.MethodDelete, base+"/songs/11111111-1111-1111-1111-111111111111", nil)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("DELETE non-existent: status = %d, want 404", resp.StatusCode)
	}
}

func TestSongs_Update_NotFound_Returns404(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	body := `{"title":"Any"}`
	req, _ := http.NewRequest(http.MethodPut, base+"/songs/11111111-1111-1111-1111-111111111111", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("PUT non-existent: status = %d, want 404", resp.StatusCode)
	}
}

func TestSongs_TransposeSuccess(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase
	client := server.Client()

	artistID := createArtistAndGetID(t, base, client, "Trans Artist", "trans-artist")
	content := `{"sections":[{"type":"verse","label":"1","chord_sequence":["C","G"],"blocks":[]}]}`
	createBody := `{"artist_id":"` + artistID + `","title":"Trans Song","slug":"trans-song","tonality":0,"content":` + content + `}`
	cr, err := client.Post(base+"/songs", "application/json", strings.NewReader(createBody))
	if err != nil {
		t.Fatal(err)
	}
	defer cr.Body.Close()
	if cr.StatusCode != http.StatusCreated {
		t.Fatalf("create: %d", cr.StatusCode)
	}
	var created struct {
		SongId string `json:"song_id"`
	}
	if err := json.NewDecoder(cr.Body).Decode(&created); err != nil {
		t.Fatal(err)
	}

	// +2 semitones: C→D, G→A
	resp, err := client.Post(base+"/songs/"+created.SongId+"/transpose?semitones=2", "application/json", nil)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("transpose: status = %d, want 200", resp.StatusCode)
	}
	var transposed struct {
		Tonality *int `json:"tonality"`
		Content  *struct {
			Sections *[]struct {
				ChordSequence *[]string `json:"chord_sequence"`
			} `json:"sections"`
		} `json:"content"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&transposed); err != nil {
		t.Fatal(err)
	}
	if transposed.Tonality == nil || *transposed.Tonality != 2 {
		t.Errorf("tonality = %v, want 2", transposed.Tonality)
	}
	if transposed.Content != nil && transposed.Content.Sections != nil && len(*transposed.Content.Sections) > 0 {
		seq := (*transposed.Content.Sections)[0].ChordSequence
		if seq != nil && len(*seq) >= 2 {
			if (*seq)[0] != "D" || (*seq)[1] != "A" {
				t.Errorf("chord_sequence after transpose = %v, want [D, A]", *seq)
			}
		}
	}
}

func TestSongs_Transpose_NotFound_Returns404(t *testing.T) {
	server := NewTestServer(t)
	defer server.Close()
	base := server.URL + apiBase

	resp, err := server.Client().Post(base+"/songs/11111111-1111-1111-1111-111111111111/transpose?semitones=1", "application/json", nil)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("transpose non-existent: status = %d, want 404", resp.StatusCode)
	}
}
