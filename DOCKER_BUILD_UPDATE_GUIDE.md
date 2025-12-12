# 🐳 Docker Build & Update Guide

Complete guide for building and updating PropertyPal Docker containers.

## Quick Commands

```bash
# Build and start all containers
docker-compose up -d --build

# Update specific container
docker-compose up -d --build backend

# Rebuild without cache
docker-compose build --no-cache

# Stop all containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

## Understanding Your Docker Setup

Your PropertyPal stack consists of:

| Container | Purpose | Port |
|-----------|---------|------|
| `backend` | Flask API | 5008 |
| `frontend` | React Web App | 3000 |
| `nginx` | Reverse Proxy | 80 |
| `db` | PostgreSQL Database | 5432 (internal) |

## Build Scenarios

### 1. First Time Setup

```bash
# Clone repository
git clone <your-repo-url>
cd homieHQ

# Create .env file (if not exists)
cp .env.example .env

# Build and start all containers
docker-compose up -d --build

# Check containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Update After Code Changes

**When you update backend or frontend code:**

```bash
# Option A: Rebuild and restart all containers
docker-compose up -d --build

# Option B: Rebuild specific container only
docker-compose up -d --build backend
# or
docker-compose up -d --build frontend
```

**When to use:**
- After pulling changes from git
- After modifying Python/JavaScript code
- After updating dependencies (requirements.txt, package.json)

### 3. Update After Dependency Changes

**Backend (requirements.txt changed):**

```bash
# Rebuild backend without cache
docker-compose build --no-cache backend

# Restart container
docker-compose up -d backend
```

**Frontend (package.json changed):**

```bash
# Rebuild frontend without cache
docker-compose build --no-cache frontend

# Restart container
docker-compose up -d frontend
```

### 4. Database Migration Updates

**After creating new database migrations:**

```bash
# Backend container handles migrations automatically on startup
# Just rebuild and restart
docker-compose up -d --build backend

# Or run migrations manually
docker-compose exec backend flask db upgrade
```

### 5. Environment Variable Changes

**After updating .env file:**

```bash
# Recreate containers with new environment
docker-compose up -d --force-recreate

# Or restart specific container
docker-compose restart backend
```

### 6. Complete Rebuild (Nuclear Option)

**When things are broken and you need a fresh start:**

```bash
# Stop and remove everything (keeps database data)
docker-compose down

# Stop and remove everything INCLUDING database
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build

# Or rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## Daily Development Workflow

### Starting Work

```bash
# Start all containers
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### Making Changes

**Backend changes are auto-reloaded** (hot reload enabled):
```yaml
# In docker-compose.yml
volumes:
  - ./backend:/app  # Maps your local code to container
```

Just edit backend files and save - changes apply automatically!

**Frontend changes require rebuild:**
```bash
# After editing frontend code
docker-compose up -d --build frontend
```

### Ending Work

```bash
# Stop containers (preserves data)
docker-compose stop

# Or stop and remove containers (preserves data)
docker-compose down
```

## Monitoring & Debugging

### View Container Status

```bash
# List running containers
docker-compose ps

# View all containers (including stopped)
docker ps -a
```

### View Logs

```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 backend

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00 backend
```

### Execute Commands Inside Container

```bash
# Open bash shell in backend container
docker-compose exec backend bash

# Run Flask commands
docker-compose exec backend flask db upgrade
docker-compose exec backend flask shell

# Check Python version
docker-compose exec backend python --version

# Run database commands
docker-compose exec db psql -U propertypal -d propertypal
```

### Check Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune
```

## Port Management

### Check What's Running on Ports

```bash
# Check port 5008 (backend)
lsof -i :5008

# Check port 3000 (frontend)
lsof -i :3000

# Check port 80 (nginx)
lsof -i :80
```

### Change Ports

Edit `.env` file:
```bash
BACKEND_PORT=5009  # Change from 5008 to 5009
FRONTEND_PORT=3001 # Change from 3000 to 3001
```

Then rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

## Database Management

### Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U propertypal propertypal > backup.sql

# Create backup with timestamp
docker-compose exec db pg_dump -U propertypal propertypal > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T db psql -U propertypal propertypal < backup.sql
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove database volume
docker volume rm homiehq_postgres_data

# Restart (creates fresh database)
docker-compose up -d
```

### Access Database Directly

```bash
# Open PostgreSQL shell
docker-compose exec db psql -U propertypal -d propertypal

# Run queries
# SELECT * FROM users;
# \dt (list tables)
# \q (quit)
```

## Image Management

### List Images

```bash
# List all Docker images
docker images

# List PropertyPal images
docker images | grep propertypal
```

### Remove Old Images

```bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a

# Remove specific image
docker rmi homiehq_backend:latest
```

### Rebuild Specific Image

```bash
# Rebuild backend image from scratch
docker-compose build --no-cache backend

# Rebuild all images from scratch
docker-compose build --no-cache
```

## Production Deployment

### Build for Production

```bash
# Set environment to production
export FLASK_ENV=production

# Build with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Push to Registry (Docker Hub)

```bash
# Tag images
docker tag homiehq_backend:latest yourusername/propertypal-backend:latest
docker tag homiehq_frontend:latest yourusername/propertypal-frontend:latest

# Login to Docker Hub
docker login

# Push images
docker push yourusername/propertypal-backend:latest
docker push yourusername/propertypal-frontend:latest
```

### Pull on Production Server

```bash
# On production server
docker pull yourusername/propertypal-backend:latest
docker pull yourusername/propertypal-frontend:latest

# Update containers
docker-compose up -d --no-build
```

## Troubleshooting

### Container Won't Start

```bash
# View error logs
docker-compose logs backend

# Check if port is in use
lsof -i :5008

# Force recreation
docker-compose up -d --force-recreate backend
```

### "Port already allocated" Error

```bash
# Stop conflicting container
docker ps
docker stop <container-id>

# Or change port in .env
BACKEND_PORT=5009
```

### Database Connection Error

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify credentials in .env
POSTGRES_USER=propertypal
POSTGRES_PASSWORD=propertypal
POSTGRES_DB=propertypal
```

### Backend Not Accessible from Mobile

```bash
# Check CORS is enabled
docker-compose exec backend env | grep CORS

# Should show:
# MOBILE_CORS_ENABLED=true

# Restart with CORS
docker-compose restart backend

# Test API from terminal
curl http://YOUR_IP:5008/api/auth/login
```

### Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune
```

## Configuration Files

### docker-compose.yml

Main configuration file defining all services.

**Key sections:**
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "${BACKEND_PORT:-5008}:5008"
    environment:
      - MOBILE_CORS_ENABLED=${MOBILE_CORS_ENABLED:-true}
    volumes:
      - ./backend:/app  # Hot reload
```

### .env File

Environment variables for containers.

**Required variables:**
```bash
# Backend
BACKEND_PORT=5008
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# Database
POSTGRES_USER=propertypal
POSTGRES_PASSWORD=propertypal
POSTGRES_DB=propertypal

# Features
DEMO_MODE=true
SKIP_EMAIL_VERIFICATION=true
MOBILE_CORS_ENABLED=true
```

### Dockerfile (backend/Dockerfile)

Defines how backend image is built.

**To modify:**
1. Edit `backend/Dockerfile`
2. Rebuild: `docker-compose build --no-cache backend`

### .dockerignore

Files excluded from Docker build context.

**Automatically excludes:**
- `mobile-app/` folder
- `node_modules/`
- Development docs
- `.git/`

## Performance Optimization

### Speed Up Builds

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Build in parallel
docker-compose build --parallel
```

### Reduce Image Size

```bash
# Multi-stage builds (already configured)
# Remove unnecessary files in .dockerignore
# Use alpine base images where possible
```

### Cache Management

```bash
# Clear build cache
docker builder prune

# Clear everything
docker system prune -a --volumes
```

## Checklist Before Deployment

- [ ] `.env` file configured with production values
- [ ] Database backup created
- [ ] Images built successfully: `docker-compose build`
- [ ] Containers start without errors: `docker-compose up -d`
- [ ] Backend API accessible: `curl http://localhost:5008/api/auth/login`
- [ ] Frontend loads: `http://localhost:3000`
- [ ] Database migrations applied
- [ ] CORS configured for production domains
- [ ] SSL certificates configured (if using HTTPS)

## Commands Cheat Sheet

```bash
# Build & Start
docker-compose up -d --build                 # Build and start all
docker-compose up -d --build backend         # Build and start backend only

# Stop & Remove
docker-compose down                          # Stop and remove containers
docker-compose down -v                       # Also remove volumes (data)
docker-compose stop                          # Stop containers (keep them)

# Logs
docker-compose logs -f                       # Follow all logs
docker-compose logs -f backend               # Follow backend logs
docker-compose logs --tail=100 backend       # Last 100 lines

# Status
docker-compose ps                            # List containers
docker stats                                 # Resource usage

# Execute Commands
docker-compose exec backend bash             # Open shell in backend
docker-compose exec backend flask db upgrade # Run migration
docker-compose exec db psql -U propertypal -d propertypal  # Database shell

# Rebuild
docker-compose build --no-cache              # Rebuild all from scratch
docker-compose build --no-cache backend      # Rebuild backend only

# Cleanup
docker system prune                          # Remove unused data
docker system prune -a --volumes             # Remove everything unused
```

## Updating After Git Pull

```bash
# Pull latest code
git pull origin main

# Rebuild and restart containers
docker-compose up -d --build

# Check everything is running
docker-compose ps
docker-compose logs -f
```

---

**Ready to deploy!** 🚀

For more info: https://docs.docker.com/compose/
