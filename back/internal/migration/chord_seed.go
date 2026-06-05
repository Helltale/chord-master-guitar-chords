package migration

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"

	"github.com/pkg/errors"
	"gopkg.in/yaml.v3"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	chorddata "github.com/Helltale/amdm-guitar-chords/back/data"
	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
)

func readChordsYAML() ([]byte, error) {
	if len(chorddata.ChordsYAML) > 0 {
		return chorddata.ChordsYAML, nil
	}
	if _, filename, _, ok := runtime.Caller(0); ok {
		path := filepath.Join(filepath.Dir(filename), "..", "..", "data", "chords.yaml")
		if data, err := os.ReadFile(path); err == nil {
			return data, nil
		}
	}
	for _, path := range []string{"data/chords.yaml", "back/data/chords.yaml"} {
		if data, err := os.ReadFile(path); err == nil {
			return data, nil
		}
	}
	return nil, errors.New("chords.yaml not found")
}

type chordYAML struct {
	Name      string     `yaml:"name"`
	Shape     string     `yaml:"shape"`
	Preset    bool       `yaml:"preset"`
	SortOrder int        `yaml:"sort_order"`
	Barre     *barreYAML `yaml:"barre"`
}

type barreYAML struct {
	Fret int `yaml:"fret"`
	From int `yaml:"from"`
	To   int `yaml:"to"`
}

type chordsFile struct {
	Chords []chordYAML `yaml:"chords"`
}

func parseChordsYAML(data []byte) ([]entity.Chord, error) {
	var file chordsFile
	if err := yaml.Unmarshal(data, &file); err != nil {
		return nil, errors.Wrap(err, "unmarshal chords yaml")
	}
	out := make([]entity.Chord, 0, len(file.Chords))
	for _, item := range file.Chords {
		if item.Name == "" || item.Shape == "" {
			return nil, fmt.Errorf("chord entry missing name or shape: %+v", item)
		}
		ch := entity.Chord{
			Name:      item.Name,
			Shape:     item.Shape,
			IsPreset:  item.Preset,
			SortOrder: item.SortOrder,
		}
		if item.Barre != nil {
			fret, from, to := item.Barre.Fret, item.Barre.From, item.Barre.To
			ch.BarreFret = &fret
			ch.BarreFrom = &from
			ch.BarreTo = &to
		}
		out = append(out, ch)
	}
	return out, nil
}

func SeedChordsFromEmbeddedYAML(db *gorm.DB) error {
	data, err := readChordsYAML()
	if err != nil {
		return err
	}
	chords, err := parseChordsYAML(data)
	if err != nil {
		return err
	}
	return upsertChords(db, chords)
}

func upsertChords(db *gorm.DB, chords []entity.Chord) error {
	if len(chords) == 0 {
		return nil
	}
	return db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "name"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"shape", "barre_fret", "barre_from", "barre_to", "is_preset", "sort_order",
		}),
	}).Create(&chords).Error
}
