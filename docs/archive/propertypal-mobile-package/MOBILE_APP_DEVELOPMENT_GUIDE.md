# PropertyPal Mobile App Development Guide

## 📱 Project Overview
Develop a React Native mobile application for PropertyPal property management system based on the provided mockups.

## 🎨 Design Reference
See `propertypal-mobile-mockups.html` for complete UI/UX reference with 6 main screens.

## 🎯 Core Features to Implement

### 1. Home Dashboard
**Screen**: Main landing page after login
- Welcome card with user greeting
- Quick action buttons grid (4 buttons):
  - Maintenance
  - Expenses
  - Tenants
  - Documents
- Upcoming tasks list with priority badges (High, Medium, Low, Urgent)
- Task items show: icon, title, property, due date

### 2. Properties List
**Screen**: Overview of all user properties
- Scrollable property cards
- Each card displays:
  - Property image/placeholder
  - Address
  - City, State, ZIP
  - Bedrooms, bathrooms, square footage icons
- Floating "+" button for adding new property
- Tab bar navigation at bottom

### 3. Property Details
**Screen**: Detailed view of single property
- Large property image at top
- Property address and location
- Stats card showing monthly rent with comparison
- Quick info sections:
  - Purchase date
  - Property type
  - Status (Active/Occupied)
- Back button navigation

### 4. Maintenance Tasks
**Screen**: Task management organized by urgency
- Sections:
  - **Urgent**: Red badges, immediate attention
  - **This Week**: Sky blue badges
  - **Scheduled**: Green badges for low priority
- Each task shows:
  - Task icon
  - Task title
  - Property address
  - Due date/time reported
- Floating "+" button to add tasks

### 5. Finances Overview
**Screen**: Financial tracking and transactions
- Total income card (gradient green background)
- Income/Expense summary cards (side by side)
- Recent transactions list:
  - Income items in green with + prefix
  - Expense items in red with - prefix
  - Property address and date for each
- Icons differentiate transaction types

### 6. Tenants Management
**Screen**: Tenant information and lease tracking
- Active tenants list with:
  - Tenant avatar/icon
  - Names
  - Property address
  - Lease expiration date
  - Status checkmark or warning
- "Lease Expiring Soon" alert card (orange border)
- Quick action buttons:
  - Message
  - Add Note
  - Documents

## 🎨 Design System

### Color Palette
```javascript
const colors = {
  primary: '#38bdf8',      // Sky Blue (main brand)
  secondary: '#3b82f6',    // Blue
  background: '#0f172a',   // Dark background
  cardBg: '#1e293b',       // Card background
  cardBorder: '#334155',   // Border color
  textPrimary: '#ffffff',  // White text
  textSecondary: '#94a3b8', // Gray text
  
  // Status colors
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  error: '#ef4444',        // Red
  urgent: '#ef4444',       // Red for urgent
}
```

### Typography
- **Font Family**: -apple-system, SF Pro (iOS), Roboto (Android)
- **Headers**: 
  - Page titles: 28px, bold
  - Section headers: 12px, uppercase, semi-bold
  - Card titles: 16-20px, semi-bold
- **Body Text**:
  - Primary: 14px
  - Secondary/subtitles: 12-13px
  - Labels: 11px

### Component Patterns

#### Property Card
```
┌─────────────────────────────┐
│  [Property Image - 140px]   │
│                             │
├─────────────────────────────┤
│  Property Title (16px bold) │
│  City, State ZIP (13px)     │
│                             │
│  🛏️ 3 bed  🚿 2 bath  📐 ... │
└─────────────────────────────┘
```

#### List Item
```
┌────────────────────────────────────────┐
│  [Icon]  Task Title (14px bold)   [Badge] │
│          Subtitle (12px gray)            │
└────────────────────────────────────────┘
```

#### Status Badge
- Border radius: 12px
- Padding: 4px 10px
- Font size: 11px, bold
- Colors vary by priority

### Navigation
- **Tab Bar** (bottom):
  - Home 🏠
  - Properties 🏘️
  - Finances 💰
  - Settings ⚙️
- Active tab: Sky blue (#38bdf8)
- Inactive tabs: Gray (#64748b)

## 📱 Technical Implementation

### Recommended Stack
```json
{
  "framework": "React Native",
  "navigation": "@react-navigation/native",
  "state": "React Context API or Redux",
  "styling": "React Native StyleSheet or Styled Components",
  "icons": "react-native-vector-icons",
  "api": "axios or fetch",
  "storage": "@react-native-async-storage/async-storage"
}
```

### Screen Structure
```
src/
├── screens/
│   ├── HomeScreen.js
│   ├── PropertiesScreen.js
│   ├── PropertyDetailScreen.js
│   ├── MaintenanceScreen.js
│   ├── FinancesScreen.js
│   └── TenantsScreen.js
├── components/
│   ├── PropertyCard.js
│   ├── TaskItem.js
│   ├── StatusBadge.js
│   ├── QuickActionButton.js
│   └── TabBar.js
├── navigation/
│   └── AppNavigator.js
├── styles/
│   └── theme.js
├── services/
│   └── api.js
└── contexts/
    └── PropertyContext.js
```

### API Integration Points
Connect to existing PropertyPal Flask backend:
- `GET /api/properties` - Fetch all properties
- `GET /api/properties/:id` - Get property details
- `GET /api/maintenance` - Fetch maintenance tasks
- `GET /api/finances/transactions` - Get financial data
- `GET /api/tenants` - Fetch tenant list
- `POST /api/maintenance` - Create new task
- Authentication via JWT tokens

### Key Features to Implement

#### 1. Authentication
- Biometric login (Face ID/Touch ID)
- JWT token storage
- Auto-refresh tokens

#### 2. Push Notifications
- Maintenance task reminders
- Rent payment notifications
- Lease expiration alerts
- Urgent maintenance requests

#### 3. Offline Support
- Cache property data
- Queue actions when offline
- Sync when connection restored

#### 4. Image Handling
- Property photo uploads
- Document camera scanning
- Image optimization

#### 5. Data Refresh
- Pull-to-refresh on list screens
- Real-time updates for critical data
- Background data sync

## 🚀 Development Phases

### Phase 1: Setup & Navigation (Week 1)
- [ ] Initialize React Native project
- [ ] Set up navigation structure
- [ ] Implement tab bar
- [ ] Create screen placeholders
- [ ] Set up theme/styling system

### Phase 2: Core Screens (Week 2-3)
- [ ] Home Dashboard
- [ ] Properties List
- [ ] Property Details
- [ ] Basic API integration

### Phase 3: Feature Screens (Week 4-5)
- [ ] Maintenance Tasks
- [ ] Finances Overview
- [ ] Tenants Management
- [ ] Complete API integration

### Phase 4: Polish & Testing (Week 6)
- [ ] Add animations
- [ ] Implement error handling
- [ ] Add loading states
- [ ] User testing
- [ ] Bug fixes

## 📋 Components Priority List

### High Priority
1. PropertyCard - Used in multiple screens
2. TabBar - Core navigation
3. StatusBadge - Used across task management
4. ListItem - Reusable for tasks, tenants, transactions

### Medium Priority
5. QuickActionButton - Home dashboard
6. StatCard - Finances and property details
7. WelcomeCard - Home dashboard header

### Low Priority
8. FloatingActionButton - Add new items
9. SectionHeader - List separators
10. ImagePlaceholder - When no property photos

## 💡 Development Tips

1. **Start with Static Data**: Build UI first with mock data
2. **Component Library**: Create reusable components before screens
3. **Responsive Design**: Test on multiple device sizes
4. **Dark Mode**: Already designed for dark theme
5. **Accessibility**: Add proper labels and contrast
6. **Performance**: Optimize lists with FlatList/VirtualizedList
7. **Error States**: Add empty states and error handling

## 🔗 Backend Integration

### API Base URL
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

### Authentication Header
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Example API Call
```javascript
const fetchProperties = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
  }
};
```

## 📱 Platform-Specific Notes

### iOS
- Use native navigation bar
- Respect safe area insets
- Follow iOS Human Interface Guidelines
- Use haptic feedback for actions

### Android
- Use Material Design components where appropriate
- Handle Android back button
- Respect system navigation
- Use native shadows and elevations

## 🎯 Success Criteria

The mobile app is considered complete when:
- ✅ All 6 main screens are implemented and match mockups
- ✅ Navigation flows smoothly between screens
- ✅ API integration is working for all endpoints
- ✅ App works offline with cached data
- ✅ Push notifications are functioning
- ✅ Authentication is secure with biometric support
- ✅ App is tested on iOS and Android
- ✅ Performance is smooth with real data
- ✅ UI matches the provided mockups

## 📞 Questions for Claude Code?

When working with Claude Code, provide this document along with the HTML mockup file. Claude Code can:
- Generate the complete project structure
- Create individual components
- Implement API services
- Set up navigation
- Build screens one at a time
- Help with debugging and optimization

Start by asking: "Create a React Native project structure for PropertyPal mobile app based on the mockups and this guide."
