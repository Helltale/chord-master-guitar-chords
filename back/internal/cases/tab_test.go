package cases //nolint:testpackage // тесты только экспортируемого API (UsedChords, UsedChordTabs)

import (
	"testing"

	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
)

func TestUsedChords(t *testing.T) {
	tests := []struct {
		name    string
		content entity.TabContent
		want    []string
	}{
		{
			name:    "empty",
			content: entity.TabContent{},
			want:    nil,
		},
		{
			name: "chord_sequence only",
			content: entity.TabContent{
				Sections: []entity.Section{
					{ChordSequence: []string{"C", "G", "Am"}},
				},
			},
			want: []string{"C", "G", "Am"},
		},
		{
			name: "instrumental chords",
			content: entity.TabContent{
				Sections: []entity.Section{
					{
						Blocks: []entity.Block{
							{Kind: "instrumental", Chords: []string{"Em", "C"}},
						},
					},
				},
			},
			want: []string{"Em", "C"},
		},
		{
			name: "lyrics segments",
			content: entity.TabContent{
				Sections: []entity.Section{
					{
						Blocks: []entity.Block{
							{
								Kind: "lyrics",
								Segments: []entity.ChordSegment{
									{Chord: "F", Text: "hello"},
									{Chord: "G", Text: "world"},
								},
							},
						},
					},
				},
			},
			want: []string{"F", "G"},
		},
		{
			name: "deduplicate and skip empty",
			content: entity.TabContent{
				Sections: []entity.Section{
					{ChordSequence: []string{"C", "C", "", "G", "C"}},
				},
			},
			want: []string{"C", "G"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := UsedChords(tt.content)
			if len(got) != len(tt.want) {
				t.Errorf("UsedChords() length = %d, want %d, got %v", len(got), len(tt.want), got)
				return
			}
			seen := make(map[string]int)
			for _, s := range got {
				seen[s]++
			}
			for _, s := range tt.want {
				if seen[s] != 1 {
					t.Errorf("UsedChords() want %q once, got count %d", s, seen[s])
				}
			}
		})
	}
}
