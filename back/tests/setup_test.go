//go:build integration

package tests

import (
	"context"
	"fmt"
	"log"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/Helltale/amdm-guitar-chords/back/internal/cases"
	"github.com/Helltale/amdm-guitar-chords/back/internal/config"
	"github.com/Helltale/amdm-guitar-chords/back/internal/handler"
	"github.com/Helltale/amdm-guitar-chords/back/internal/handler/gen"
	"github.com/Helltale/amdm-guitar-chords/back/internal/migration"
	"github.com/Helltale/amdm-guitar-chords/back/internal/repository"
	"github.com/go-chi/chi/v5"
	postgresmod "github.com/testcontainers/testcontainers-go/modules/postgres"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const apiBase = "/api"

func NewTestServer(t *testing.T) *httptest.Server {
	db, err := openTestDB()
	if err != nil {
		t.Fatal("open test db:", err)
	}
	if err := migration.Run(db, migration.NewMigrations()); err != nil {
		t.Fatal("migrations:", err)
	}
	artistRepo := repository.NewArtistRepository(db)
	songRepo := repository.NewSongRepository(db)
	songOpenRepo := repository.NewSongOpenRepository(db)
	chordRepo := repository.NewChordRepository(db)
	artistCases := cases.NewArtistCases(artistRepo)
	songCases := cases.NewSongCases(artistRepo, songRepo, songOpenRepo, nil)
	chordCases := cases.NewChordCases(chordRepo)
	srv := handler.NewServer(artistCases, songCases, chordCases)
	si := gen.NewStrictHandler(srv, nil)
	r := chi.NewRouter()
	h := gen.HandlerWithOptions(si, gen.ChiServerOptions{
		BaseURL:    apiBase,
		BaseRouter: r,
	})
	return httptest.NewServer(h)
}

func openTestDB() (*gorm.DB, error) {
	dsn := os.Getenv("TEST_DATABASE_DSN")
	if dsn == "" {
		cfg, err := config.Load()
		if err != nil {
			return nil, fmt.Errorf("load config: %w", err)
		}
		if name := os.Getenv("DB_NAME"); name != "" {
			cfg.Database.DBName = name
		}
		dsn = cfg.Database.DSN()
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	return db, nil
}

func TestMain(m *testing.M) {
	ctx := context.Background()

	// Если DSN уже задан (например, внешняя БД в CI), контейнер не поднимаем.
	if os.Getenv("TEST_DATABASE_DSN") != "" {
		os.Exit(m.Run())
		return
	}

	pgContainer, err := postgresmod.Run(ctx, "postgres:16-alpine",
		postgresmod.WithDatabase("amdm_test"),
		postgresmod.WithUsername("amdm"),
		postgresmod.WithPassword("amdm"),
		postgresmod.BasicWaitStrategies(),
	)
	if err != nil {
		log.Fatalf("start postgres container: %v", err)
	}

	defer func() {
		if err := pgContainer.Terminate(ctx); err != nil {
			log.Printf("terminate postgres container: %v", err)
		}
	}()

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		log.Fatalf("postgres connection string: %v", err)
	}
	os.Setenv("TEST_DATABASE_DSN", connStr)

	code := m.Run()
	os.Exit(code)
}
