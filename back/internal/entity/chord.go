package entity

// Chord describes a guitar chord fingering in the catalog.
type Chord struct {
	Name      string `gorm:"primaryKey;size:16;column:name"`
	Shape     string `gorm:"size:6;not null"`
	BarreFret *int   `gorm:"column:barre_fret"`
	BarreFrom *int   `gorm:"column:barre_from"`
	BarreTo   *int   `gorm:"column:barre_to"`
	IsPreset  bool   `gorm:"not null;default:false;column:is_preset"`
	SortOrder int    `gorm:"not null;default:0;column:sort_order"`
}

func (Chord) TableName() string {
	return "chords"
}
