# 🚀 TestFlight Build Guide

Complete guide for building and submitting PropertyPal mobile app to TestFlight.

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com

2. **App Store Connect Setup**
   - Create app in App Store Connect
   - Note your App ID (e.g., `1234567890`)
   - Note your Team ID (found in App Store Connect → Account)

3. **Expo Account**
   - Free account at: https://expo.dev
   - Run: `eas login`

## Step-by-Step Build Process

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Configure EAS (First Time Only)

```bash
cd mobile-app

# Login to Expo
eas login

# Configure EAS (creates eas.json)
eas build:configure
```

### Step 3: Update Production API URL

Before building, update the API URL for production:

**File: `src/config/api.js`**

```javascript
// Change this to your production backend URL
const PRODUCTION_URL = 'https://api.yourdomain.com/api';

export const getApiUrl = () => {
  if (__DEV__) {
    // Development mode logic...
  }

  // Production mode
  return PRODUCTION_URL;
};
```

### Step 4: Build for iOS (TestFlight)

```bash
# Build for iOS production
eas build --platform ios --profile production

# OR build for internal testing first
eas build --platform ios --profile preview
```

**What happens:**
- EAS builds your app on Expo's servers
- Takes 10-20 minutes
- You'll get a download link for the `.ipa` file

### Step 5: Submit to TestFlight

**Option A: Automatic Submission**

```bash
eas submit --platform ios --latest
```

**Option B: Manual Submission**

1. Download the `.ipa` file from EAS build
2. Upload to App Store Connect via Transporter app
3. Process takes 5-10 minutes

### Step 6: Configure TestFlight

1. Go to App Store Connect → TestFlight
2. Add internal testers (up to 100)
3. Add external testers (requires review)
4. Testers get email to install via TestFlight app

## Build Profiles Explained

### Development Profile
```bash
eas build --platform ios --profile development
```
- For development builds with debugging
- Install on simulator

### Preview Profile
```bash
eas build --platform ios --profile preview
```
- For internal testing
- No App Store submission
- Share via direct download link

### Production Profile
```bash
eas build --platform ios --profile production
```
- For TestFlight and App Store
- Optimized, release build

## Complete Workflow

### First Time Setup

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Navigate to mobile app
cd mobile-app

# 3. Login to Expo
eas login

# 4. Update eas.json with your Apple credentials
# Edit: mobile-app/eas.json
# Add your:
# - appleId (your Apple ID email)
# - ascAppId (App Store Connect App ID)
# - appleTeamId (your Apple Team ID)

# 5. Build for iOS
eas build --platform ios --profile production

# 6. Submit to TestFlight
eas submit --platform ios --latest
```

### Subsequent Builds

```bash
# Update version in app.json
# Example: "version": "1.0.1"

# Build and submit
eas build --platform ios --profile production
eas submit --platform ios --latest
```

## Updating eas.json Credentials

Edit `mobile-app/eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABC123XYZ"
      }
    }
  }
}
```

**Where to find these:**
- **appleId**: Your Apple ID email
- **ascAppId**: App Store Connect → App Information → Apple ID
- **appleTeamId**: App Store Connect → Account → Membership

## Environment Variables for Production

Create `.env.production` in mobile-app folder:

```bash
API_URL=https://api.propertypal.com/api
```

Update `src/config/api.js` to use this:

```javascript
import Constants from 'expo-constants';

const PRODUCTION_URL = Constants.expoConfig.extra?.apiUrl || 'https://api.propertypal.com/api';
```

Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.propertypal.com/api"
    }
  }
}
```

## Version Management

Before each build, update version in `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

**Rules:**
- `version`: User-facing version (1.0.0, 1.0.1, 1.1.0)
- `buildNumber`: Internal build number (increments each build)

## Testing Before Production

1. **Local Testing**
   ```bash
   npm start
   # Test on simulator/device
   ```

2. **Preview Build**
   ```bash
   eas build --platform ios --profile preview
   # Install on physical device
   ```

3. **TestFlight Internal Testing**
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios --latest
   # Test with team (up to 100 testers)
   ```

4. **TestFlight External Testing**
   - Add external testers in App Store Connect
   - Requires Beta App Review (1-2 days)

## Common Issues

### Issue: "No Apple ID credentials"

**Fix:**
```bash
# Add credentials interactively
eas build --platform ios --profile production
# EAS will prompt for Apple ID and password
```

### Issue: "Bundle identifier mismatch"

**Fix:**
Ensure `app.json` bundle ID matches App Store Connect:
```json
{
  "ios": {
    "bundleIdentifier": "com.propertypal.mobile"
  }
}
```

### Issue: "Build failed - missing dependencies"

**Fix:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Try build again
eas build --platform ios --profile production
```

### Issue: "Cannot connect to API in production"

**Fix:**
1. Check API URL in `src/config/api.js`
2. Ensure backend server is accessible via HTTPS
3. Check CORS settings on backend
4. Test API URL in browser: `https://api.yourdomain.com/api/auth/login`

## Build Time Estimates

- **EAS Build**: 10-20 minutes
- **App Store Processing**: 5-10 minutes
- **TestFlight Availability**: Immediate after processing
- **Beta Review (External)**: 1-2 days

## Cost

- **Expo Free Plan**:
  - 30 builds/month (shared across all projects)
  - Sufficient for testing

- **Expo Production Plan** ($29/month):
  - Unlimited builds
  - Priority build queue
  - Recommended for production

## Checklist Before Build

- [ ] Updated version in `app.json`
- [ ] Production API URL configured
- [ ] Tested on local device/simulator
- [ ] App icon and splash screen set
- [ ] Bundle identifier matches App Store Connect
- [ ] EAS credentials configured
- [ ] Apple Developer account active
- [ ] App created in App Store Connect

## Commands Cheat Sheet

```bash
# Login to EAS
eas login

# Build iOS (production)
eas build --platform ios --profile production

# Build iOS (preview/testing)
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --latest

# Check build status
eas build:list

# View build logs
eas build:view

# Update credentials
eas credentials
```

## Next Steps After TestFlight

1. **Internal Testing** (Team members)
2. **External Testing** (Beta users)
3. **Fix bugs** based on feedback
4. **Submit to App Store** when ready
5. **App Store Review** (1-3 days)
6. **Release** to production!

---

**Ready to build!** 🚀

For questions: https://docs.expo.dev/build/introduction/
