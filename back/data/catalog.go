package data

import _ "embed"

// ChordsYAML is the chord catalog seeded into the database on migration.
//
//go:embed chords.yaml
var ChordsYAML []byte
