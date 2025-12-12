# PropertyPal Mobile App

React Native mobile application for PropertyPal property management system, built with Expo.

## Features

- **Home Dashboard**: Welcome card with quick actions and upcoming tasks
- **Properties List**: Browse all properties with details
- **Property Details**: View individual property information
- **Maintenance Tasks**: Track and manage maintenance by urgency
- **Finances Overview**: Monitor income, expenses, and transactions
- **Tenants Management**: Manage tenants and lease information

## Design

- **Primary Color**: Sky Blue (#38bdf8)
- **Theme**: Dark mode optimized
- **Platform**: iOS-style interface with bottom tab navigation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running the App

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web**: Press `w` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## Project Structure

```
mobile-app/
├── src/
│   ├── components/         # Reusable components
│   │   ├── PropertyCard.js
│   │   ├── StatusBadge.js
│   │   ├── ListItem.js
│   │   ├── QuickActionButton.js
│   │   ├── WelcomeCard.js
│   │   ├── FloatingActionButton.js
│   │   └── SectionHeader.js
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.js
│   │   ├── PropertiesScreen.js
│   │   ├── PropertyDetailScreen.js
│   │   ├── MaintenanceScreen.js
│   │   ├── FinancesScreen.js
│   │   ├── TenantsScreen.js
│   │   └── SettingsScreen.js
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigator.js
│   └── styles/           # Theme and styling
│       └── theme.js
├── assets/               # Images and icons
├── App.js               # Root component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Screens

### 1. Home Dashboard
- Welcome card with personalized greeting
- Quick action buttons (Maintenance, Expenses, Tenants, Documents)
- Upcoming tasks with priority badges

### 2. Properties List
- Scrollable property cards
- Property stats (bedrooms, bathrooms, square footage)
- Floating action button to add properties

### 3. Property Details
- Large property image
- Monthly rent statistics
- Quick info (purchase date, type, status)

### 4. Maintenance Tasks
- Organized by urgency (Urgent, This Week, Scheduled)
- Color-coded badges
- Floating action button to add tasks

### 5. Finances Overview
- Total income summary
- Income/expense cards
- Recent transactions list

### 6. Tenants Management
- Active tenants list
- Lease expiration alerts
- Quick action buttons

## Technologies Used

- **React Native**: Mobile framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **expo-linear-gradient**: Gradient components
- **Axios**: HTTP client (ready for API integration)

## Next Steps

### API Integration
Connect to PropertyPal backend:
- Update API base URL in services
- Implement authentication
- Connect to endpoints:
  - `/api/properties`
  - `/api/maintenance`
  - `/api/finances/transactions`
  - `/api/tenants`

### Additional Features
- User authentication with biometric support
- Push notifications
- Offline data caching
- Image upload for properties
- Real-time updates

## Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Notes

- Currently using mock data for demonstration
- All screens are fully functional with navigation
- Design matches the mockups in `propertypal-mobile-package`
- Ready for backend API integration
