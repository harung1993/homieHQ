# 🚀 Quick Start: Docker + Mobile

## ⚡ 3-Minute Setup

### 1️⃣ Find Your IP Address (30 seconds)

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Copy your local IP (e.g., `192.168.1.100`)

### 2️⃣ Update Mobile Config (30 seconds)

Edit: `/mobile-app/src/config/api.js`

Line 9: Change to YOUR IP address
```javascript
const LOCAL_IP = '192.168.1.100'; // ← Change this
```

### 3️⃣ Start Docker (1 minute)

```bash
docker-compose up -d
```

Wait for containers to start...

### 4️⃣ Start Mobile App (1 minute)

```bash
cd mobile-app
npm start
```

Press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Or scan QR code on phone

### 5️⃣ Test Connection (30 seconds)

In the mobile app:
1. Go to Login Screen
2. Tap "⚙️ Server Settings" at bottom
3. Check URL shows: `http://YOUR_IP:5008/api`
4. Try logging in!

---

## 📊 Connection Info

| What | Where | Port |
|------|-------|------|
| Backend API | http://YOUR_IP:5008/api | 5008 |
| Web Frontend | http://YOUR_IP:3000 | 3000 |
| Mobile App | Expo Go / Simulator | - |

## 🔧 Common Issues

**Can't connect?**
- Check Docker is running: `docker-compose ps`
- Check IP is correct in mobile config
- Phone on same WiFi as computer

**CORS error?**
- Already configured in docker-compose.yml
- Restart backend: `docker-compose restart backend`

**Wrong port?**
- Docker uses port **5008** (not 5000)
- Mobile config already set to 5008

## 📱 Platform Specific

**iOS Simulator:**
```javascript
// Line 28 in src/config/api.js
return `http://localhost:${BACKEND_PORT}/api`;
```

**Android Emulator:**
```javascript
// Line 29 in src/config/api.js
return `http://10.0.2.2:${BACKEND_PORT}/api`;
```

**Physical Device:**
```javascript
// Line 30 (default) - just update LOCAL_IP
return `http://${LOCAL_IP}:${BACKEND_PORT}/api`;
```

---

## ✅ Checklist

- [ ] Docker containers running
- [ ] Mobile config has correct IP
- [ ] Mobile app started
- [ ] Server settings show correct URL
- [ ] Can login from mobile app

**Done!** 🎉

---

For detailed setup, see: `DOCKER_MOBILE_SETUP.md`
