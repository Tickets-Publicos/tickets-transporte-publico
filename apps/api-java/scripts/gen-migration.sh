#!/bin/bash
# gen-migration.sh - Gera uma migration SQL a partir das entidades JPA usando Hibernate
# Uso: ./gen-migration.sh [nome]

set -e
NAME="${1:-baseline}"

PROJECT_ROOT="$(dirname "$(realpath "$0")")/.."
REPO_ROOT="$(dirname "$(dirname "$PROJECT_ROOT")")"
RESOURCES="$PROJECT_ROOT/src/main/resources"
MIGRATION_DIR="$RESOURCES/db/migration"
CHANGELOG_DIR="$RESOURCES/db/changelog"

mkdir -p "$MIGRATION_DIR" "$CHANGELOG_DIR"

# Carrega variáveis do .env
if [ -f "$REPO_ROOT/.env" ]; then
  echo "Carregando variáveis de $REPO_ROOT/.env"
  export $(grep -v '^#' "$REPO_ROOT/.env" | xargs)
fi

DB_URL="$SPRING_DATASOURCE_URL"
DB_USER="$SPRING_DATASOURCE_USERNAME"
DB_PASS="$SPRING_DATASOURCE_PASSWORD"
if [ -z "$DB_URL" ]; then
  echo "SPRING_DATASOURCE_URL não definido" >&2
  exit 1
fi

# Calcula próxima versão Flyway
NEXT=1
for f in "$MIGRATION_DIR"/V*__*.sql; do
  [[ -e "$f" ]] || continue
  V=$(basename "$f" | sed -n 's/^V\([0-9]*\)__.*$/\1/p')
  if [ "$V" -gt "$NEXT" ]; then NEXT=$((V+1)); fi
  if [ "$V" -eq "$NEXT" ]; then NEXT=$((NEXT+1)); fi
done
TARGET_SQL="$MIGRATION_DIR/V${NEXT}__${NAME}.sql"
CREATE_SCHEMA_PATH="$CHANGELOG_DIR/jpa_create.sql"

# Gera config temporária para exportar schema
TEMP_CONFIG="$CHANGELOG_DIR/temp-schema-gen.yml"
cat > "$TEMP_CONFIG" <<EOF
spring:
  datasource:
    url: $DB_URL
    username: $DB_USER
    password: $DB_PASS
  flyway:
    enabled: false
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      jakarta:
        persistence:
          schema-generation:
            scripts:
              action: create
              create-target: $CREATE_SCHEMA_PATH
              create-source: metadata
            database:
              action: none
      hibernate:
        format_sql: true
  main:
    web-application-type: none
EOF

pushd "$PROJECT_ROOT"
# Executa exportação do schema via SchemaExporter
./mvnw -q -DskipTests -Dspring-boot.run.main-class=com.tickets.api.SchemaExporter -Dspring.config.additional-location="file:$TEMP_CONFIG" spring-boot:run
popd
rm -f "$TEMP_CONFIG"

if [ ! -f "$CREATE_SCHEMA_PATH" ]; then
  echo "Falha ao gerar schema JPA: $CREATE_SCHEMA_PATH não criado" >&2
  exit 1
fi

if [ $(stat -c%s "$CREATE_SCHEMA_PATH") -lt 100 ]; then
  echo "Schema gerado está vazio ou incompleto" >&2
  exit 1
fi

echo "-- Flyway baseline gerado a partir do JPA" > "$TARGET_SQL"
echo "-- Timestamp: $(date -Iseconds)" >> "$TARGET_SQL"
echo "\n-- Extensões necessárias" >> "$TARGET_SQL"
echo "CREATE EXTENSION IF NOT EXISTS pgcrypto;\n" >> "$TARGET_SQL"
cat "$CREATE_SCHEMA_PATH" >> "$TARGET_SQL"
echo "✔ Migration gerada: $TARGET_SQL"