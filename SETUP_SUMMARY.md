# PropertyPal Setup Summary

This document summarizes the Docker and demo mode setup completed for PropertyPal.

## What Was Completed

### 1. Docker Configuration ✅

Created a comprehensive Docker setup with three environment modes:

- **Development Mode** (`.env.dev`)
  - Hot-reload enabled
  - Email verification disabled
  - SQLite or PostgreSQL database
  - Debug mode ON

- **Demo Mode** (`.env.demo`)
  - 4 pre-configured demo accounts
  - 10-minute auto-logout sessions
  - Email verification disabled
  - Production-like environment

- **Production Mode** (`.env.prod`)
  - Full security enabled
  - Email verification required
  - Strong passwords required
  - SSL support ready

### 2. Demo Mode Features ✅

- **Demo Accounts**: 4 accounts with pre-loaded data
  - demo1@propertypal.com / Demo123!
  - demo2@propertypal.com / Demo123!
  - demo3@propertypal.com / Demo123!
  - demo4@propertypal.com / Demo123!

- **Auto-Logout**: Sessions expire after 10 minutes
  - Warning banner shown 2 minutes before logout
  - Countdown timer displayed
  - Automatic redirect to login page

- **Demo Account Seeding**: Script to populate demo accounts with:
  - Sample properties
  - Expenses and budgets
  - Maintenance items
  - Appliances

### 3. Configuration Files

#### Created Files:
- `docker-compose.yml` - Main Docker Compose configuration
- `.env.dev` - Development environment variables
- `.env.demo` - Demo environment variables
- `.env.prod` - Production environment variables
- `.env.example` - Template for environment variables
- `DOCKER.md` - Complete Docker documentation
- `docker-start.sh` - Quick start script
- `.dockerignore` - Docker build exclusions
- `backend/seed_demo_accounts.py` - Demo data seeding script

#### Updated Files:
- `backend/config.py` - Added DemoConfig, SKIP_EMAIL_VERIFICATION, DEMO_MODE
- `backend/run.py` - Support for DemoConfig selection
- `backend/app/api/auth.py` - Email verification skip logic
- `frontend/src/hooks/useDemoMode.js` - Demo mode React hook (NEW)
- `frontend/src/components/common/DemoWarningBanner.js` - Warning banner component (NEW)
- `frontend/src/components/auth/LoginForm.js` - Demo accounts display, login time tracking
- `frontend/src/components/homeowner/HomieHQDashboard.js` - Added DemoWarningBanner
- `nginx/nginx.conf` - Updated service names (web → backend)
- `.gitignore` - Cleaned up, allows .env files to be committed (templates only)

#### Removed Files:
- `frontend/docker-compose.yaml` - Old configuration (had old branding)
- `backend/docker-compose.yaml` - Old configuration (had old branding)

### 4. Email Verification Override

Added flexible email verification control:

- `SKIP_EMAIL_VERIFICATION` environment variable
- Skips verification when:
  - DEBUG mode is enabled
  - SKIP_EMAIL_VERIFICATION=true
  - DEMO_MODE=true
- Can be configured per environment

### 5. Docker Services

The setup includes 4 services:

1. **db** (PostgreSQL)
   - Persistent data storage
   - Health checks
   - Automatic initialization

2. **backend** (Flask/Python)
   - Auto-migration on startup
   - Email verification bypass support
   - Demo mode support
   - Port 5008

3. **frontend** (React)
   - Built from source
   - Served via node
   - Port 3000

4. **nginx** (Reverse Proxy)
   - Routes / → frontend
   - Routes /api/ → backend
   - Routes /uploads/ → backend
   - Ports 80 and 443

## Quick Start

### Option 1: Using the Start Script

```bash
# Make sure script is executable
chmod +x docker-start.sh

# Run the script and follow prompts
./docker-start.sh
```

### Option 2: Manual Start

```bash
# Development
cp .env.dev .env
docker-compose up -d

# Demo
cp .env.demo .env
docker-compose up -d
docker-compose exec backend python seed_demo_accounts.py

# Production
cp .env.prod .env
# Edit .env with secure passwords!
docker-compose up -d
```

## Environment Variables

### Required in All Modes:
- `FLASK_ENV` - development or production
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT secret key

### Demo Mode Specific:
- `DEMO_MODE=true` - Enables demo features
- `DEMO_SESSION_TIMEOUT=600` - Session timeout in seconds
- `SKIP_EMAIL_VERIFICATION=true` - Disables email verification

### Development Mode Specific:
- `DEBUG=true` - Enables debug mode
- `SKIP_EMAIL_VERIFICATION=true` - Disables email verification

### Production Mode Required:
- `MAIL_USERNAME` - SMTP email username
- `MAIL_PASSWORD` - SMTP email password
- `MAIL_SERVER` - SMTP server address
- `FRONTEND_URL` - Frontend URL for emails

## Testing Checklist

- [x] Docker Compose file created with all services
- [x] Environment files for dev/demo/prod created
- [x] Backend config updated with demo mode support
- [x] Email verification can be bypassed via config
- [x] Demo account seeding script created
- [x] Demo mode auto-logout implemented
- [x] Demo warning banner component created
- [x] Login form shows demo accounts
- [x] Docker documentation created
- [x] Quick start script created
- [x] .gitignore updated
- [x] Old docker-compose files removed
- [x] Nginx config updated with correct service names

## Next Steps

To fully test the Docker setup:

1. **Build Images**:
   ```bash
   docker-compose build
   ```

2. **Start Services**:
   ```bash
   cp .env.dev .env
   docker-compose up -d
   ```

3. **Check Logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Verify Services**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5008
   - Nginx: http://localhost

5. **Test Demo Mode**:
   ```bash
   cp .env.demo .env
   docker-compose down -v  # Remove old data
   docker-compose up -d
   docker-compose exec backend python seed_demo_accounts.py
   ```
   - Login with demo1@propertypal.com / Demo123!
   - Verify 10-minute countdown appears
   - Wait for auto-logout (or test with shorter timeout)

6. **Production Deployment**:
   - Update `.env.prod` with secure passwords
   - Configure email settings
   - Set up SSL certificates in `nginx/ssl/`
   - Update nginx config for SSL
   - Deploy to server

## Architecture Overview

```
┌─────────────────────────────────────────┐
│              nginx:80                    │
│         (Reverse Proxy)                  │
│  Routes:                                 │
│  - / → frontend:3000                     │
│  - /api/ → backend:5008                  │
│  - /uploads/ → backend:5008              │
└─────────────────────────────────────────┘
           │                   │
           ▼                   ▼
    ┌─────────────┐    ┌─────────────────┐
    │  frontend   │    │    backend      │
    │  (React)    │    │  (Flask/Python) │
    │  Port 3000  │    │   Port 5008     │
    └─────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │  PostgreSQL │
                       │   Port 5432 │
                       └─────────────┘
```

## Important Security Notes

### Development:
- Uses default passwords (propertypal/propertypal)
- Email verification disabled
- Debug mode enabled
- **Do not use in production!**

### Demo:
- Uses demo passwords
- Email verification disabled
- Sessions limited to 10 minutes
- Demo accounts reset periodically
- **Suitable for public testing/demos**

### Production:
- **Must** change all passwords
- **Must** configure email service
- Email verification enabled
- SSL recommended
- Regular backups required

## Troubleshooting

See `DOCKER.md` for detailed troubleshooting steps.

Common issues:
- **Services won't start**: Check `docker-compose logs`
- **Database connection failed**: Ensure db service is healthy
- **Frontend can't reach backend**: Check CORS_ALLOWED_ORIGINS
- **Email not working**: Set SKIP_EMAIL_VERIFICATION=true for dev/demo

## Documentation

- **Docker Guide**: See `DOCKER.md`
- **Main README**: See `README.md`
- **Environment Templates**: See `.env.example`, `.env.dev`, `.env.demo`, `.env.prod`

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review documentation: `DOCKER.md`
- Check configuration: Review `.env` file
