package cases

import (
	"context"
	"errors"
	"sort"
	"sync"

	"github.com/Helltale/amdm-guitar-chords/back/internal/entity"
	"github.com/Helltale/amdm-guitar-chords/back/internal/repository"
)

type ChordCases struct {
	repo   repository.ChordRepository
	mu     sync.RWMutex
	cache  map[string]*entity.Chord
	loaded bool
}

func NewChordCases(repo repository.ChordRepository) *ChordCases {
	return &ChordCases{repo: repo}
}

func (c *ChordCases) ensureCache(ctx context.Context) error {
	c.mu.RLock()
	if c.loaded {
		c.mu.RUnlock()
		return nil
	}
	c.mu.RUnlock()

	c.mu.Lock()
	defer c.mu.Unlock()
	if c.loaded {
		return nil
	}
	list, err := c.repo.ListAll(ctx)
	if err != nil {
		return err
	}
	c.cache = make(map[string]*entity.Chord, len(list))
	for _, ch := range list {
		c.cache[ch.Name] = ch
	}
	c.loaded = true
	return nil
}

func (c *ChordCases) List(ctx context.Context) ([]*entity.Chord, error) {
	if err := c.ensureCache(ctx); err != nil {
		return nil, err
	}
	c.mu.RLock()
	defer c.mu.RUnlock()
	out := make([]*entity.Chord, 0, len(c.cache))
	for _, ch := range c.cache {
		out = append(out, ch)
	}
	sortChords(out)
	return out, nil
}

func sortChords(list []*entity.Chord) {
	sort.Slice(list, func(i, j int) bool {
		if list[i].SortOrder != list[j].SortOrder {
			return list[i].SortOrder < list[j].SortOrder
		}
		return list[i].Name < list[j].Name
	})
}

func (c *ChordCases) LookupShape(ctx context.Context, name string) (string, bool) {
	if err := c.ensureCache(ctx); err != nil {
		return "", false
	}
	c.mu.RLock()
	defer c.mu.RUnlock()
	ch, ok := c.cache[name]
	if !ok || ch.Shape == "" {
		return "", false
	}
	return ch.Shape, true
}

func (c *ChordCases) Lookup(ctx context.Context, name string) (*entity.Chord, error) {
	if err := c.ensureCache(ctx); err != nil {
		return nil, err
	}
	c.mu.RLock()
	ch, ok := c.cache[name]
	c.mu.RUnlock()
	if ok {
		return ch, nil
	}
	ch, err := c.repo.Lookup(ctx, name)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, err
		}
		return nil, err
	}
	c.mu.Lock()
	c.cache[name] = ch
	c.loaded = true
	c.mu.Unlock()
	return ch, nil
}

func (c *ChordCases) UsedChordTabs(ctx context.Context, content entity.TabContent) (map[string]string, error) {
	used := make(map[string]struct{})
	for _, ch := range UsedChords(content) {
		used[ch] = struct{}{}
	}

	out := selectExplicitChordTabs(content.ChordTabs, used)

	hasMissing := hasMissingChordTabs(used, content.ChordTabs)
	if !hasMissing {
		return out, nil
	}

	for ch := range used {
		if _, ok := out[ch]; ok {
			continue
		}
		if shape, ok := c.LookupShape(ctx, ch); ok {
			out[ch] = shape
		}
	}

	return out, nil
}
