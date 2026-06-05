package migration //nolint:testpackage // доступ к parseChordsYAML

import "testing"

func TestParseChordsYAML(t *testing.T) {
	data := []byte(`chords:
  - name: Am
    shape: x02210
    preset: true
    sort_order: 10
  - name: F
    shape: "133211"
    barre: { fret: 1, from: 0, to: 5 }
`)
	chords, err := parseChordsYAML(data)
	if err != nil {
		t.Fatalf("parseChordsYAML() error = %v", err)
	}
	if len(chords) != 2 {
		t.Fatalf("len(chords) = %d, want 2", len(chords))
	}
	if chords[0].Name != "Am" || chords[0].Shape != "x02210" || !chords[0].IsPreset || chords[0].SortOrder != 10 {
		t.Errorf("chords[0] = %+v", chords[0])
	}
	if chords[1].BarreFret == nil || *chords[1].BarreFret != 1 {
		t.Errorf("F barre fret = %v, want 1", chords[1].BarreFret)
	}
}

func TestReadChordsYAML(t *testing.T) {
	data, err := readChordsYAML()
	if err != nil {
		t.Fatalf("readChordsYAML() error = %v", err)
	}
	chords, err := parseChordsYAML(data)
	if err != nil {
		t.Fatalf("parseChordsYAML() error = %v", err)
	}
	if len(chords) < 20 {
		t.Errorf("expected seeded catalog with many chords, got %d", len(chords))
	}
	presets := 0
	for _, ch := range chords {
		if ch.IsPreset {
			presets++
		}
	}
	if presets != 7 {
		t.Errorf("preset chords = %d, want 7", presets)
	}
}
