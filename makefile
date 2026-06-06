lint:
	cd back && golangci-lint run ./...
	cd web && npm run lint

backup:
	@mkdir -p backups
	@BACKUP_FILE="backups/postgres_$$(date +%Y%m%d_%H%M%S).sql.gz"; \
	docker compose exec -T postgres sh -c 'pg_dump --clean --if-exists --no-owner --no-privileges -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' | gzip > "$$BACKUP_FILE"; \
	echo "Backup saved to $$BACKUP_FILE"

restore:
	@test -n "$(BACKUP_FILE)" || (echo "Usage: make restore BACKUP_FILE=backups/<file>.sql.gz" && exit 1)
	@test -f "$(BACKUP_FILE)" || (echo "Backup file not found: $(BACKUP_FILE)" && exit 1)
	@gunzip -c "$(BACKUP_FILE)" | docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'
	@echo "Restore completed from $(BACKUP_FILE)"

tidy:
	cd back && go mod tidy

test: utest itest

utest:
	cd back && go test ./... -v -count=1
	cd web && npm run test

itest:
	cd back && go test -tags=integration -v -count=1 ./tests/...

gen-back:
	cd back/internal/api && go generate .

gen-web:
	cd web && node scripts/gen-api-types.js

docker-build:
	docker compose build --no-cache

restart:
	docker compose down -v && docker compose build && docker compose up -d

restart-srv:
	docker compose down && docker compose build && docker compose up -d

deploy-full:
	docker compose -f docker-compose.prod.yml pull
	docker compose -f docker-compose.prod.yml up -d --remove-orphans

deploy-minimal:
	docker compose -f docker-compose.prod.yml pull postgres back web
	docker compose -f docker-compose.prod.yml up -d postgres back web

