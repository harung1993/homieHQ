# PropertyPal Mobile - Backend Integration Guide

Complete guide for connecting the mobile app to your PropertyPal Flask backend.

## 📋 Overview

The mobile app is now set up with:
- **Authentication system** (login, register, token management)
- **API service layer** with automatic token refresh
- **Server configuration screen** to set custom API URLs
- **Secure token storage** using AsyncStorage
- **Request interceptors** for auth and error handling

## 🔧 Quick Setup

### Step 1: Start Your Backend Server

```bash
cd backend
source propertypal_env/bin/activate  # or activate your virtual environment
python run.py
```

Your backend should be running on `http://localhost:5000`

### Step 2: Find Your Machine's IP Address

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for your **local IP address** (e.g., `192.168.1.100`)

### Step 3: Update API Configuration

Open `/mobile-app/src/config/api.js` and update line 9:

```javascript
const LOCAL_IP = '192.168.1.100'; // Replace with YOUR IP address
```

### Step 4: Test the Connection

1. Start the mobile app:
```bash
cd mobile-app
npm start
```

2. In the app, navigate to:
   - Login Screen → "⚙️ Server Settings"
   - Or Settings Tab → Server Configuration

3. The current server URL should show your IP address

4. Try logging in with your backend credentials!

## 📱 Testing Different Platforms

### iOS Simulator
```javascript
// In src/config/api.js, line 22:
return 'http://localhost:5000/api';
```

### Android Emulator
```javascript
// In src/config/api.js, line 23:
return 'http://10.0.2.2:5000/api';
```

### Physical Device (Same WiFi Network)
```javascript
// In src/config/api.js, line 24:
return `http://${LOCAL_IP}:5000/api`;  // Update LOCAL_IP at top of file
```

## 🔐 Authentication Flow

### 1. Login Process

```javascript
// User enters credentials on LoginScreen
// App calls: apiService.auth.login(email, password)

// What happens:
// ✓ POST to /api/auth/login
// ✓ Receives access_token and refresh_token
// ✓ Stores tokens in AsyncStorage
// ✓ Sets user state in AuthContext
// ✓ Automatically adds token to future requests
```

### 2. Automatic Token Refresh

```javascript
// When API returns 401 (unauthorized):
// ✓ Automatically calls /api/auth/refresh with refresh_token
// ✓ Gets new access_token
// ✓ Retries original request
// ✓ If refresh fails, logs user out
```

### 3. Logout

```javascript
// User clicks logout
// ✓ Clears all tokens from AsyncStorage
// ✓ Resets user state
// ✓ Redirects to login screen
```

## 🌐 API Endpoints Available

All endpoints from your Flask backend are accessible through `apiService`:

### Auth
```javascript
import apiService from '../services/api';

// Login
const result = await apiService.auth.login(email, password);

// Register
const result = await apiService.auth.register(userData);

// Get current user
const user = await apiService.auth.getCurrentUser();

// Logout
await apiService.auth.logout();
```

### Properties
```javascript
// Get all properties
const properties = await apiService.properties.getAll();

// Get single property
const property = await apiService.properties.getById(id);

// Create property
const newProperty = await apiService.properties.create(propertyData);

// Update property
await apiService.properties.update(id, propertyData);

// Delete property
await apiService.properties.delete(id);
```

### Maintenance
```javascript
// Get all maintenance tasks
const tasks = await apiService.maintenance.getAll();

// Create maintenance task
const task = await apiService.maintenance.create(taskData);

// Update task
await apiService.maintenance.update(id, taskData);
```

### Finances
```javascript
// Get transactions
const transactions = await apiService.finances.getTransactions();

// Get financial summary
const summary = await apiService.finances.getSummary();
```

### Tenants
```javascript
// Get all tenants
const tenants = await apiService.tenants.getAll();

// Create tenant
const tenant = await apiService.tenants.create(tenantData);
```

## 🔄 Updating Screens to Use Real Data

### Example: Properties Screen

**Before (Mock Data):**
```javascript
const mockProperties = [
  { id: 1, address: '123 Maple St', ... }
];
```

**After (Real Data):**
```javascript
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

export default function PropertiesScreen() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await apiService.properties.getAll();
      setProperties(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
}
```

## ⚙️ Server Configuration Features

### In-App Server Settings

Users can configure the API URL directly in the app:

1. **From Login Screen**: Tap "⚙️ Server Settings" at the bottom
2. **From Settings Tab**: Navigate to Settings → Server Configuration

Features:
- View current server URL
- Set custom server URL
- Test connection
- Reset to default
- Helpful examples for different platforms

### Custom URL Storage

Custom URLs are stored persistently:
```javascript
// Save custom URL
await apiService.settings.setCustomApiUrl('http://192.168.1.100:5000/api');

// Get custom URL
const url = await apiService.settings.getCustomApiUrl();

// Clear custom URL
await apiService.settings.clearCustomApiUrl();
```

## 🚨 Error Handling

The API service includes comprehensive error handling:

```javascript
try {
  const result = await apiService.properties.getAll();
} catch (error) {
  if (error.response) {
    // Server responded with error
    const message = error.response.data.error || 'Request failed';
    Alert.alert('Error', message);
  } else if (error.request) {
    // No response received
    Alert.alert('Network Error', 'Could not connect to server');
  } else {
    // Other errors
    Alert.alert('Error', error.message);
  }
}
```

## 📝 Next Steps

### 1. Update Screens with Real Data

For each screen, replace mock data with API calls:

- [ ] HomeScreen - Get dashboard data
- [ ] PropertiesScreen - Load properties
- [ ] PropertyDetailScreen - Load property details
- [ ] MaintenanceScreen - Load maintenance tasks
- [ ] FinancesScreen - Load financial data
- [ ] TenantsScreen - Load tenants

### 2. Add Loading States

```javascript
{loading ? (
  <ActivityIndicator size="large" color={colors.primary} />
) : (
  // Your content
)}
```

### 3. Add Pull-to-Refresh

```javascript
import { RefreshControl } from 'react-native';

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
    />
  }
>
```

### 4. Handle Empty States

```javascript
{properties.length === 0 ? (
  <EmptyState message="No properties found" />
) : (
  // List properties
)}
```

## 🔒 Security Considerations

1. **Tokens are stored securely** in AsyncStorage (encrypted on device)
2. **HTTPS recommended** for production
3. **Tokens automatically refresh** before expiration
4. **Sensitive data never logged** in production builds

## 🐛 Troubleshooting

### "Network Error" or "Could not connect to server"

**Check:**
1. Backend server is running (`python run.py`)
2. Firewall allows connections on port 5000
3. Phone/emulator is on same WiFi network (for physical devices)
4. IP address in config is correct
5. URL includes `/api` at the end

### "401 Unauthorized" errors

**Check:**
1. User is logged in
2. Token hasn't expired
3. Backend JWT settings match

### iOS Simulator can't connect

**Try:**
- Use `http://localhost:5000/api` instead of IP address
- Check macOS firewall settings

### Android Emulator can't connect

**Try:**
- Use `http://10.0.2.2:5000/api` (special emulator IP)
- Check that backend allows connections from 10.0.2.2

## 📚 Additional Resources

### Files Created for Backend Integration:

1. **`src/config/api.js`** - API configuration and endpoints
2. **`src/services/api.js`** - API service with all methods
3. **`src/context/AuthContext.js`** - Authentication state management
4. **`src/screens/LoginScreen.js`** - Login UI
5. **`src/screens/ServerSettingsScreen.js`** - Server configuration UI

### Key Dependencies:

- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Secure storage
- `@react-navigation/native` - Navigation
- `expo-linear-gradient` - UI gradients

## 🎯 Testing Checklist

- [ ] Backend server running
- [ ] IP address configured correctly
- [ ] Can access login screen
- [ ] Can configure server URL in settings
- [ ] Can login with valid credentials
- [ ] Can see user data after login
- [ ] Can load properties from backend
- [ ] Tokens refresh automatically
- [ ] Can logout successfully

## 💡 Tips

1. **Use demo account** from your backend's seed data for testing
2. **Test on WiFi** first before trying cellular
3. **Check backend logs** to see incoming requests
4. **Use React Native Debugger** to inspect network requests
5. **Enable DEMO_MODE** in backend for easier testing

---

**Ready to integrate!** The mobile app is now fully prepared to communicate with your PropertyPal backend. Follow the steps above to get started! 🚀
