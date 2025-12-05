# PropertyPal Docker Deployment Guide

This guide explains how to run PropertyPal using Docker in different environments.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

## Quick Start

### Development Mode

```bash
# Copy the development environment file
cp .env.dev .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5008
- Nginx (Reverse Proxy): http://localhost:80

### Demo Mode

```bash
# Copy the demo environment file
cp .env.demo .env

# Update the .env file with your settings (passwords, email config, etc.)

# Start all services
docker-compose up -d

# Seed demo accounts
docker-compose exec backend python seed_demo_accounts.py

# View logs
docker-compose logs -f
```

Demo accounts will be created:
- demo1@propertypal.com / Demo123!
- demo2@propertypal.com / Demo123!
- demo3@propertypal.com / Demo123!
- demo4@propertypal.com / Demo123!

Sessions expire after 10 minutes in demo mode.

### Production Mode

```bash
# Copy the production environment file
cp .env.prod .env

# IMPORTANT: Update .env with secure passwords and keys!
# - POSTGRES_PASSWORD
# - SECRET_KEY
# - JWT_SECRET_KEY
# - MAIL_USERNAME / MAIL_PASSWORD (for email verification)

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Environment Variables

### Required Variables

- `FLASK_ENV`: `development` or `production`
- `DEBUG`: `true` or `false`
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password (use strong password in production!)
- `POSTGRES_DB`: Database name
- `SECRET_KEY`: Flask secret key (must be changed in production!)
- `JWT_SECRET_KEY`: JWT secret key (must be changed in production!)

### Optional Variables

- `DEMO_MODE`: `true` or `false` (enables demo mode features)
- `SKIP_EMAIL_VERIFICATION`: `true` or `false` (skips email verification)
- `DEMO_SESSION_TIMEOUT`: Timeout in seconds (default: 600 = 10 minutes)
- `MAIL_SERVER`: SMTP server (default: smtp.gmail.com)
- `MAIL_PORT`: SMTP port (default: 587)
- `MAIL_USERNAME`: Email account for sending emails
- `MAIL_PASSWORD`: Email account password
- `FRONTEND_URL`: Frontend URL for email links
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins

### Port Configuration

- `BACKEND_PORT`: Backend port (default: 5008)
- `FRONTEND_PORT`: Frontend port (default: 3000)
- `PORT`: Nginx HTTP port (default: 80)
- `HTTPS_PORT`: Nginx HTTPS port (default: 443)

## Services

The Docker Compose setup includes:

1. **PostgreSQL Database** (`db`)
   - Persistent data storage
   - Health checks enabled
   - Port 5432 (internal)

2. **Flask Backend** (`backend`)
   - Python/Flask API server
   - Auto-migration on startup
   - Port 5008

3. **React Frontend** (`frontend`)
   - React development server
   - Hot-reload enabled (in dev mode)
   - Port 3000

4. **Nginx** (`nginx`)
   - Reverse proxy
   - Routes `/api/*` to backend
   - Routes `/*` to frontend
   - Port 80 (HTTP) and 443 (HTTPS)

## Common Commands

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Access Shell
```bash
# Backend shell
docker-compose exec backend bash

# Database shell
docker-compose exec db psql -U propertypal -d propertypal
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend flask db upgrade

# Create new migration
docker-compose exec backend flask db migrate -m "Description"

# Reset database (WARNING: Deletes all data!)
docker-compose exec backend python reset_app.py
```

### Seed Demo Data
```bash
docker-compose exec backend python seed_demo_accounts.py
```

## Volumes

Persistent data is stored in Docker volumes:

- `postgres_data`: Database data
- `app_uploads`: User-uploaded files (documents, photos)

### Backup Volumes
```bash
# Backup database
docker-compose exec db pg_dump -U propertypal propertypal > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U propertypal propertypal
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Remove all containers and volumes (WARNING: Deletes data!)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Manually check database connection
docker-compose exec backend python -c "from app import db; print('DB Connected!' if db else 'Failed')"
```

### Frontend can't reach backend
1. Check `CORS_ALLOWED_ORIGINS` in `.env`
2. Ensure backend is running: `docker-compose ps backend`
3. Check backend logs: `docker-compose logs backend`

### Email verification not working
In development/demo:
- Set `SKIP_EMAIL_VERIFICATION=true`

In production:
- Configure `MAIL_USERNAME` and `MAIL_PASSWORD`
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

## Production Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a random string
- [ ] Change `JWT_SECRET_KEY` to a random string
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Configure email settings (`MAIL_USERNAME`, `MAIL_PASSWORD`)
- [ ] Set `SKIP_EMAIL_VERIFICATION=false`
- [ ] Set `DEBUG=false`
- [ ] Configure proper domain in `FRONTEND_URL`
- [ ] Set up SSL certificates in `nginx/ssl/`
- [ ] Configure backup strategy for volumes
- [ ] Set up monitoring and logging

## SSL/HTTPS Setup

1. Obtain SSL certificates (e.g., Let's Encrypt)
2. Place certificates in `nginx/ssl/`:
   - `nginx/ssl/cert.pem`
   - `nginx/ssl/key.pem`
3. Update `nginx/nginx.conf` to enable SSL
4. Restart nginx: `docker-compose restart nginx`

## Support

For issues or questions, please check:
- Project README: [README.md](README.md)
- GitHub Issues: [github.com/yourrepo/issues](https://github.com/yourrepo/issues)
