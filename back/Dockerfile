# syntax=docker/dockerfile:1.4
# Corporate HTTPS inspection: build with a root PEM, e.g.
#   docker compose build --secret id=corp_ca,src=$HOME/corp-root.pem
# or: make restart CORP_CA=$HOME/corp-root.pem
FROM golang:1.24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ca-certificates
RUN --mount=type=secret,id=corp_ca,required=false \
    sh -c 'if [ -s /run/secrets/corp_ca ]; then \
      cp /run/secrets/corp_ca /usr/local/share/ca-certificates/extra-ca.crt && \
      update-ca-certificates; \
    fi'
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:3.19
WORKDIR /app
# Reuse bundle from builder so runtime TLS trust matches build (and optional corp CA); avoids apk fetch on MITM networks.
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /app/server .
COPY --from=builder /app/data/chords.yaml ./data/chords.yaml
EXPOSE 8081
CMD ["./server"]
