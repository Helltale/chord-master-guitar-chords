package entity

import (
	"sort"
	"strings"
)

const semitonesPerOct = 12

func ChordNamesSharp() []string {
	return []string{"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"}
}
func ChordNamesFlat() []string {
	return []string{"C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"}
}

// ChordTabShape описывает форму аппликатуры в виде 6 символов:
// с низкой к высокой струне (E A D G B e). Каждый символ:
// - 'x' — струна не играет,
// - '0' — открытая струна,
// - '1'..'9' — лад.
//
// Примеры:
// - E  мажор:  "022100"
// - A  мажор:  "x02220"
// - H  мажор:  "x24442"
// - G#m баррэ: "466444".
type ChordTabShape string

func TransposeChord(chord string, semitones int) string {
	if chord == "" || semitones == 0 {
		return chord
	}
	root, idx := findRoot(chord)
	if root == "" {
		return chord
	}
	suffix := chord[len(root):]
	newIdx := (idx + semitones%semitonesPerOct + semitonesPerOct) % semitonesPerOct
	return ChordNamesSharp()[newIdx] + suffix
}

func findRoot(chord string) (string, int) {
	if chord == "" {
		return "", -1
	}
	type namedIndex struct {
		name string
		idx  int
	}
	var cand []namedIndex
	for i, name := range ChordNamesSharp() {
		cand = append(cand, namedIndex{name, i})
	}
	for i, name := range ChordNamesFlat() {
		cand = append(cand, namedIndex{name, i})
	}
	sort.Slice(cand, func(i, j int) bool {
		if len(cand[i].name) != len(cand[j].name) {
			return len(cand[i].name) > len(cand[j].name)
		}
		return cand[i].name < cand[j].name
	})
	for _, c := range cand {
		if strings.HasPrefix(chord, c.name) {
			return c.name, c.idx
		}
	}
	return "", -1
}
