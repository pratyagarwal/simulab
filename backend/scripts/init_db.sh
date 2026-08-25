#!/bin/bash
# Initialize database with migrations

set -e

echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=simulab psql -h localhost -U simulab -d simulab -c "SELECT 1" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is ready!"
echo "Running Alembic migrations..."

cd "$(dirname "$0")/.."
alembic upgrade head

echo "Database initialization complete!"
