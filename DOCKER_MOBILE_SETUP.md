# 🐳 Docker + Mobile App Setup Guide

Complete guide for running PropertyPal with Docker and connecting the mobile app.

## 📋 Overview

Your PropertyPal backend runs in Docker containers, which means:
- **Backend API** runs on port **5008** (exposed from Docker)
- **Frontend** runs on port **3000**
- **Nginx** runs on port **80**
- **Database** (PostgreSQL) runs internally

The mobile app needs to connect to the **Backend API on port 5008**.

## 🚀 Quick Start

### Step 1: Find Your Machine's IP Address

**On Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for your **local IP address** on your WiFi network (e.g., `192.168.1.100`).

### Step 2: Update Mobile App Configuration

Edit `/mobile-app/src/config/api.js` at line 9:

```javascript
const LOCAL_IP = '192.168.1.100'; // Replace with YOUR IP address
```

The file is already configured to use **port 5008** (Docker backend port).

### Step 3: Start Docker Containers

```bash
# From the project root
docker-compose up -d

# Or to rebuild
docker-compose up -d --build
```

### Step 4: Verify Backend is Running

```bash
# Check containers are running
docker-compose ps

# Test the API
curl http://localhost:5008/api/auth/login
```

You should see a response (even if it's an error about missing credentials).

### Step 5: Start Mobile App

```bash
cd mobile-app
npm start
```

### Step 6: Test Connection

In the mobile app:
1. Go to Login Screen → "⚙️ Server Settings"
2. You should see: `http://YOUR_IP:5008/api`
3. Try to login with your backend credentials!

## 🔧 Configuration Details

### Docker Backend Port

The backend is exposed on **port 5008** (configured in `docker-compose.yml`):

```yaml
backend:
  ports:
    - "${BACKEND_PORT:-5008}:5008"
```

You can change this port by setting `BACKEND_PORT` in your `.env` file.

### Mobile App Configuration

The mobile app automatically uses port 5008 when `BACKEND_PORT` is set to `DOCKER_PORT`:

```javascript
// In src/config/api.js
const DOCKER_PORT = '5008';      // Docker backend port
const DIRECT_PORT = '5000';      // Direct Python run port

const BACKEND_PORT = DOCKER_PORT; // Currently using Docker
```

### CORS Configuration

Docker is configured to allow mobile connections:

```yaml
backend:
  environment:
    - MOBILE_CORS_ENABLED=true
```

This enables CORS for requests from mobile devices.

## 📱 Platform-Specific Setup

### iOS Simulator

Update `/mobile-app/src/config/api.js` line 28:

```javascript
return `http://localhost:${BACKEND_PORT}/api`;  // Uncomment this line
```

### Android Emulator

Update `/mobile-app/src/config/api.js` line 29:

```javascript
return `http://10.0.2.2:${BACKEND_PORT}/api`;   // Uncomment this line
```

### Physical Device (iPhone/Android)

Keep the default configuration (line 30) but update `LOCAL_IP`:

```javascript
const LOCAL_IP = '192.168.1.100'; // Your machine's IP
return `http://${LOCAL_IP}:${BACKEND_PORT}/api`;
```

**Requirements:**
- Phone and computer must be on the **same WiFi network**
- Firewall must allow connections on port 5008

## 🔐 Environment Variables

### .env File (Project Root)

Create or update `.env` in the project root:

```bash
# Backend Configuration
BACKEND_PORT=5008

# Database Configuration
POSTGRES_USER=propertypal
POSTGRES_PASSWORD=propertypal
POSTGRES_DB=propertypal

# App Configuration
DEMO_MODE=true
SKIP_EMAIL_VERIFICATION=true

# JWT Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# CORS for Mobile
MOBILE_CORS_ENABLED=true
```

### .env.mobile File (Reference)

The `.env.mobile` file in the project root contains example configuration:

```bash
# Replace with YOUR IP address
MOBILE_API_URL=http://192.168.1.100:5008/api
```

## 🧪 Testing the Connection

### 1. Check Docker Containers

```bash
# View running containers
docker-compose ps

# View backend logs
docker-compose logs backend

# View all logs
docker-compose logs -f
```

### 2. Test API from Terminal

```bash
# Test health check
curl http://localhost:5008/api/auth/login

# From your IP (what mobile app will use)
curl http://YOUR_IP:5008/api/auth/login
```

### 3. Test from Mobile App

1. Open mobile app
2. Go to Server Settings
3. Current URL should show: `http://YOUR_IP:5008/api`
4. Try logging in with demo credentials

## 🔄 Switching Between Docker and Direct Run

### Using Docker (Current Setup)

```javascript
// In src/config/api.js
const BACKEND_PORT = DOCKER_PORT; // Port 5008
```

Start backend:
```bash
docker-compose up -d
```

### Using Direct Python Run

```javascript
// In src/config/api.js
const BACKEND_PORT = DIRECT_PORT; // Port 5000
```

Start backend:
```bash
cd backend
source propertypal_env/bin/activate
python run.py
```

## 📊 Network Architecture

```
Mobile Device (Phone/Emulator)
        │
        │ HTTP Request to http://YOUR_IP:5008/api
        ↓
Your Computer (WiFi: 192.168.1.100)
        │
        ├─► Port 5008 → Docker Container (Backend)
        │                    │
        │                    ├─► Flask API
        │                    │
        │                    └─► PostgreSQL (internal)
        │
        ├─► Port 3000 → Docker Container (Frontend)
        │
        └─► Port 80 → Docker Container (Nginx)
```

## 🐛 Troubleshooting

### Issue: Mobile app can't connect

**Check:**
1. Docker containers are running: `docker-compose ps`
2. Backend is accessible: `curl http://localhost:5008/api/auth/login`
3. IP address is correct in mobile config
4. Phone and computer are on same WiFi
5. Firewall allows connections on port 5008

**Fix:**
```bash
# Restart Docker containers
docker-compose restart

# Check backend logs
docker-compose logs backend

# Test from terminal
curl http://YOUR_IP:5008/api/auth/login
```

### Issue: "CORS Error" in mobile app

**Check:**
1. `MOBILE_CORS_ENABLED=true` in docker-compose.yml
2. Backend logs for CORS errors

**Fix:**
```bash
# Restart backend with updated CORS
docker-compose restart backend
```

### Issue: "Connection refused"

**Check:**
1. Port 5008 is exposed: `docker-compose ps`
2. No other service using port 5008: `lsof -i :5008`

**Fix:**
```bash
# Change port in .env
BACKEND_PORT=5009

# Restart
docker-compose down
docker-compose up -d

# Update mobile config to use 5009
```

### Issue: iOS Simulator can't connect

**Use localhost instead of IP:**
```javascript
return `http://localhost:${BACKEND_PORT}/api`;
```

### Issue: Android Emulator can't connect

**Use special emulator IP:**
```javascript
return `http://10.0.2.2:${BACKEND_PORT}/api`;
```

## 🔒 Firewall Configuration

### Mac

```bash
# Allow connections on port 5008
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Add Python or allow incoming connections
```

### Windows

```bash
# Allow port 5008 in Windows Firewall
# Control Panel → Windows Defender Firewall → Advanced Settings
# Inbound Rules → New Rule → Port → 5008
```

### Linux

```bash
# UFW
sudo ufw allow 5008

# iptables
sudo iptables -A INPUT -p tcp --dport 5008 -j ACCEPT
```

## 📝 Development Workflow

### 1. Start Everything

```bash
# Terminal 1: Start Docker
docker-compose up

# Terminal 2: Start Mobile App
cd mobile-app
npm start
```

### 2. Make Backend Changes

Backend code changes are automatically reflected (hot-reload enabled in docker-compose.yml):

```yaml
volumes:
  - ./backend:/app  # For development hot-reload
```

### 3. View Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f db
```

### 4. Stop Everything

```bash
# Stop containers (preserves data)
docker-compose stop

# Stop and remove containers (preserves data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

## 🎯 Production Deployment

For production, update:

1. **Mobile app** (`src/config/api.js`):
```javascript
// Production URL
return 'https://api.yourdomain.com/api';
```

2. **Docker compose** (`.env`):
```bash
BACKEND_PORT=5008
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DEMO_MODE=false
SKIP_EMAIL_VERIFICATION=false
```

3. **SSL/HTTPS**:
   - Configure nginx with SSL certificates
   - Update mobile app to use https://

## ✅ Quick Reference

| Component | Port | URL (Local) | URL (Mobile) |
|-----------|------|-------------|--------------|
| Backend API | 5008 | http://localhost:5008 | http://YOUR_IP:5008 |
| Frontend | 3000 | http://localhost:3000 | http://YOUR_IP:3000 |
| Nginx | 80 | http://localhost | http://YOUR_IP |
| PostgreSQL | 5432 | Internal only | Internal only |

## 🚀 Next Steps

1. ✅ Docker containers running
2. ✅ Mobile app configured with correct IP
3. ✅ Test login from mobile app
4. ⬜ Update screens to use real data
5. ⬜ Test all API endpoints
6. ⬜ Deploy to production

---

**You're all set!** Your Docker backend is ready and the mobile app can connect to it. 🎉
