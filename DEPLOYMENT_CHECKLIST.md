# 🚀 PropertyPal Deployment Checklist

Complete checklist to deploy and test your PropertyPal backend + mobile app.

---

## Part 1: Backend Deployment (Docker)

### 1.1 Pre-Deployment Checks

- [ ] Verify `.env` file exists in project root
- [ ] Check `docker-compose.yml` has `MOBILE_CORS_ENABLED=true`
- [ ] Confirm backend port is `5008` in docker-compose.yml
- [ ] Mobile app folder excluded from Docker (check `.dockerignore`)

### 1.2 Get Your Local IP Address

**You need your machine's local IP address for mobile testing.**

**On Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

**Example output:** `192.168.1.100` ← This is your LOCAL_IP

- [ ] **Write down your LOCAL_IP:** `__________________`

### 1.3 Build and Start Docker Containers

```bash
# Navigate to project root
cd /Users/basestation/Documents/Palstacks/Property/homieHQ

# Build and start all containers
docker-compose up -d --build

# Check containers are running
docker-compose ps

# View logs
docker-compose logs -f backend
```

**Expected Output:**
```
✓ Container homiehq-backend-1 running
✓ Container homiehq-frontend-1 running
✓ Container homiehq-db-1 running
```

- [ ] All 3 containers running
- [ ] Backend logs show: `Running on http://0.0.0.0:5008`
- [ ] No errors in logs

### 1.4 Test Backend API

**Test from your browser or terminal:**

```bash
# Test backend is accessible
curl http://localhost:5008/api/auth/login

# Should return 405 Method Not Allowed (this is good! Means server is running)
```

**Or open in browser:**
```
http://localhost:5008/api/auth/login
```

- [ ] Backend responds (even if error, means it's running)
- [ ] Port 5008 is accessible

### 1.5 Check CORS Configuration

```bash
# Check environment variables
docker-compose exec backend env | grep CORS

# Should show:
# MOBILE_CORS_ENABLED=true
```

- [ ] CORS enabled for mobile

---

## Part 2: Mobile App Configuration

### 2.1 Navigate to Mobile App

```bash
cd mobile-app
```

### 2.2 Install Dependencies

```bash
# Install all packages
npm install

# Verify installation
npm list expo react-native @react-navigation/native
```

- [ ] All dependencies installed without errors
- [ ] No peer dependency warnings

### 2.3 Configure API URL

**Edit:** `mobile-app/src/config/api.js`

**Update Line 9 with your LOCAL_IP from step 1.2:**

```javascript
const LOCAL_IP = '192.168.1.100'; // ← CHANGE THIS to your IP
```

**Also check Line 30 - uncomment the right option based on your device:**

```javascript
// For iOS Simulator:
// return `http://localhost:${BACKEND_PORT}/api`;

// For Android Emulator:
// return `http://10.0.2.2:${BACKEND_PORT}/api`;

// For Physical Device (iPhone/Android):
return `http://${LOCAL_IP}:${BACKEND_PORT}/api`; // ← Use this for real devices
```

- [ ] LOCAL_IP updated to your machine's IP
- [ ] Correct device option uncommented

### 2.4 Start Expo

```bash
# Start Expo on port 8082 (avoid port conflicts)
npx expo start --port 8082
```

**Expected Output:**
```
Metro waiting on exp://192.168.1.100:8082
› Press s │ switch to Expo Go
› Press i │ open iOS simulator
› Press a │ open Android emulator
```

- [ ] Metro bundler running
- [ ] QR code displayed
- [ ] No compilation errors

---

## Part 3: Testing on Device

### 3.1 Install Expo Go App

**On your physical device:**

- [ ] **iOS:** Install "Expo Go" from App Store
- [ ] **Android:** Install "Expo Go" from Play Store

### 3.2 Connect to App

**On iOS:**
1. Open Camera app
2. Scan QR code from terminal
3. Tap notification to open in Expo Go

**On Android:**
1. Open Expo Go app
2. Tap "Scan QR code"
3. Scan QR code from terminal

- [ ] App opens in Expo Go
- [ ] No red error screen

### 3.3 First Launch - Backend Connection

**What should happen:**

1. App opens
2. Shows "Backend Server Not Connected" modal
3. Two buttons appear:
   - "Configure Server"
   - "Retry Connection"

- [ ] Connection prompt appears
- [ ] Modal displays correctly

### 3.4 Configure Server (Option A: Via Settings)

1. Tap "Configure Server"
2. Goes to Settings screen
3. Find "Server Settings" section
4. Enter: `http://YOUR_LOCAL_IP:5008/api`
   - Example: `http://192.168.1.100:5008/api`
5. Save settings
6. Return to Home screen

- [ ] Settings screen accessible
- [ ] Server URL field visible
- [ ] URL saved successfully

### 3.5 Retry Connection (Option B: Quick Test)

1. Click "Retry Connection" button
2. If backend is running, connection succeeds
3. Modal closes
4. Home screen loads

- [ ] Connection successful
- [ ] Modal closes
- [ ] Home screen appears

---

## Part 4: Verify All Features

### 4.1 Home Screen

- [ ] Welcome message displays
- [ ] User name shows (if logged in)
- [ ] Quick action buttons visible
- [ ] Upcoming tasks section loads (or shows "No upcoming tasks")
- [ ] Pull to refresh works

### 4.2 Properties Screen

- [ ] Properties list loads from backend
- [ ] Property cards display correctly
- [ ] Shows address, bedrooms, bathrooms
- [ ] Pull to refresh works
- [ ] Empty state shows if no properties

### 4.3 Maintenance Screen

- [ ] Tasks load from backend
- [ ] Categorized into: Urgent, This Week, Scheduled
- [ ] Priority badges show correct colors
- [ ] Due dates formatted correctly
- [ ] Pull to refresh works
- [ ] Empty state shows if no tasks

### 4.4 Finances Screen

- [ ] Total income card displays
- [ ] Expenses and net income show
- [ ] Transactions list loads
- [ ] Green for income, red for expenses
- [ ] Pull to refresh works
- [ ] Empty state shows if no transactions

### 4.5 Tenants Screen

- [ ] Tenants list loads
- [ ] Names and properties display
- [ ] Lease expiration warnings show
- [ ] Pull to refresh works
- [ ] Empty state shows if no tenants

### 4.6 Settings Screen

- [ ] Settings screen accessible
- [ ] Server configuration visible
- [ ] User profile information shows (if logged in)

### 4.7 Navigation

- [ ] All 6 tabs work (Home, Properties, Maintenance, Tenants, Finances, Settings)
- [ ] Tab icons highlight when active
- [ ] Navigation smooth between screens

---

## Part 5: Test Data Loading

### 5.1 Create Test Data (Backend)

**Access backend database:**

```bash
# Enter backend container
docker-compose exec backend bash

# Open Python shell
python

# Create test data
from app import create_app, db
from app.models import User, Property, Tenant, MaintenanceRequest

app = create_app()
with app.app_context():
    # Create test user
    user = User(email='test@test.com', name='Test User')
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()

    # Create test property
    property = Property(
        address='123 Test Street',
        city='Boston',
        state='MA',
        zip_code='02101',
        bedrooms=3,
        bathrooms=2,
        square_feet=1500,
        property_type='Single Family',
        user_id=user.id
    )
    db.session.add(property)
    db.session.commit()

    print("Test data created!")
```

- [ ] Test user created
- [ ] Test property created
- [ ] Data appears in mobile app

### 5.2 Verify API Responses

```bash
# Test properties endpoint
curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Copy the access_token from response

# Test getting properties
curl http://localhost:5008/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

- [ ] Login returns token
- [ ] Properties endpoint returns data
- [ ] Mobile app shows the data

---

## Part 6: Common Issues & Fixes

### Issue: "Network request failed" in mobile app

**Cause:** Mobile app can't reach backend server

**Fix:**
1. Verify backend is running: `docker-compose ps`
2. Check you're on same WiFi network
3. Verify LOCAL_IP is correct in `src/config/api.js`
4. Test backend: `curl http://YOUR_IP:5008/api/auth/login`
5. Check firewall isn't blocking port 5008

- [ ] Backend accessible from mobile device

### Issue: "Backend Server Not Connected" modal won't go away

**Cause:** Wrong API URL configured

**Fix:**
1. Check `src/config/api.js` has correct LOCAL_IP
2. Verify port is 5008 (Docker port)
3. Make sure using `http://` not `https://`
4. Restart Expo: `Ctrl+C` then `npx expo start --port 8082`

- [ ] Correct API URL configured

### Issue: Metro bundler shows errors

**Cause:** Missing dependencies or syntax errors

**Fix:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear --port 8082
```

- [ ] Dependencies installed correctly

### Issue: "Cannot find module" errors

**Cause:** Import paths incorrect

**Fix:**
- Verify all files exist in `src/` folder
- Check import statements match file names
- Ensure AuthContext is imported in App.js

- [ ] All imports resolved correctly

### Issue: Data not loading on screens

**Cause:** API service not connected or backend down

**Fix:**
1. Check backend logs: `docker-compose logs backend`
2. Verify CORS enabled: `docker-compose exec backend env | grep CORS`
3. Test API manually: `curl http://localhost:5008/api/properties`
4. Check network tab in React Native Debugger

- [ ] API requests successful

---

## Part 7: Final Verification

### 7.1 Complete Workflow Test

1. [ ] Start Docker backend
2. [ ] Start Expo server
3. [ ] Open app on device
4. [ ] Configure backend connection
5. [ ] Navigate all 6 screens
6. [ ] Pull to refresh on each screen
7. [ ] Create test data in backend
8. [ ] Verify data appears in app
9. [ ] Logout and login again

### 7.2 Performance Check

- [ ] App loads in < 3 seconds
- [ ] Screen transitions smooth
- [ ] No lag when scrolling
- [ ] Images load quickly
- [ ] No memory warnings

### 7.3 Error Handling

- [ ] Graceful handling when backend down
- [ ] Error messages clear and helpful
- [ ] Empty states show correctly
- [ ] Loading spinners appear during fetch

---

## Success Criteria ✅

**Backend:**
- ✅ Docker containers running
- ✅ Backend accessible on port 5008
- ✅ CORS enabled for mobile
- ✅ API returns data correctly

**Mobile App:**
- ✅ Expo running without errors
- ✅ App connects to backend
- ✅ All 6 screens accessible
- ✅ Data loads from backend API
- ✅ Pull to refresh works
- ✅ Empty states display
- ✅ Error handling works

---

## Next Steps After Successful Deployment

1. **Add Authentication Flow**
   - Implement LoginScreen
   - Test login/logout
   - Protected routes

2. **Create/Edit Functionality**
   - Add new properties
   - Create maintenance tasks
   - Add tenants

3. **Build for TestFlight**
   - See `TESTFLIGHT_BUILD_GUIDE.md`
   - Submit to Apple for beta testing

4. **Production Deployment**
   - Deploy backend to cloud (AWS, Heroku, etc.)
   - Update API URL for production
   - Build production version of mobile app

---

**Deployment Status:** [ ] Not Started  [ ] In Progress  [ ] Completed

**Date:** _____________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
