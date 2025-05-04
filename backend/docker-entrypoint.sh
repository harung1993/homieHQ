#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
until pg_isready -h db -p 5432 -U ${POSTGRES_USER:-propertypal}; do
  echo "Waiting for database connection..."
  sleep 2
done

# Create upload directories
UPLOAD_DIR=${UPLOAD_FOLDER:-uploads}
echo "Creating upload directories in $UPLOAD_DIR..."
mkdir -p $UPLOAD_DIR/documents/photos

# Initialize the database with Flask-Migrate
if [ ! -d "migrations" ]; then
  echo "Initializing the database..."
  flask db init
  flask db migrate -m "Initial migration"
  flask db upgrade
else
  echo "Running database migrations if needed..."
  flask db migrate -m "Auto-migration"
  flask db upgrade
fi

# Create tables if they don't exist
echo "Creating tables if they don't exist..."
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"

# Execute the CMD
exec "$@"