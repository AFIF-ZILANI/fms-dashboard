#!/bin/sh
set -e

# Check required commands
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "❌ pg_dump is not installed. Please install PostgreSQL client tools."
  exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
  echo "❌ pg_restore is not installed. Please install PostgreSQL client tools."
  exit 1
fi

# Load .env file
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env file not found!"
  exit 1
fi

# Check required env vars
if [ -z "$PROD_DB_URL" ]; then
  echo "❌ PROD_DB_URL is missing in .env"
  exit 1
fi

if [ -z "$DEV_DB_URL" ]; then
  echo "❌ DEV_DB_URL is missing in .env"
  exit 1
fi

DUMP_FILE="prod_dump_$(date +%Y%m%d_%H%M%S).dump"

echo "🚀 Dumping PROD database into $DUMP_FILE ..."
pg_dump "$PROD_DB_URL" --format=c --no-owner --no-acl -f "$DUMP_FILE"

echo "♻️ Restoring dump into DEV database..."
pg_restore --clean --if-exists --no-owner --no-acl -d "$DEV_DB_URL" "$DUMP_FILE"

echo "🧹 Cleaning up dump file..."
rm -f "$DUMP_FILE"

echo "✅ Sync completed successfully!"
