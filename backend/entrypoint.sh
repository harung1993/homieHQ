#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
export PGPASSWORD=${POSTGRES_PASSWORD:-propertypal}
until pg_isready -h db -p 5432 -U ${POSTGRES_USER:-propertypal}; do
  echo "Waiting for database connection..."
  sleep 2
done

# Ensure the DATABASE_URL is set for Flask-SQLAlchemy
if [ -n "$DATABASE_URL" ]; then
  export SQLALCHEMY_DATABASE_URI=$DATABASE_URL
  echo "Using database: $SQLALCHEMY_DATABASE_URI"
fi

# Create upload directories
UPLOAD_DIR=${UPLOAD_FOLDER:-uploads}
echo "Creating upload directories in $UPLOAD_DIR..."
mkdir -p $UPLOAD_DIR/documents/photos

# Make sure environment variables are correctly set
echo "Environment variables:"
echo "SQLALCHEMY_DATABASE_URI: $SQLALCHEMY_DATABASE_URI"
echo "UPLOAD_FOLDER: $UPLOAD_FOLDER"
echo "FLASK_ENV: $FLASK_ENV"

# Initialize the database with Flask-Migrate - with better error handling
if [ ! -d "migrations" ]; then
  echo "Initializing the database..."
  flask db init || { echo "Failed to initialize migrations"; exit 1; }
  flask db migrate -m "Initial migration" || { echo "Failed to create initial migration"; exit 1; }
  flask db upgrade || { echo "Failed to apply initial migration"; exit 1; }
else
  echo "Running database migrations if needed..."
  flask db migrate -m "Auto-migration" || { echo "Warning: Migration creation failed, continuing..."; }
  flask db upgrade || { echo "Failed to apply migrations"; exit 1; }
fi

# Create tables if they don't exist
echo "Creating tables if they don't exist..."
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()" || { echo "Failed to create tables"; exit 1; }

# Start the application
echo "Starting Flask application..."
exec python run.py