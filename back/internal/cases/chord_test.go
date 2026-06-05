package cases //nolint:testpackage // доступ к неэкспортируемым хелперам cases

import (
	"context"
	"testing"

	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
	"github.com/Helltale/amdm-guitar-chords/back/internal/repository"
)

type fakeChordRepo struct {
	chords []*entity.Chord
}

func (f *fakeChordRepo) ListAll(_ context.Context) ([]*entity.Chord, error) {
	return f.chords, nil
}

func (f *fakeChordRepo) Lookup(_ context.Context, name string) (*entity.Chord, error) {
	for _, ch := range f.chords {
		if ch.Name == name {
			return ch, nil
		}
	}
	return nil, repository.ErrNotFound
}

func TestChordCases_UsedChordTabs(t *testing.T) {
	repo := &fakeChordRepo{
		chords: []*entity.Chord{
			{Name: "C", Shape: "x32010"},
			{Name: "Em", Shape: "022000"},
			{Name: "A", Shape: "x02220"},
		},
	}
	c := NewChordCases(repo)
	ctx := context.Background()

	tests := []struct {
		name    string
		content entity.TabContent
		want    map[string]string
	}{
		{
			name:    "empty",
			content: entity.TabContent{},
			want:    map[string]string{},
		},
		{
			name: "only used chords from sections",
			content: entity.TabContent{
				Sections: []entity.Section{
					{ChordSequence: []string{"C", "G"}},
				},
				ChordTabs: map[string]string{"C": "x32010", "G": "320003", "Am": "x02210"},
			},
			want: map[string]string{"C": "x32010", "G": "320003"},
		},
		{
			name: "skip empty tab",
			content: entity.TabContent{
				Sections: []entity.Section{
					{ChordSequence: []string{"C"}},
				},
				ChordTabs: map[string]string{"C": ""},
			},
			want: map[string]string{},
		},
		{
			name: "fallback to catalog when chord_tabs missing",
			content: entity.TabContent{
				Sections: []entity.Section{
					{ChordSequence: []string{"C"}},
				},
			},
			want: map[string]string{"C": "x32010"},
		},
		{
			name: "fallback to catalog when chord_tabs empty for used chord",
			content: entity.TabContent{
				Sections: []entity.Section{
					{ChordSequence: []string{"Em", "A"}},
				},
				ChordTabs: map[string]string{"Em": ""},
			},
			want: map[string]string{
				"Em": "022000",
				"A":  "x02220",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := c.UsedChordTabs(ctx, tt.content)
			if err != nil {
				t.Fatalf("UsedChordTabs() error = %v", err)
			}
			if len(got) != len(tt.want) {
				t.Errorf("UsedChordTabs() length = %d, want %d", len(got), len(tt.want))
				return
			}
			for k, v := range tt.want {
				if g, ok := got[k]; !ok || g != v {
					t.Errorf("UsedChordTabs()[%q] = %q, want %q (ok=%v)", k, g, v, ok)
				}
			}
		})
	}
}
