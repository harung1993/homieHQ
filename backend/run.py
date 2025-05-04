import os
from dotenv import load_dotenv
from flask_migrate import Migrate
load_dotenv()  # Load environment variables from .env file if it exists

# Import configs
from config import DevelopmentConfig, ProductionConfig

# Set environment variable for Flask
os.environ['FLASK_APP'] = 'run.py'

# Only set SQLite path if no DATABASE_URL is provided
if 'DATABASE_URL' not in os.environ and 'SQLALCHEMY_DATABASE_URI' not in os.environ:
    os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'

from app import create_app, db

# Choose config based on environment
flask_env = os.environ.get('FLASK_ENV', 'development')
config_class = ProductionConfig if flask_env == 'production' else DevelopmentConfig

# Create app with the appropriate config
app = create_app(config_class)
migrate = Migrate(app, db)

if __name__ == '__main__':
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
    app.run(host='0.0.0.0', port=5008)