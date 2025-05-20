# HomieHQ: Property Management System

HomieHQ is a comprehensive property management system designed to help homeowners and landlords manage their properties, maintenance tasks, tenants, documents, and finances in one centralized platform.

## Features

- **Property Management**: Track all your properties with detailed information
- **Tenant Management**: Store tenant information, leases, and documents
- **Document Management**: Securely store and organize property-related documents
- **Maintenance Tracking**: Log and track maintenance requests and seasonal checklists
- **Financial Management**: Track expenses, income, and generate financial reports
- **Project Planning**: Plan and monitor property improvement projects
- **Appliance Tracking**: Keep records of appliances, warranties, and service history
- **Multi-user Access**: Invite other users with different permission levels

## Tech Stack

### Backend
- Python 3.9+
- Flask framework
- PostgreSQL database
- SQLAlchemy ORM
- Flask-JWT-Extended for authentication
- Flask-Mail for email notifications

### Frontend
- React.js
- Tailwind CSS for styling
- Axios for API communication

## Installation

### Prerequisites
- Python 3.9+
- Node.js and npm
- PostgreSQL
- Docker and Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/homiehq.git
   cd homiehq
   ```

2. **Set up the backend**
   ```bash
   cd backend
   
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your local configuration
   
   # Initialize the database
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   
   # Run the Flask server
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

### Docker Setup

1. **Using Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up -d
   
   # Stop all services
   docker-compose down
   ```

## Environment Variables

### Backend `.env` file
```
FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=postgresql://username:password@localhost:5432/homiehq
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-email-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

The API follows RESTful conventions. Here are the main endpoint groups:

- `/api/auth/*` - Authentication and user management
- `/api/properties/*` - Property CRUD operations
- `/api/documents/*` - Document management
- `/api/maintenance/*` - Maintenance requests
- `/api/appliances/*` - Appliance tracking
- `/api/projects/*` - Project management
- `/api/finances/*` - Financial tracking
- `/api/tenants/*` - Tenant management

## Database Schema

The application uses the following main models:
- User
- Property
- PropertyUser (many-to-many relationship)
- Document
- Maintenance
- MaintenanceChecklistItem
- Appliance
- Project
- Tenant
- Expense
- Budget
- Settings

## Deployment

### Production Considerations
- Use proper SSL certificates
- Use a production-grade web server like Gunicorn
- Configure a reverse proxy like Nginx
- Set up proper database backups
- Configure email services for production

### Heroku Deployment
```bash
# Add Heroku as a remote
git remote add heroku https://git.heroku.com/your-app-name.git

# Push to Heroku
git push heroku main
```

## Development Commands

### Database Management
```bash
# Reset the database (development only)
python reset_app.py --db --force

# Clear uploads
python reset_app.py --uploads --force

# Reset both database and uploads
python reset_app.py --all --force
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.