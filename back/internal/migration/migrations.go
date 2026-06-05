package migration

func NewMigrations() []*DBMigration {
	return []*DBMigration{
		{
			ID:      "20250220000001",
			Migrate: Migration20250221000000,
		},
		{
			ID:      "20250325000000",
			Migrate: Migration20250325000000,
		},
		{
			ID:      "20250606000000",
			Migrate: Migration20250606000000,
		},
		{
			ID:      "20250606000001",
			Migrate: Migration20250606000001,
		},
	}
}
