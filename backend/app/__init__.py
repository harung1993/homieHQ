# app/__init__.py
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from config import Config
import os

# Initialize extensions outside create_app function
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
mail = Mail()

def create_app(config_class=Config):
    
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Explicitly check and set SQLALCHEMY_DATABASE_URI from environment
    if os.environ.get('SQLALCHEMY_DATABASE_URI'):
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI')
        print(f"Using DB URI from env: {app.config['SQLALCHEMY_DATABASE_URI']}")
    elif not app.config.get('SQLALCHEMY_DATABASE_URI'):
        # Fallback to a default if neither config nor env provides it
        app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://propertypal:propertypal@db:5432/propertypal'
        print(f"Using default DB URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    if os.environ.get('UPLOAD_FOLDER'):
        app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER')
        print(f"Using upload folder from env: {app.config['UPLOAD_FOLDER']}")
    elif not app.config.get('UPLOAD_FOLDER'):
        app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
        print(f"Using default upload folder: {app.config['UPLOAD_FOLDER']}")
        
    app.url_map.strict_slashes = False
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Correct CORS configuration - don't use both CORS(app) and @app.after_request
    '''CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://localhost:3001"],
    "supports_credentials": True,
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})'''

    allowed_origins = os.environ.get('CORS_ALLOWED_ORIGINS', 
                               'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3002,http://frontend:3000')
    origins = allowed_origins.split(',')
    print(f"CORS allowing origins: {origins}")
    CORS(app, resources={r"/*": {
    "origins": origins,
    "supports_credentials": True,
    "allow_headers": ["Content-Type", "Authorization"],
    "expose_headers": ["Content-Type", "Authorization"],  # Add this line
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    mail.init_app(app)

    # Create upload directories - use the configured upload folder
    upload_documents_path = os.path.join(app.config['UPLOAD_FOLDER'], 'documents')
    upload_photos_path = os.path.join(app.config['UPLOAD_FOLDER'], 'documents/photos')
    
    os.makedirs(upload_documents_path, exist_ok=True)
    os.makedirs(upload_photos_path, exist_ok=True)
    
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        # Make sure we're using the absolute path for UPLOAD_FOLDER
        upload_folder = app.config['UPLOAD_FOLDER']
        if not os.path.isabs(upload_folder):
            upload_folder = os.path.join(app.root_path, upload_folder)
            
        full_path = os.path.join(upload_folder, filename)
        print(f"Requested file: {filename}")
        print(f"Full path: {full_path}")
        print(f"File exists: {os.path.exists(full_path)}")
        
        if not os.path.exists(full_path):
            return "File not found", 404
            
        # Extract the directory from the full path
        directory = os.path.dirname(full_path)
        # Extract just the filename part
        basename = os.path.basename(full_path)
        
        return send_from_directory(directory, basename)
   

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint for container orchestration"""
        return jsonify({"status": "healthy"}), 200



    # Register blueprints for API routes
    from app.api.auth import auth_bp
    from app.api.properties import properties_bp
    from app.api.documents import documents_bp
    from app.api.maintenance import maintenance_bp
    from app.api.maintenance_checklist import checklist_bp
    from app.api.appliances import appliances_bp
    from app.api.projects import projects_bp
    from app.api.property_photos import property_photos_bp
    from app.api.finances import finances_bp
    from app.api.users import users_bp
    from app.api.settings import settings_bp
    from app.api.tenants import tenants_bp
    from app.api.property_users import property_users_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(properties_bp, url_prefix='/api/properties')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(maintenance_bp, url_prefix='/api/maintenance')
    app.register_blueprint(checklist_bp)
    app.register_blueprint(appliances_bp, url_prefix='/api/appliances')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(property_photos_bp, url_prefix='/api/property_photos')
    app.register_blueprint(finances_bp, url_prefix='/api/finances')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(tenants_bp, url_prefix='/api/tenants')
    app.register_blueprint(property_users_bp, url_prefix='/api/property-users')
    return app

