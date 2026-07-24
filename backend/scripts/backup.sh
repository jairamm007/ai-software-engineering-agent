#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date -Iseconds)] Starting database backup..."

PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" pg_dump \
  -h "${POSTGRES_HOST:-localhost}" \
  -p "${POSTGRES_PORT:-5432}" \
  -U "${POSTGRES_USER:-postgres}" \
  -d "${POSTGRES_DB:-ai_software_engineering_agent}" \
  --no-owner \
  --no-acl \
  | gzip > "$BACKUP_FILE"

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date -Iseconds)] Backup completed: ${BACKUP_FILE} (${FILESIZE})"

# Cleanup backups older than 7 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
echo "[$(date -Iseconds)] Old backups cleaned up"
