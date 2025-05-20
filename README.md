# 🏡 HomieHQ

HomieHQ is a comprehensive property management system that helps homeowners and landlords manage their properties, maintenance tasks, tenants, documents, and finances in one centralized platform.

![HomieHQ Dashboard](https://github.com/harung43/homieHQ/raw/main/frontend/public/dashboard-preview.png)

## 🚀 Features

- **Property Management**: Track all your properties with detailed information
- **Tenant Management**: Store tenant information, leases, and documents
- **Document Management**: Securely store and organize property-related documents
- **Maintenance Tracking**: Log and track maintenance requests and seasonal checklists
- **Financial Management**: Track expenses, income, and generate financial reports
- **Project Planning**: Plan and monitor property improvement projects
- **Appliance Tracking**: Keep records of appliances, warranties, and service history
- **Multi-user Access**: Invite other users with different permission levels

## 🛠️ Tech Stack

- **Backend**: Flask (Python), PostgreSQL, SQLAlchemy
- **Frontend**: React.js, Tailwind CSS
- **Deployment**: Docker, Nginx
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Requirements

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

## 🔧 Development Setup

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/harung43/homieHQ.git
   cd homieHQ
   ```

2. **Set up the backend**
   ```bash
   cd backend
   
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Initialize the database
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   
   # Start the Flask server
   python run.py
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm start
   ```

### Option 2: Docker Development Environment(Recommended)

1. **Create docker-compose.yml**
   ```bash
   cp docker-compose.example docker-compose.yml
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5008/api

## 🚀 Production Deployment

1. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit the .env file with your production settings
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📁 Project Structure

```
HomieHQ/
├── backend/                 # Flask API backend
│   ├── app/                 # Application code
│   ├── migrations/          # Database migrations
│   ├── uploads/             # User uploaded files
│   ├── Dockerfile           # Backend container configuration
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Application entry point
├── frontend/                # React.js frontend
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   ├── Dockerfile           # Production container configuration
│   ├── Dockerfile.dev       # Development container configuration
│   └── package.json         # Node.js dependencies
├── nginx/                   # Nginx configuration for production
│   ├── Dockerfile           # Nginx container configuration
│   ├── nginx.conf           # Nginx server configuration
│   └── build.sh             # Helper script for building Nginx image
├── docker-compose.example   # Example Docker Compose configuration
├── docker-compose.prod.yml  # Production Docker Compose configuration
└── README.md                # This file
```

## 🧰 Useful Commands

### Database Management

```bash
# Reset the database (development only)
cd backend
python reset_app.py --db --force

# Clear uploads
python reset_app.py --uploads --force

# Reset both database and uploads
python reset_app.py --all --force
```

### Docker Commands

```bash
# Start development environment
docker-compose up -d

# Stop development environment
docker-compose down

# View logs
docker-compose logs -f

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

## 📝 API Documentation

The API follows RESTful conventions. Here are the main endpoint groups:

- `/api/auth/*` - Authentication and user management
- `/api/properties/*` - Property CRUD operations
- `/api/documents/*` - Document management
- `/api/maintenance/*` - Maintenance requests
- `/api/appliances/*` - Appliance tracking
- `/api/projects/*` - Project management
- `/api/finances/*` - Financial tracking
- `/api/tenants/*` - Tenant management



## 📜 License

This project is licensed under the HomieHQ Personal Use License - see the LICENSE file for details.

This license allows for personal, non-commercial use only. Commercial use is prohibited without explicit permission.


## 👥 Authors

- **Harun Guna** - *Initial work* - [harung1993](https://github.com/harung1993)

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- UI components by [Tailwind CSS](https://tailwindcss.com/)