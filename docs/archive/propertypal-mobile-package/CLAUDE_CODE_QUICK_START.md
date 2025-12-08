# PropertyPal Mobile App - Claude Code Quick Start

## 🎯 What You Need to Build
A React Native mobile app for PropertyPal property management system with 6 main screens matching the provided mockups.

## 📁 Files Included
1. **propertypal-mobile-mockups.html** - Visual reference with all screen designs
2. **MOBILE_APP_DEVELOPMENT_GUIDE.md** - Complete development specifications

## 🚀 Getting Started with Claude Code

### Step 1: Review the Mockups
Open `propertypal-mobile-mockups.html` in a browser to see:
- Home Dashboard
- Properties List
- Property Details
- Maintenance Tasks
- Finances Overview
- Tenants Management

### Step 2: Initial Prompt for Claude Code

```
I need to build a React Native mobile app based on the provided mockups 
(propertypal-mobile-mockups.html). Please:

1. Create the initial React Native project structure
2. Set up React Navigation with bottom tabs
3. Create the theme file with the colors from the mockups:
   - Primary: #38bdf8 (Sky Blue)
   - Background: #0f172a (Dark)
   - Card Background: #1e293b
4. Create placeholder screens for all 6 main screens
5. Set up the bottom tab navigation

Reference the MOBILE_APP_DEVELOPMENT_GUIDE.md for complete specifications.
```

### Step 3: Build Components (One at a Time)

Ask Claude Code to create components in this order:

```
1. "Create the PropertyCard component matching the mockup design"
2. "Create the StatusBadge component for task priorities"
3. "Create the ListItem component for tasks and tenants"
4. "Create the QuickActionButton component for the home screen"
5. "Create the TabBar component matching the mockup"
```

### Step 4: Build Screens (One at a Time)

```
1. "Build the HomeScreen with welcome card and quick actions, 
   using mock data that matches the mockup"
   
2. "Build the PropertiesScreen with property cards, 
   using the PropertyCard component"
   
3. "Build the PropertyDetailScreen with property info and stats"

4. "Build the MaintenanceScreen organized by urgency levels"

5. "Build the FinancesScreen with income/expense cards"

6. "Build the TenantsScreen with tenant list and lease alerts"
```

### Step 5: Add API Integration

```
"Set up the API service to connect to the PropertyPal backend at:
- Base URL: [your-backend-url]/api
- Implement authentication with JWT
- Create API functions for:
  - fetchProperties()
  - fetchMaintenanceTasks()
  - fetchTransactions()
  - fetchTenants()
"
```

## 🎨 Key Design Elements to Emphasize

When asking Claude Code to build components, mention these:

### Colors
- Sky blue (#38bdf8) for primary actions and active states
- Dark backgrounds (#0f172a, #1e293b)
- Status colors: Red (#ef4444), Orange (#f59e0b), Green (#10b981)

### Layout
- Cards have rounded corners (16-20px radius)
- 16-20px padding inside cards
- 12-16px gaps between cards
- Bottom tab bar with 4 tabs

### Typography
- Bold headers (28px for page titles)
- Semi-bold for card titles (16px)
- Regular for body text (14px)
- Small text for subtitles (12px)

## 💬 Example Conversation Flow with Claude Code

**You**: "I have mockups for a PropertyPal mobile app. Let's start by creating the project structure and theme. Use React Native with bottom tab navigation."

**Claude Code**: [Creates project structure]

**You**: "Now create the PropertyCard component. It should show a property image placeholder, address, city/state/zip, and bedroom/bathroom/sqft stats. Match the design in the mockup."

**Claude Code**: [Creates PropertyCard component]

**You**: "Great! Now build the PropertiesScreen using that PropertyCard component. Show a list of 3 sample properties and add a floating + button in the bottom right."

**Claude Code**: [Creates PropertiesScreen]

**Continue this pattern for each screen and component...**

## 🔧 Useful Commands for Claude Code

```bash
# Create new component
"Create a new component called [ComponentName] in src/components/"

# Add navigation
"Add navigation from PropertiesScreen to PropertyDetailScreen, 
passing the property ID as a parameter"

# Add state management
"Set up a PropertyContext to manage property data across screens"

# Style a component
"Update the StatusBadge to match the exact colors and styling from the mockup"

# Add API integration
"Connect the PropertiesScreen to fetch real data from the API endpoint"
```

## ⚠️ Important Notes

1. **Reference the Mockups**: Always mention "match the mockup design" when asking for UI
2. **Build Incrementally**: Do one screen/component at a time
3. **Test as You Go**: Ask Claude Code to add mock data for testing
4. **Be Specific**: Reference specific screens from the mockup by name
5. **Color Accuracy**: Always use the exact hex colors provided

## 📦 What Claude Code Should Deliver

### Minimum Viable Product (MVP)
- [ ] 6 functional screens matching mockups
- [ ] Navigation between screens
- [ ] Reusable components
- [ ] Theme setup
- [ ] Mock data for testing
- [ ] Basic styling matching mockups

### Full Version
- [ ] Everything in MVP
- [ ] API integration with backend
- [ ] Authentication flow
- [ ] Push notifications
- [ ] Offline support
- [ ] Image upload/camera
- [ ] Pull-to-refresh
- [ ] Loading and error states

## 🎯 Final Checklist

Before considering the app complete, verify:
- ✅ All screens visually match the mockups
- ✅ Colors are exact (#38bdf8 sky blue, #0f172a dark bg)
- ✅ Navigation flows work (tabs + screen navigation)
- ✅ Components are reusable
- ✅ Mock data displays correctly
- ✅ Responsive on different screen sizes
- ✅ Tab bar shows active/inactive states correctly

## 🚀 Ready to Start?

1. Share these files with Claude Code:
   - propertypal-mobile-mockups.html (for visual reference)
   - MOBILE_APP_DEVELOPMENT_GUIDE.md (for detailed specs)
   - This quick start guide

2. Open Claude Code and start with:
   "I need to build a React Native mobile app for PropertyPal based on the mockups 
   I'm sharing. Let's start by creating the project structure with React Navigation 
   and the theme system using sky blue (#38bdf8) as the primary color."

3. Build iteratively, one component/screen at a time

4. Reference the mockup HTML file whenever you need Claude Code to match a specific design

Good luck! 🎉
