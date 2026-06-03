package api

//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@v2.6.0 -o ../handler/gen/types.go -generate types -package gen openapi.yaml
//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@v2.6.0 -o ../handler/gen/server.go -generate chi-server,strict-server,skip-prune -package gen openapi.yaml
