package cases

import (
	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
)

func UsedChords(content entity.TabContent) []string {
	seen := make(map[string]struct{})
	var list []string
	add := func(chord string) {
		if chord == "" {
			return
		}
		if _, ok := seen[chord]; ok {
			return
		}
		seen[chord] = struct{}{}
		list = append(list, chord)
	}
	for _, sec := range content.Sections {
		for _, ch := range sec.ChordSequence {
			add(ch)
		}
		for _, bl := range sec.Blocks {
			switch bl.Kind {
			case "instrumental":
				for _, ch := range bl.Chords {
					add(ch)
				}
			case "lyrics":
				for _, seg := range bl.Segments {
					add(seg.Chord)
				}
			}
		}
	}
	return list
}

func selectExplicitChordTabs(chordTabs map[string]string, used map[string]struct{}) map[string]string {
	out := make(map[string]string)
	if chordTabs == nil {
		return out
	}

	for ch, tab := range chordTabs {
		if _, ok := used[ch]; ok && tab != "" {
			out[ch] = tab
		}
	}

	return out
}

func hasMissingChordTabs(used map[string]struct{}, chordTabs map[string]string) bool {
	if len(used) == 0 {
		return false
	}

	if chordTabs == nil {
		return true
	}

	for ch := range used {
		if _, ok := chordTabs[ch]; !ok {
			return true
		}
	}

	return false
}
