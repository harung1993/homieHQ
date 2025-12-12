# ⚡ Quick Start Guide

Get PropertyPal running in 5 minutes!

## Backend (Docker)

```bash
# 1. Start Docker containers
docker-compose up -d --build

# 2. Check they're running
docker-compose ps

# 3. View logs
docker-compose logs -f backend
```

**Expected:** Backend running on `http://localhost:5008`

---

## Mobile App (Expo)

```bash
# 1. Get your local IP address
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1
# Windows:
ipconfig

# 2. Update API configuration
# Edit: mobile-app/src/config/api.js
# Line 9: Change to YOUR IP address
const LOCAL_IP = '192.168.1.100';  // ← YOUR IP HERE

# 3. Install dependencies
cd mobile-app
npm install

# 4. Start Expo
npx expo start --port 8082

# 5. Scan QR code with Expo Go app on your phone
```

**Expected:** App opens and shows connection prompt

---

## First Time Setup

1. **Open app** → Shows "Backend Not Connected" modal
2. **Tap "Configure Server"** → Goes to Settings
3. **Enter Server URL:** `http://YOUR_IP:5008/api`
   - Replace YOUR_IP with your local IP from step 1
4. **Go back to Home** → Data loads!

---

## What You Have

### Backend (Docker)
✅ Flask API on port 5008
✅ PostgreSQL database
✅ React frontend on port 3000
✅ CORS enabled for mobile

### Mobile App (React Native + Expo)
✅ 6 screens: Home, Properties, Maintenance, Tenants, Finances, Settings
✅ Real API integration (no mock data!)
✅ Connection check on startup
✅ Pull-to-refresh on all screens
✅ Loading, error, and empty states
✅ Authentication context ready
✅ Dark theme with Sky Blue (#38bdf8)

---

## Testing

**Backend Test:**
```bash
curl http://localhost:5008/api/auth/login
# Should return 405 Method Not Allowed (means it's running!)
```

**Mobile Test:**
- Pull down on any screen to refresh
- All 6 tabs should be accessible
- Connection prompt appears if backend is down

---

## Troubleshooting

**"Network request failed"**
- Make sure you're on the same WiFi network
- Verify LOCAL_IP is correct in `src/config/api.js`
- Check firewall isn't blocking port 5008

**"Backend Not Connected" won't go away**
- Verify Docker is running: `docker-compose ps`
- Check backend URL: `http://YOUR_IP:5008/api` (not https!)
- Restart Expo: `Ctrl+C` → `npx expo start --port 8082`

---

## Next Steps

1. ✅ Test all 6 screens
2. ✅ Create test data in backend
3. ✅ Verify data appears in mobile app
4. 📖 See `DEPLOYMENT_CHECKLIST.md` for detailed testing
5. 🚀 See `TESTFLIGHT_BUILD_GUIDE.md` to deploy to iOS

---

**Quick Reference:**

| What | Where | Port |
|------|-------|------|
| Backend API | http://localhost:5008 | 5008 |
| Frontend Web | http://localhost:3000 | 3000 |
| Mobile API Config | mobile-app/src/config/api.js | - |
| Expo Server | exp://YOUR_IP:8082 | 8082 |

---

**Ready to go!** 🎉
