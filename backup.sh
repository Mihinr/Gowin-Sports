#!/bin/bash

# Gowin Sports - Database Backup Script

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set backup directory
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "💾 Starting database backup..."

# Perform backup
docker compose exec -T mysql mysqldump \
    -u root \
    -p${DB_ROOT_PASSWORD} \
    ${DB_NAME:-badminton_store} > "$BACKUP_FILE"

# Compress backup
if command -v gzip &> /dev/null; then
    echo "📦 Compressing backup..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
fi

echo "✅ Backup completed: $BACKUP_FILE"
echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Optional: Keep only last 7 backups
if [ -d "$BACKUP_DIR" ]; then
    echo "🧹 Cleaning old backups (keeping last 7)..."
    cd "$BACKUP_DIR"
    ls -t backup_*.sql* 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null || true
    cd ..
fi

echo "✨ Backup process completed!"

