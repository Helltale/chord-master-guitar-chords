package migration

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

func Migration20250606000001(db *gorm.DB) error {
	if err := SeedChordsFromEmbeddedYAML(db); err != nil {
		return errors.Wrap(err, "seed chords from yaml")
	}
	return nil
}
