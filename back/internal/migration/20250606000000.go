package migration

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"

	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
)

func Migration20250606000000(db *gorm.DB) error {
	if err := db.AutoMigrate(&entity.Chord{}); err != nil {
		return errors.Wrap(err, "auto migrate chords")
	}
	return nil
}
