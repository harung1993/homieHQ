# PropertyPal Mobile App - Project Structure

## Directory Structure

```
mobile-app/
├── src/
│   ├── screens/              # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── home/
│   │   │   └── DashboardScreen.js
│   │   ├── properties/
│   │   │   ├── PropertiesListScreen.js
│   │   │   ├── PropertyDetailScreen.js
│   │   │   ├── AddPropertyScreen.js
│   │   │   └── EditPropertyScreen.js
│   │   ├── maintenance/
│   │   │   ├── MaintenanceListScreen.js
│   │   │   ├── MaintenanceDetailScreen.js
│   │   │   └── CreateMaintenanceScreen.js
│   │   ├── documents/
│   │   │   ├── DocumentsListScreen.js
│   │   │   └── DocumentViewerScreen.js
│   │   └── profile/
│   │       ├── ProfileScreen.js
│   │       └── SettingsScreen.js
│   │
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Input.js
│   │   │   ├── Avatar.js
│   │   │   ├── Badge.js
│   │   │   ├── Header.js
│   │   │   └── LoadingSpinner.js
│   │   ├── property/
│   │   │   ├── PropertyCard.js
│   │   │   └── PropertyListItem.js
│   │   ├── maintenance/
│   │   │   ├── MaintenanceCard.js
│   │   │   └── MaintenanceTaskItem.js
│   │   └── documents/
│   │       └── DocumentListItem.js
│   │
│   ├── navigation/           # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── TabNavigator.js
│   │
│   ├── services/             # API services
│   │   ├── api.js            # Axios instance & interceptors
│   │   ├── authService.js
│   │   ├── propertyService.js
│   │   ├── maintenanceService.js
│   │   ├── documentService.js
│   │   └── tenantService.js
│   │
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.js
│   │   ├── PropertyContext.js
│   │   └── ThemeContext.js
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useProperties.js
│   │   ├── useCamera.js
│   │   └── useDocumentPicker.js
│   │
│   ├── utils/                # Utility functions
│   │   ├── dateUtils.js
│   │   ├── formatUtils.js
│   │   ├── validationUtils.js
│   │   └── storageUtils.js
│   │
│   ├── constants/            # App constants
│   │   ├── colors.js
│   │   ├── theme.js
│   │   └── config.js
│   │
│   └── assets/               # Static assets
│       ├── images/
│       │   ├── logo.png
│       │   └── placeholders/
│       └── fonts/
│
├── App.js                    # Root component
├── app.json                  # Expo configuration
├── package.json
└── README.md
```

## Key Features by Screen

### Authentication
- Login with email/password
- Registration with validation
- Password reset
- Biometric authentication (Face ID/Fingerprint)

### Dashboard
- Property summary cards
- Recent maintenance tasks
- Upcoming tasks/reminders
- Quick actions (Add property, Create maintenance task)
- Financial overview widget

### Properties
- List/Grid view of properties
- Property details with photos
- Add/Edit property information
- Set primary residence
- Property-specific documents and maintenance

### Maintenance
- List of all maintenance tasks
- Filter by property, status, priority
- Create task with photo upload
- Task detail view
- Mark tasks as complete
- Recurring task scheduling

### Documents
- Categorized document list
- PDF viewer
- Image viewer
- Document upload with camera
- Search and filter

### Profile & Settings
- User profile management
- App preferences
- Notification settings
- Theme toggle (light/dark)
- About & help

## Tech Stack

- **Framework**: Expo (managed workflow)
- **Navigation**: React Navigation v6
- **State Management**: React Context + Hooks
- **API Client**: Axios
- **UI Components**: Custom components with React Native
- **Storage**: Expo SecureStore (tokens), AsyncStorage (cache)
- **Camera**: Expo Camera & ImagePicker
- **Documents**: Expo DocumentPicker
- **Notifications**: Expo Notifications
- **Authentication**: JWT with secure storage

## Development Workflow

1. Start Expo dev server: `npm start`
2. Run on iOS simulator: `npm run ios`
3. Run on Android emulator: `npm run android`
4. Run on web: `npm run web`

## Environment Configuration

Create a `.env` file for environment variables:
```
API_BASE_URL=https://api.propertypal.com
API_TIMEOUT=30000
```

## Next Steps

1. Set up authentication flow
2. Implement property list and detail screens
3. Add camera integration for photos
4. Implement offline data caching
5. Set up push notifications
6. Add biometric authentication
