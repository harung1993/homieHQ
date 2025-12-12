# PropertyPal Mobile - Quick Start Guide

## Running the App

The PropertyPal mobile app is built with Expo and is ready to test!

### Start the Development Server

From the project root directory:

```bash
cd mobile-app
npm start
```

Or if port 8081 is in use:

```bash
cd mobile-app
npx expo start --port 8082
```

### Testing Options

Once the server is running, you have several options:

1. **iOS Simulator** (Mac only)
   - Press `i` in the terminal
   - Requires Xcode to be installed

2. **Android Emulator**
   - Press `a` in the terminal
   - Requires Android Studio to be installed

3. **Physical Device**
   - Install the **Expo Go** app from App Store or Google Play
   - Scan the QR code shown in the terminal

4. **Web Browser**
   - Press `w` in the terminal
   - Opens in your default browser

## What You'll See

The app includes 6 fully functional screens:

1. **Home** - Dashboard with quick actions and tasks
2. **Properties** - List of all properties with details
3. **Property Details** - Individual property information
4. **Maintenance** - Tasks organized by urgency
5. **Finances** - Income, expenses, and transactions
6. **Settings** - App settings and configuration

## Features Implemented

✅ Dark theme with Sky Blue (#38bdf8) branding
✅ Bottom tab navigation
✅ All 6 screens from mockups
✅ Reusable components
✅ Mock data for testing
✅ iOS-style interface

## Next Steps

- **API Integration**: Connect to PropertyPal backend
- **Authentication**: Add login screen
- **Real Data**: Replace mock data with API calls
- **Push Notifications**: Set up notification system
- **Biometric Auth**: Add Face ID/Touch ID support

## Known Issues

- Currently using mock/dummy data
- SafeAreaView warning (non-critical, will be fixed in next update)

## Need Help?

Check the main README.md for detailed documentation and project structure.
