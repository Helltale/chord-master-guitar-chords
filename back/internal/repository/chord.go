package repository

import (
	"context"
	"errors"

	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
	"gorm.io/gorm"
)

type ChordRepository interface {
	ListAll(ctx context.Context) ([]*entity.Chord, error)
	Lookup(ctx context.Context, name string) (*entity.Chord, error)
}

type chordRepo struct {
	db *gorm.DB
}

func NewChordRepository(db *gorm.DB) ChordRepository {
	return &chordRepo{db: db}
}

func (r *chordRepo) ListAll(ctx context.Context) ([]*entity.Chord, error) {
	var list []*entity.Chord
	err := r.db.WithContext(ctx).Order("sort_order, name").Find(&list).Error
	return list, err
}

func (r *chordRepo) Lookup(ctx context.Context, name string) (*entity.Chord, error) {
	var ch entity.Chord
	err := r.db.WithContext(ctx).First(&ch, "name = ?", name).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &ch, nil
}
