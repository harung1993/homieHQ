# PropertyPal - Clean Folder Structure

## 📁 Project Organization

```
propertypal/
├── backend/                    # Flask Backend API
│   ├── app/                   # Application code
│   │   ├── api/              # API endpoints
│   │   ├── models/           # Database models
│   │   └── services/         # Business logic
│   ├── Dockerfile            # Backend Docker config
│   └── requirements.txt      # Python dependencies
│
├── frontend/                  # React Web Application
│   ├── src/                  # React source code
│   ├── public/               # Static assets
│   ├── Dockerfile            # Frontend Docker config
│   └── package.json          # Node dependencies
│
├── mobile-app/               # React Native Mobile App (Expo)
│   ├── src/                 # Mobile app source
│   │   ├── screens/        # All screens (Home, Properties, etc.)
│   │   ├── components/     # Reusable components
│   │   ├── navigation/     # Navigation setup
│   │   ├── services/       # API service layer
│   │   ├── context/        # Auth & state management
│   │   ├── config/         # API configuration
│   │   └── styles/         # Theme & styling
│   ├── assets/             # Images, icons
│   ├── App.js              # Root component
│   ├── app.json            # Expo config
│   └── package.json        # Dependencies
│
├── nginx/                    # Nginx Reverse Proxy
│   ├── nginx.conf           # Nginx configuration
│   └── Dockerfile           # Nginx Docker config
│
├── docs/                     # Documentation
│   ├── archive/             # Archived files
│   │   └── propertypal-mobile-package/  # Original mockups
│   └── examples/            # Integration examples
│       └── home_assistant/  # Home Assistant integration
│
├── docker-compose.yml        # Docker orchestration
├── .env                      # Environment variables
├── .env.mobile              # Mobile app config reference
│
└── Documentation Files:
    ├── README.md                      # Main project README
    ├── DOCKER.md                      # Docker setup guide
    ├── DOCKER_MOBILE_SETUP.md         # Docker + Mobile integration
    ├── QUICK_START_DOCKER_MOBILE.md   # Quick start guide
    └── PROJECT_STRUCTURE.md           # Project overview
```

## 🎯 Active Development Folders

### Backend (`/backend`)
- Flask API with PostgreSQL
- Runs in Docker on port 5008
- All API endpoints for mobile & web

### Frontend (`/frontend`)
- React web application
- Runs in Docker on port 3000
- Admin dashboard for web browsers

### Mobile App (`/mobile-app`)
- React Native + Expo
- **NOT in Docker** - runs separately
- Connects to backend API
- Submit to TestFlight/App Store

## 📱 Mobile App Structure

```
mobile-app/src/
├── screens/              # All app screens
│   ├── HomeScreen.js
│   ├── PropertiesScreen.js
│   ├── PropertyDetailScreen.js
│   ├── MaintenanceScreen.js
│   ├── FinancesScreen.js
│   ├── TenantsScreen.js
│   ├── SettingsScreen.js
│   ├── LoginScreen.js
│   └── ServerSettingsScreen.js
│
├── components/           # Reusable UI components
│   ├── PropertyCard.js
│   ├── ListItem.js
│   ├── StatusBadge.js
│   ├── WelcomeCard.js
│   └── ...
│
├── navigation/          # App navigation
│   └── AppNavigator.js
│
├── services/           # API integration
│   └── api.js
│
├── context/           # State management
│   └── AuthContext.js
│
├── config/           # Configuration
│   └── api.js
│
└── styles/          # Theming
    └── theme.js
```

## 🗂️ Archived Files

### `/docs/archive/propertypal-mobile-package/`
- Original mobile app mockups (HTML)
- Design specifications
- Development guides
- **Purpose**: Reference for UI/UX design

### `/docs/examples/`
- Home Assistant integration code
- API integration examples
- **Purpose**: Reference implementations

## 🚀 Running Each Component

### Backend (Docker)
```bash
docker-compose up -d
# Runs on: http://localhost:5008
```

### Frontend (Docker)
```bash
docker-compose up -d
# Runs on: http://localhost:3000
```

### Mobile App (Expo - NOT Docker)
```bash
cd mobile-app
npm start
# Opens Expo DevTools
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates backend, frontend, db, nginx |
| `.env` | Environment variables for Docker |
| `.env.mobile` | Mobile app configuration reference |
| `DOCKER_MOBILE_SETUP.md` | Complete Docker + Mobile guide |
| `QUICK_START_DOCKER_MOBILE.md` | 3-minute setup guide |

## 🎨 Development Workflow

1. **Backend development**: Edit in `/backend`, Docker auto-reloads
2. **Frontend development**: Edit in `/frontend`, hot reload enabled
3. **Mobile development**: Edit in `/mobile-app`, Expo hot reload
4. **All connect**: Mobile → Backend (port 5008) ← Frontend

---

**Clean and organized!** ✨
