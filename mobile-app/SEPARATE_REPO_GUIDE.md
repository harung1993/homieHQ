# Moving Mobile App to Separate Repository

## Why Separate?

The mobile app (`mobile-app/`) is excluded from the main PropertyPal repository because:
- ✅ Independent deployment cycle (App Store/Google Play)
- ✅ Different development workflow (Expo/React Native)
- ✅ Keeps main repo focused on backend/frontend
- ✅ Easier mobile-specific CI/CD

## How to Create Separate Repo

### Step 1: Create New Repository

On GitHub, create a new repository:
- Name: `propertypal-mobile`
- Description: PropertyPal Mobile App (React Native/Expo)
- Private/Public: Your choice

### Step 2: Copy Mobile App Files

```bash
# From the main PropertyPal directory
cd /path/to/PropertyPal

# Copy mobile-app to new location
cp -r mobile-app/ /path/to/propertypal-mobile/

# Navigate to new location
cd /path/to/propertypal-mobile/
```

### Step 3: Initialize Git

```bash
# Initialize new git repository
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: PropertyPal Mobile App"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/propertypal-mobile.git

# Push to GitHub
git push -u origin main
```

### Step 4: Update Backend URL in New Repo

In the new `propertypal-mobile` repo, update:

**File: `src/config/api.js`**

```javascript
// Production URL (update with your actual backend URL)
return 'https://api.propertypal.com/api';
```

### Step 5: Clean Up Main Repo (Optional)

In the main PropertyPal repo, the mobile app is already gitignored, so:

```bash
# In main PropertyPal repo
git status
# Should show mobile-app/ as untracked (which is correct)
```

## What Stays in Main Repo

These documentation files will remain in the main PropertyPal repo for reference:
- `mobile-app/README.md`
- `mobile-app/QUICK_START.md`
- `mobile-app/BACKEND_INTEGRATION_GUIDE.md`
- `mobile-app/BACKEND_CONNECTION_SUMMARY.md`
- `mobile-app/IMPLEMENTATION_SUMMARY.md`
- `mobile-app/ARCHITECTURE.md`
- `mobile-app/SEPARATE_REPO_GUIDE.md` (this file)

The actual mobile app code is excluded via `.gitignore`.

## Repository Structure After Separation

### Main Repo (propertypal)
```
propertypal/
├── backend/           # Flask API
├── frontend/          # React Web App
├── nginx/             # Reverse Proxy
├── docs/              # Documentation
└── mobile-app/        # Only documentation (code excluded)
    ├── README.md
    ├── QUICK_START.md
    └── *.md (guides only)
```

### Mobile Repo (propertypal-mobile)
```
propertypal-mobile/
├── src/               # All mobile source code
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   ├── context/
│   ├── config/
│   └── styles/
├── assets/
├── App.js
├── app.json
├── package.json
└── README.md
```

## Development Workflow

### Backend/Frontend Development
```bash
# Clone main repo
git clone https://github.com/yourusername/propertypal.git
cd propertypal
docker-compose up -d
```

### Mobile Development
```bash
# Clone mobile repo
git clone https://github.com/yourusername/propertypal-mobile.git
cd propertypal-mobile
npm install
npm start
```

## Connection Between Repos

The mobile app connects to the backend via API:
- **Development**: `http://YOUR_IP:5008/api`
- **Production**: `https://api.propertypal.com/api`

Update the API URL in `src/config/api.js` based on environment.

## CI/CD Setup

### Main Repo (Backend/Frontend)
- Docker builds
- Deploy to server
- Database migrations

### Mobile Repo
- Expo builds (EAS)
- TestFlight submissions
- App Store/Google Play releases

## Environment Variables

### Main Repo (.env)
```bash
BACKEND_PORT=5008
POSTGRES_USER=propertypal
POSTGRES_PASSWORD=...
```

### Mobile Repo (.env)
```bash
API_URL=http://192.168.1.100:5008/api
EXPO_PUBLIC_API_URL=http://192.168.1.100:5008/api
```

## Benefits of Separation

✅ **Independent versioning** - Mobile app has own version numbers
✅ **Faster CI/CD** - Mobile builds don't affect backend
✅ **Cleaner permissions** - Different team access if needed
✅ **Smaller repos** - Easier to clone/manage
✅ **Better organization** - Clear separation of concerns

## Deployment

### Backend (Main Repo)
```bash
docker-compose up -d --build
```

### Mobile (Mobile Repo)
```bash
# Development
npm start

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Keeping Docs in Sync

The documentation in `mobile-app/` folder of the main repo should be kept as reference:
- Developers can see mobile app exists
- Backend devs can understand mobile API requirements
- Links between backend and mobile are documented

Update these docs when making major mobile API changes.

---

**Ready to separate!** Follow the steps above to create your mobile app repository. 🚀
