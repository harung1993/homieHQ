#!/bin/bash
set -e

# Database credentials from environment
DB_USER=${POSTGRES_USER:-homiehq}
DB_PASSWORD=${POSTGRES_PASSWORD:-homiehq}
DB_NAME=${POSTGRES_DB:-homiehq}
DB_HOST=${DATABASE_HOST:-db}
DB_PORT=${DATABASE_PORT:-5432}

# Construct DATABASE_URL if not provided
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

echo "Using database connection: $DATABASE_URL"
export SQLALCHEMY_DATABASE_URI=$DATABASE_URL

# Wait for PostgreSQL to be ready with better error handling
echo "Waiting for PostgreSQL to start..."
export PGPASSWORD=$DB_PASSWORD

max_tries=30
count=0
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; do
    echo "Waiting for database connection... (attempt $((count+1))/$max_tries)"
    sleep 3
    count=$((count+1))
    if [ $count -ge $max_tries ]; then
        echo "Error: Could not connect to database after $max_tries attempts"
        exit 1
    fi
done
echo "Database is ready!"

# Check if we need to initialize the database
DB_TABLES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" | tr -d ' ')

echo "Found $DB_TABLES tables in database"

# Initialize migrations folder if it doesn't exist
if [ ! -d "migrations" ]; then
    echo "Creating migrations folder..."
    flask db init
fi

# Always try to run migrations
echo "Running database migrations..."
if [ $DB_TABLES -lt 5 ]; then
    echo "Database appears to be empty. Creating initial migration..."
    flask db migrate -m "Initial migration" || true
fi

echo "Applying migrations..."
flask db upgrade

# Start application based on environment
if [ "$FLASK_ENV" = "production" ]; then
    echo "Starting production server with gunicorn..."
    exec gunicorn --bind 0.0.0.0:5008 --workers 2 --timeout 120 "run:app"
else
    echo "Starting development server..."
    exec python run.py
fi