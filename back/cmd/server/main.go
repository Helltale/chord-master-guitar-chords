package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Helltale/amdm-guitar-chords/back/internal/cases"
	"github.com/Helltale/amdm-guitar-chords/back/internal/config"
	"github.com/Helltale/amdm-guitar-chords/back/internal/handler"
	"github.com/Helltale/amdm-guitar-chords/back/internal/handler/gen"
	"github.com/Helltale/amdm-guitar-chords/back/internal/metrics"
	"github.com/Helltale/amdm-guitar-chords/back/internal/migration"
	"github.com/Helltale/amdm-guitar-chords/back/internal/repository"
	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	shutdownTimeout    = 10 * time.Second
	healthzPingTimeout = 2 * time.Second
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	gormDB, err := gorm.Open(postgres.Open(cfg.Database.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("db open: %v", err)
	}
	if migrateErr := migration.Run(gormDB, migration.NewMigrations()); migrateErr != nil {
		log.Fatalf("migrate: %v", migrateErr)
	}
	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("db: %v", err)
	}

	metricsRegistry := prometheus.NewRegistry()
	apiMetrics := metrics.New(metricsRegistry, sqlDB)

	artistRepo := repository.NewArtistRepository(gormDB)
	songRepo := repository.NewSongRepository(gormDB)
	songOpenRepo := repository.NewSongOpenRepository(gormDB)
	chordRepo := repository.NewChordRepository(gormDB)
	artistCases := cases.NewArtistCases(artistRepo)
	songCases := cases.NewSongCases(artistRepo, songRepo, songOpenRepo, apiMetrics.IncSongOpens)
	chordCases := cases.NewChordCases(chordRepo)
	server := handler.NewServer(artistCases, songCases, chordCases)

	rounter := chi.NewRouter()
	rounter.Use(apiMetrics.Middleware)
	rounter.Get("/metrics", func(w http.ResponseWriter, r *http.Request) {
		apiMetrics.Handler(metricsRegistry).ServeHTTP(w, r)
	})
	rounter.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), healthzPingTimeout)
		defer cancel()

		if pingErr := sqlDB.PingContext(ctx); pingErr != nil {
			http.Error(w, "db unavailable", http.StatusServiceUnavailable)
			return
		}

		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	apiRouter := chi.NewRouter()
	gen.HandlerFromMux(gen.NewStrictHandler(server, nil), apiRouter)
	rounter.Mount("/api/amdm/v1", apiRouter)

	addr := ":" + cfg.Backend.Port
	httpSrv := &http.Server{
		Addr:         addr,
		Handler:      rounter,
		ReadTimeout:  cfg.Backend.ReadTimeout(),
		WriteTimeout: cfg.Backend.WriteTimeout(),
		IdleTimeout:  cfg.Backend.IdleTimeout(),
	}
	log.Printf("listening on %s", addr)
	os.Exit(runUntilShutdown(httpSrv, sqlDB))
}

func runUntilShutdown(httpSrv *http.Server, sqlDB *sql.DB) int {
	serveDone := make(chan error, 1)
	go func() {
		serveDone <- httpSrv.ListenAndServe()
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	var exitCode int
	select {
	case sig := <-sigCh:
		log.Printf("received %v, shutting down", sig)
	case serveErr := <-serveDone:
		if serveErr != nil && !errors.Is(serveErr, http.ErrServerClosed) {
			log.Printf("serve: %v", serveErr)
			exitCode = 1
		}
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()
	if shutdownErr := httpSrv.Shutdown(shutdownCtx); shutdownErr != nil {
		log.Printf("shutdown: %v", shutdownErr)
		exitCode = 1
	}

	if closeErr := sqlDB.Close(); closeErr != nil {
		log.Printf("db close: %v", closeErr)
		exitCode = 1
	}
	return exitCode
}
